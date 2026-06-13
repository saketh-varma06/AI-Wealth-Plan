// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, googleAuth, forgotPassword, resetPassword, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
module.exports = router;
