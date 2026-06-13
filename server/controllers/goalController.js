const Goal = require('../models/Goal');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { analyzeGoal } = require('../services/aiService');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort('-createdAt');
    res.json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { productName, productPrice, targetDate, category, notes } = req.body;
    const user = await User.findById(req.user.id);
    const analysis = analyzeGoal({ productPrice, targetDate, existingSavings: user.financialProfile?.existingSavings, monthlyIncome: user.financialProfile?.monthlyIncome, monthlySavingsTarget: user.financialProfile?.monthlySavingsTarget });
    const goal = await Goal.create({ user: req.user.id, productName, productPrice, targetDate, category, notes, aiAnalysis: { ...analysis, lastAnalyzed: new Date() } });
    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addContribution = async (req, res) => {
  try {
    const { amount, note } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    goal.contributions.push({ amount, note });
    goal.currentSaved += amount;
    if (goal.currentSaved >= goal.productPrice) {
      goal.status = 'completed';
      await Notification.create({ user: req.user.id, type: 'achievement', title: '🎉 Goal Achieved!', message: `Congratulations! You've saved enough for "${goal.productName}"!` });
      await User.findByIdAndUpdate(req.user.id, { $inc: { xp: 500 }, $addToSet: { badges: 'goal_achiever' } });
    }
    await goal.save();
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPurchaseImpact = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    const user = await User.findById(req.user.id);
    const income = user.financialProfile?.monthlyIncome || 0;
    const savings = user.financialProfile?.monthlySavingsTarget || 0;
    const remaining = goal.productPrice - goal.currentSaved;
    const recoveryMonths = savings > 0 ? Math.ceil(remaining / savings) : 'N/A';
    res.json({ success: true, impact: {
      productPrice: goal.productPrice,
      currentSaved: goal.currentSaved,
      remaining,
      percentSaved: (goal.currentSaved / goal.productPrice * 100).toFixed(1),
      recoveryMonths,
      monthlyImpact: (remaining / 12).toFixed(0),
      budgetImpactPercent: income > 0 ? ((goal.productPrice / income) * 100).toFixed(1) : 0,
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
