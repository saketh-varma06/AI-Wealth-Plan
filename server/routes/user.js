const express = require('express');
const router = express.Router();
const { saveOnboarding, getFinancialProfile, updateFinancialProfile, getDashboardStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
router.post('/onboarding', protect, saveOnboarding);
router.get('/financial-profile', protect, getFinancialProfile);
router.put('/financial-profile', protect, updateFinancialProfile);
router.get('/dashboard-stats', protect, getDashboardStats);
module.exports = router;
