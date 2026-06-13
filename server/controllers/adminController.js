const User = require('../models/User');
const Expense = require('../models/Expense');
const Goal = require('../models/Goal');

exports.getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalExpenses, totalGoals, recentUsers] = await Promise.all([
      User.countDocuments(),
      Expense.countDocuments(),
      Goal.countDocuments(),
      User.find().sort('-createdAt').limit(10).select('name email createdAt role level'),
    ]);
    const expenseTotal = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const usersByMonth = await User.aggregate([
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    res.json({ success: true, stats: { totalUsers, totalExpenses, totalGoals, totalExpenseAmount: expenseTotal[0]?.total || 0, recentUsers, usersByMonth } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
