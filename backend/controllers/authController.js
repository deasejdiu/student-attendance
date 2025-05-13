const { User } = require('../models');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/email'); // e thirrëm nga email.js

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      username,
      email,
      password,
      verificationToken
    });

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ message: 'User created. Please check your email to verify.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) return res.status(400).send('Invalid or expired token');

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.send('Email u verifikua me sukses!');
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

module.exports = {
  register,
  verifyEmail
};
