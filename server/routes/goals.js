// routes/goals.js
const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoal, deleteGoal, addContribution, getPurchaseImpact } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
router.get('/', protect, getGoals);
router.post('/', protect, createGoal);
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);
router.post('/:id/contribute', protect, addContribution);
router.get('/:id/impact', protect, getPurchaseImpact);
module.exports = router;
