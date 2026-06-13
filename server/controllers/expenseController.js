const Expense = require('../models/Expense');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getExpenses = async (req, res) => {
  try {
    const { category, search, startDate, endDate, page = 1, limit = 20, sort = '-date' } = req.query;
    const query = { user: req.user.id };
    if (category && category !== 'All') query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, expenses, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { title, amount, category, date, note, isRecurring, recurringPeriod, paymentMethod, tags } = req.body;
    const billImage = req.file ? `/uploads/${req.file.filename}` : undefined;
    const expense = await Expense.create({ user: req.user.id, title, amount, category, date, note, billImage, isRecurring, recurringPeriod, paymentMethod, tags });

    // Check overspending
    const user = await User.findById(req.user.id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTotal = await Expense.aggregate([
      { $match: { user: user._id, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlySpend = monthTotal[0]?.total || 0;
    const budget = user.financialProfile?.monthlyIncome - (user.financialProfile?.monthlySavingsTarget || 0);
    if (budget > 0 && monthlySpend > budget * 0.9) {
      await Notification.create({ user: user._id, type: 'alert', title: '⚠️ Budget Alert', message: `You've used ${Math.round(monthlySpend/budget*100)}% of your monthly budget!` });
    }

    // Gamification: XP for logging expenses
    await User.findByIdAndUpdate(req.user.id, { $inc: { xp: 10 } });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExpenseStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [categoryBreakdown, dailySpend, topExpenses] = await Promise.all([
      Expense.aggregate([{ $match: { user: req.user._id, date: { $gte: startOfMonth } } }, { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Expense.aggregate([{ $match: { user: req.user._id, date: { $gte: startOfMonth } } }, { $group: { _id: { $dayOfMonth: '$date' }, total: { $sum: '$amount' } } }, { $sort: { _id: 1 } }]),
      Expense.find({ user: req.user.id }).sort('-amount').limit(5),
    ]);
    res.json({ success: true, categoryBreakdown, dailySpend, topExpenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
