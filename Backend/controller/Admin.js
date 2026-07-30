const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { Admin } = require('../models/Admin');
const sendEmail = require('../utils/sendEmail');

// ─── Helper: 6 digit OTP generate karo ────────────────────────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── Helper: OTP ko hash karo (DB mein plain text nahi jayega) ────
const hashOTP = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

// ══════════════════════════════════════════════════════════════════
// REGISTER — OTP bhejo, account unverified rakho
// ══════════════════════════════════════════════════════════════════
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin && existingAdmin.isVerified) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ OTP ki jagah secure random token banao
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (existingAdmin && !existingAdmin.isVerified) {
      existingAdmin.password = hashedPassword;
      existingAdmin.otp = crypto
        .createHash('sha256')
        .update(verifyToken)
        .digest('hex');
      existingAdmin.otpExpires = expiry;
      await existingAdmin.save();
    } else {
      await Admin.create({
        email,
        password: hashedPassword,
        otp: crypto.createHash('sha256').update(verifyToken).digest('hex'),
        otpExpires: expiry,
      });
    }

    // ✅ Verification link banao
    const verifyURL = `${req.protocol}://${req.get('host')}/api/admin/verify-email/${verifyToken}`;

    await sendEmail(
      email,
      'Verify Your Email',
      `
        <h2>Email Verification</h2>
        <p>Neeche diye link pe click karo to verify your email (10 minutes valid):</p>
        <a href="${verifyURL}" style="
          display:inline-block;
          padding:12px 24px;
          background:#4F46E5;
          color:white;
          border-radius:6px;
          text-decoration:none;
          font-size:16px;
          margin:16px 0;
        ">Verify Email</a>
        <p>Ya copy karo: ${verifyURL}</p>
        <p>Agar aapne register nahi kiya toh ignore karo.</p>
      `,
    );

    res.status(201).json({
      success: true,
      message: 'Verification link aapki email pe bhej diya gaya hai.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════
// VERIFY OTP — OTP sahi hai toh account activate karo
// ══════════════════════════════════════════════════════════════════
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Token hash karke DB se match karo
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await Admin.findOne({
      otp: hashedToken,
      otpExpires: { $gt: Date.now() }, // expire check
    });

    if (!admin) {
      return res.status(400).json({
        message: 'Link invalid ya expire ho gaya hai. Dobara register karo.',
      });
    }

    // ✅ Verify karo aur fields clean karo
    admin.isVerified = true;
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    // ✅ Browser mein seedha login page pe redirect karo
    res.redirect('https://admin.technomacmedical.com/login?verified=true');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════
// RESEND OTP — User ne OTP miss kar diya
// ══════════════════════════════════════════════════════════════════
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (admin.isVerified) {
      return res.status(400).json({ message: 'Email already verified hai' });
    }

    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000;

    admin.otp = hashOTP(otp);
    admin.otpExpires = expiry;
    await admin.save();

    await sendEmail(
      email,
      'Naya OTP — Email Verification',
      `
        <h2>Naya OTP</h2>
        <p>Aapka naya OTP neeche hai. Ye <strong>10 minutes</strong> tak valid hai:</p>
        <h1 style="letter-spacing:8px; color:#4F46E5;">${otp}</h1>
      `,
    );

    res.status(200).json({
      success: true,
      message: 'Naya OTP bhej diya gaya hai.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════
// LOGIN — Sirf verified admin login kar sakta hai
// ══════════════════════════════════════════════════════════════════
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // ⛔ Unverified admin ko login mat karne do
    if (!admin.isVerified) {
      return res.status(403).json({
        message: 'Email verify nahi hai. Pehle OTP verify karo.',
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Password' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    // Password response mein mat bhejo
    const { password: _, otp: __, ...adminData } = admin.toObject();

    res.status(200).json({
      success: true,
      token,
      admin: adminData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ══════════════════════════════════════════════════════════════════
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (!admin.isVerified) {
      return res.status(403).json({ message: 'Email verify nahi hai' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    admin.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    admin.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await admin.save();

    const resetURL = `https://admin.technomacmedical.com/admin/reset-password/${resetToken}`;
    // const resetURL = `http://localhost:3001/admin/reset-password/${resetToken}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `
        <h2>Password Reset</h2>
        <p>Neeche diye link pe click karo (15 minutes valid hai):</p>
        <a href="${resetURL}" style="color:#4F46E5;">${resetURL}</a>
        <p>Agar aapne request nahi kiya toh ignore karo.</p>
      `,
    );

    res.status(200).json({
      success: true,
      message: 'Password reset link email pe bhej diya gaya hai.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════
// RESET PASSWORD
// ══════════════════════════════════════════════════════════════════
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res
        .status(400)
        .json({ message: 'Token invalid ya expire ho gaya hai' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully reset ho gaya.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
