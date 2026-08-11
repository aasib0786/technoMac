const { Subscriber } = require("../models/Subscriber");
const sendEmail = require("../utils/sendEmail");

// ─────────────────────────────────────────────
// POST /api/subscribe
// Create a new subscriber + send confirmation
// emails to the user and to the admin
// ─────────────────────────────────────────────
exports.createSubscriber = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Check if already subscribed
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ success: false, message: "This email is already subscribed" });
        }

        // Save to DB
        const subscriber = await Subscriber.create({ email });

        // ── Email to USER ──────────────────────────────────────────
        const userEmailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Subscription Confirmed</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                       style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:#1a1a2e;padding:30px 40px;text-align:center;">
                      <h1 style="margin:0;color:#e63946;font-size:28px;letter-spacing:2px;">TECHNO<span style="color:#ffffff;">MAC</span></h1>
                      <p style="margin:6px 0 0;color:#aaaaaa;font-size:13px;">Medical Systems Pvt. Ltd.</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 30px;">
                      <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">🎉 You're now subscribed!</h2>
                      <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.7;">
                        Thank you for subscribing to the <strong>Technomac Newsletter</strong>!<br/>
                        You'll now receive the latest updates on dental equipment, exclusive offers,
                        and clinic setup innovations — straight to your inbox.
                      </p>
                      <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.7;">
                        We're excited to keep you informed. Stay tuned! 🦷
                      </p>

                      <!-- CTA Button -->
                      <div style="text-align:center;margin:24px 0;">
                        <a href="#"
                           style="display:inline-block;background:#e63946;color:#ffffff;text-decoration:none;
                                  padding:14px 36px;border-radius:6px;font-size:15px;font-weight:bold;">
                          Visit Our Website
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
                      <p style="margin:0;color:#888;font-size:12px;line-height:1.6;">
                        © ${new Date().getFullYear()} Technomac Medical Systems Pvt. Ltd. · Plot No-88, Pocket-L,
                        Sector 1, Bawana Industrial Area, DSIIDC Sub-city, New Delhi-110039, India<br/>
                        📞 +91 9311125574 &nbsp;|&nbsp; ✉️ info@dentalloom.com
                      </p>
                      <p style="margin:8px 0 0;color:#aaa;font-size:11px;">
                        You received this email because you subscribed at technomac.in.
                        No spam — only useful updates.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `;

        await sendEmail(
            email,
            "🎉 Welcome to Technomac Newsletter — Subscription Confirmed!",
            userEmailHtml
        );

        // ── Email to ADMIN ─────────────────────────────────────────
        const adminEmailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>New Subscriber Alert</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                       style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:#1a1a2e;padding:30px 40px;text-align:center;">
                      <h1 style="margin:0;color:#e63946;font-size:26px;letter-spacing:2px;">TECHNO<span style="color:#ffffff;">MAC</span></h1>
                      <p style="margin:6px 0 0;color:#aaaaaa;font-size:13px;">Admin Notification</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 30px;">
                      <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;">📬 New Newsletter Subscriber</h2>
                      <p style="margin:0 0 20px;color:#444;font-size:15px;line-height:1.7;">
                        A new user has subscribed to the Technomac newsletter.
                        Here are the details:
                      </p>

                      <!-- Info Table -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                             style="background:#f8f8f8;border-radius:8px;border:1px solid #e8e8e8;margin-bottom:24px;">
                        <tr>
                          <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
                            <span style="color:#888;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Email Address</span>
                          </td>
                          <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
                            <span style="color:#1a1a2e;font-size:15px;font-weight:bold;">${email}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
                            <span style="color:#888;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Subscribed At</span>
                          </td>
                          <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
                            <span style="color:#1a1a2e;font-size:15px;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} (IST)</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:14px 20px;">
                            <span style="color:#888;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Subscriber ID</span>
                          </td>
                          <td style="padding:14px 20px;">
                            <span style="color:#666;font-size:13px;font-family:monospace;">${subscriber._id}</span>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0;color:#666;font-size:13px;">
                        You can view and manage all subscribers in your
                        <a href="#" style="color:#e63946;text-decoration:none;font-weight:bold;">Admin Panel</a>.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
                      <p style="margin:0;color:#888;font-size:12px;">
                        © ${new Date().getFullYear()} Technomac Medical Systems Pvt. Ltd. — Admin Notification System
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `;

        await sendEmail(
            process.env.EMAIL_USER,
            `📬 New Subscriber: ${email}`,
            adminEmailHtml
        );

        res.status(201).json({
            success: true,
            message: "Subscribed successfully! A confirmation email has been sent to you.",
            data: subscriber
        });

    } catch (error) {
        console.error("Subscriber error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET /api/subscribe
// Fetch all subscribers (for Admin Panel)
// ─────────────────────────────────────────────
exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ subscribedAt: -1 }).lean();
        res.status(200).json({
            success: true,
            count: subscribers.length,
            data: subscribers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// DELETE /api/subscribe/:id
// Delete a subscriber by ID (for Admin Panel)
// ─────────────────────────────────────────────
exports.deleteSubscriber = async (req, res) => {
    try {
        const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
        if (!subscriber) {
            return res.status(404).json({ success: false, message: "Subscriber not found" });
        }
        res.status(200).json({ success: true, message: "Subscriber deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};