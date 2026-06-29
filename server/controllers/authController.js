const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { verifyGoogleAccessToken } = require('../utils/googleAuth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, onboardingCompleted: user.onboardingCompleted, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, onboardingCompleted: user.onboardingCompleted, avatar: user.avatar, level: user.level, xp: user.xp, badges: user.badges } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Google access token is required' });
    }

    const { googleId, email, name, avatar } = await verifyGoogleAccessToken(accessToken);

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ name, email, googleId, avatar, isVerified: true, onboardingCompleted: false });
    } else {
      if (!user.googleId) user.googleId = googleId;
      user.isVerified = true;
      if (avatar && !user.avatar) user.avatar = avatar;
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        badges: user.badges,
      },
    });
  } catch (error) {
    const status = error.message.includes('not configured') ? 503 : 401;
    res.status(status).json({ success: false, message: error.message || 'Google authentication failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({ to: user.email, subject: 'Password Reset - AI Wealth Planner', html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 30 minutes.</p>` });
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = generateToken(user._id);
    res.json({ success: true, token, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, avatar }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
