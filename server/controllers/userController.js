const User = require('../models/User');
const Notification = require('../models/Notification');

exports.saveOnboarding = async (req, res) => {
  try {
    const { monthlyIncome, fixedExpenses, existingSavings, monthlySavingsTarget } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        financialProfile: { monthlyIncome, fixedExpenses, existingSavings, monthlySavingsTarget },
        onboardingCompleted: true,
      },
      { new: true, runValidators: true }
    );
    // Award first badge
    if (!user.badges.includes('profile_complete')) {
      user.badges.push('profile_complete');
      user.xp += 100;
      await user.save();
      await Notification.create({ user: user._id, type: 'achievement', title: '🎖️ Profile Complete!', message: 'You earned the Profile Complete badge! +100 XP' });
    }
    res.json({ success: true, user, message: 'Financial profile saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFinancialProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, financialProfile: user.financialProfile });
};

exports.updateFinancialProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { financialProfile: req.body }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const Expense = require('../models/Expense');
    const Goal = require('../models/Goal');
    const Investment = require('../models/Investment');
    const user = await User.findById(req.user.id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlyExpenses, totalExpenses, goals, investments] = await Promise.all([
      Expense.aggregate([{ $match: { user: user._id, date: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: user._id } }, { $group: { _id: '$category', total: { $sum: '$amount' } } }]),
      Goal.find({ user: user._id, status: 'active' }),
      Investment.find({ user: user._id }),
    ]);

    const monthlyExpense = monthlyExpenses[0]?.total || 0;
    const income = user.financialProfile?.monthlyIncome || 0;
    const savingsTarget = user.financialProfile?.monthlySavingsTarget || 0;
    const actualSavings = Math.max(0, income - monthlyExpense);
    const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
    const totalCurrentValue = investments.reduce((s, i) => s + (i.currentValue || i.investedAmount), 0);

    // Financial health score
    const savingsRatio = income > 0 ? actualSavings / income : 0;
    const healthScore = Math.min(100, Math.round(savingsRatio * 60 + (totalCurrentValue > totalInvested ? 20 : 0) + (goals.length > 0 ? 20 : 0)));

    // Expense by month (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrend = await Expense.aggregate([
      { $match: { user: user._id, date: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        monthlyIncome: income,
        monthlyExpense,
        actualSavings,
        savingsTarget,
        totalInvested,
        totalCurrentValue,
        investmentGain: totalCurrentValue - totalInvested,
        healthScore,
        activeGoals: goals.length,
        expenseByCategory: totalExpenses,
        monthlyTrend,
        level: user.level,
        xp: user.xp,
        badges: user.badges,
        savingsStreak: user.savingsStreak,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
