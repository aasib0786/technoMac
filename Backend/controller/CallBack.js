const { CallBack } = require('../models/CallBack');
const sendEmail = require('../utils/sendEmail');

// ─────────────────────────────────────────────────────────────
// CREATE  →  POST /api/callback
// Body: name, country, state, mobileNumber, email,
//       date, time, description
// ─────────────────────────────────────────────────────────────
exports.createCallBack = async (req, res) => {
    try {
        const { name, country, state, mobileNumber, email, date, time, description } = req.body;

        // ── Required field validation ──────────────────────────
        if (!name)         return res.status(400).json({ success: false, message: 'Name is required' });
        if (!state)        return res.status(400).json({ success: false, message: 'State is required' });
        if (!mobileNumber) return res.status(400).json({ success: false, message: 'Mobile number is required' });
        if (!email)        return res.status(400).json({ success: false, message: 'Email is required' });
        if (!date)         return res.status(400).json({ success: false, message: 'Date is required' });
        if (!time)         return res.status(400).json({ success: false, message: 'Time is required' });

        const callBack = await CallBack.create({
            name,
            country: country || 'IN - India',
            state,
            mobileNumber,
            email,
            date,
            time,
            description: description || ''
        });

        // ── Email to USER ──────────────────────────────────────
        const userEmailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                     style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:#1a1a2e;padding:30px 40px;text-align:center;">
                    <h1 style="margin:0;color:#e63946;font-size:28px;letter-spacing:2px;">TECHNO<span style="color:#fff;">MAC</span></h1>
                    <p style="margin:6px 0 0;color:#aaa;font-size:13px;">Medical Systems Pvt. Ltd.</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">✅ Call Back Request Received!</h2>
                    <p style="margin:0 0 20px;color:#444;font-size:15px;line-height:1.7;">
                      Hi <strong>${name}</strong>,<br/>
                      Thank you for reaching out to <strong>Technomac</strong>!
                      We have received your call back request and our team will get back to you within <strong>24 hours</strong>.
                    </p>
                    <!-- Details Table -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                           style="background:#f8f8f8;border-radius:8px;border:1px solid #e8e8e8;margin-bottom:24px;">
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#888;font-size:13px;font-weight:bold;width:40%;">Scheduled Date</td>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#1a1a2e;font-size:14px;">${date}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#888;font-size:13px;font-weight:bold;">Scheduled Time</td>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#1a1a2e;font-size:14px;">${time}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#888;font-size:13px;font-weight:bold;">Mobile Number</td>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#1a1a2e;font-size:14px;">${mobileNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;color:#888;font-size:13px;font-weight:bold;">State</td>
                        <td style="padding:12px 20px;color:#1a1a2e;font-size:14px;">${state}</td>
                      </tr>
                    </table>
                    ${description ? `<p style="margin:0 0 20px;color:#555;font-size:14px;"><strong>Your Message:</strong><br/>${description}</p>` : ''}
                    <p style="margin:0;color:#666;font-size:13px;">
                      If you have any urgent queries, feel free to call us at <strong>+91 9311125574</strong>.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                    <p style="margin:0;color:#888;font-size:12px;line-height:1.6;">
                      © ${new Date().getFullYear()} Technomac Medical Systems Pvt. Ltd.<br/>
                      Plot No-88, Pocket-L, Sector 1, Bawana Industrial Area, DSIIDC Sub-city, New Delhi-110039
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>`;

        sendEmail(email, '✅ Your Call Back Request - Technomac', userEmailHtml).catch(err => {
            console.error('Error sending user email:', err);
        });

        // ── Email to ADMIN ─────────────────────────────────────
        const adminEmailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                     style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:#1a1a2e;padding:30px 40px;text-align:center;">
                    <h1 style="margin:0;color:#e63946;font-size:26px;letter-spacing:2px;">TECHNO<span style="color:#fff;">MAC</span></h1>
                    <p style="margin:6px 0 0;color:#aaa;font-size:13px;">Admin Notification</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">📞 New Call Back Request</h2>
                    <p style="margin:0 0 20px;color:#444;font-size:15px;">A new call back request has been submitted. Details below:</p>
                    <!-- Details Table -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                           style="background:#f8f8f8;border-radius:8px;border:1px solid #e8e8e8;margin-bottom:24px;">
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#888;font-size:13px;font-weight:bold;width:35%;">Name</td>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#1a1a2e;font-size:14px;font-weight:bold;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#888;font-size:13px;font-weight:bold;">Email</td>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#1a1a2e;font-size:14px;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#888;font-size:13px;font-weight:bold;">Mobile</td>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#1a1a2e;font-size:14px;">${mobileNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#888;font-size:13px;font-weight:bold;">Country</td>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#1a1a2e;font-size:14px;">${country || 'IN - India'}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#888;font-size:13px;font-weight:bold;">State</td>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#1a1a2e;font-size:14px;">${state}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#888;font-size:13px;font-weight:bold;">Date</td>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#1a1a2e;font-size:14px;">${date}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#888;font-size:13px;font-weight:bold;">Time</td>
                        <td style="padding:12px 20px;border-bottom:1px solid #e8e8e8;color:#1a1a2e;font-size:14px;">${time}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 20px;color:#888;font-size:13px;font-weight:bold;">Description</td>
                        <td style="padding:12px 20px;color:#1a1a2e;font-size:14px;">${description || '—'}</td>
                      </tr>
                    </table>
                    <p style="margin:0;color:#666;font-size:13px;">
                      Submitted at: <strong>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</strong>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                    <p style="margin:0;color:#888;font-size:12px;">
                      © ${new Date().getFullYear()} Technomac Medical Systems Pvt. Ltd. — Admin Notification System
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>`;

        sendEmail(process.env.EMAIL_USER, `📞 New Call Back Request from ${name}`, adminEmailHtml).catch(err => {
            console.error('Error sending admin email:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Call back request submitted successfully! We will contact you within 24 hours.',
            data: callBack
        });

    } catch (error) {
        console.error('createCallBack error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// GET ALL  →  GET /api/callback
// Admin Panel: fetch all call back requests (latest first)
// ─────────────────────────────────────────────────────────────
exports.getAllCallBacks = async (req, res) => {
    try {
        const callBacks = await CallBack.find().sort({ createdAt: -1 }).lean();

        res.status(200).json({
            success: true,
            count: callBacks.length,
            data: callBacks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE  →  GET /api/callback/:id
// ─────────────────────────────────────────────────────────────
exports.getCallBackById = async (req, res) => {
    try {
        const callBack = await CallBack.findById(req.params.id).lean();
        if (!callBack) {
            return res.status(404).json({ success: false, message: 'Call back request not found' });
        }
        res.status(200).json({ success: true, data: callBack });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// UPDATE STATUS  →  PATCH /api/callback/:id/status
// Admin Panel: update status → pending | contacted | closed
// ─────────────────────────────────────────────────────────────
exports.updateCallBackStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowed = ['pending', 'contacted', 'closed'];
        if (!status || !allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${allowed.join(', ')}`
            });
        }

        const callBack = await CallBack.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after' }
        );
        if (!callBack) {
            return res.status(404).json({ success: false, message: 'Call back request not found' });
        }

        res.status(200).json({
            success: true,
            message: `Status updated to "${status}"`,
            data: callBack
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// DELETE  →  DELETE /api/callback/:id
// Admin Panel: remove a request permanently
// ─────────────────────────────────────────────────────────────
exports.deleteCallBack = async (req, res) => {
    try {
        const callBack = await CallBack.findByIdAndDelete(req.params.id);
        if (!callBack) {
            return res.status(404).json({ success: false, message: 'Call back request not found' });
        }
        res.status(200).json({ success: true, message: 'Call back request deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// UPDATE ALL FIELDS  →  PUT /api/callback/:id
// Admin Panel: update details of a callback request
// ─────────────────────────────────────────────────────────────
exports.updateCallBack = async (req, res) => {
    try {
        const { name, country, state, mobileNumber, email, date, time, description, status } = req.body;

        const updatedData = {};
        if (name !== undefined) updatedData.name = name;
        if (country !== undefined) updatedData.country = country;
        if (state !== undefined) updatedData.state = state;
        if (mobileNumber !== undefined) updatedData.mobileNumber = mobileNumber;
        if (email !== undefined) updatedData.email = email;
        if (date !== undefined) updatedData.date = date;
        if (time !== undefined) updatedData.time = time;
        if (description !== undefined) updatedData.description = description;
        if (status !== undefined) {
            const allowed = ['pending', 'contacted', 'closed'];
            if (!allowed.includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status value' });
            }
            updatedData.status = status;
        }

        const callBack = await CallBack.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!callBack) {
            return res.status(404).json({ success: false, message: 'Call back request not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Call back request updated successfully',
            data: callBack
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

