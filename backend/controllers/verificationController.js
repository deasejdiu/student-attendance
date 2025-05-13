const { User } = require('../models');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'your-email-password-or-app-password'
  }
});

exports.sendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    await user.save();

    const verificationLink = `http://localhost:3000/api/verify-email?token=${token}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
    });

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal error' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal error' });
  }
};
