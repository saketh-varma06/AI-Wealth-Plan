const Expense = require('../models/Expense');
const User = require('../models/User');
const Goal = require('../models/Goal');
const Investment = require('../models/Investment');

exports.generateCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user.id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const expenses = await Expense.find(query).sort('-date');
    const headers = 'Date,Title,Category,Amount,Payment Method,Note\n';
    const rows = expenses.map(e =>
      `"${new Date(e.date).toLocaleDateString()}","${e.title}","${e.category}","${e.amount}","${e.paymentMethod || ''}","${e.note || ''}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(headers + rows);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReportData = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const reportMonth = parseInt(month) || now.getMonth() + 1;
    const reportYear = parseInt(year) || now.getFullYear();
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0);

    const [expenses, user, goals, investments] = await Promise.all([
      Expense.find({ user: req.user.id, date: { $gte: startDate, $lte: endDate } }),
      User.findById(req.user.id),
      Goal.find({ user: req.user.id }),
      Investment.find({ user: req.user.id }),
    ]);

    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const income = user.financialProfile?.monthlyIncome || 0;
    const savings = Math.max(0, income - totalExpense);
    const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);

    res.json({
      success: true,
      report: {
        month: reportMonth, year: reportYear,
        income, totalExpense, savings,
        byCategory, expenses,
        goals: goals.map(g => ({ name: g.productName, price: g.productPrice, saved: g.currentSaved, status: g.status })),
        totalInvested,
        healthScore: Math.min(100, Math.round((savings / Math.max(income, 1)) * 100)),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
