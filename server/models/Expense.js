const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['Food', 'Travel', 'Shopping', 'Education', 'Bills', 'Health', 'Entertainment', 'Others'],
    required: true,
  },
  date: { type: Date, default: Date.now },
  note: { type: String, trim: true },
  billImage: { type: String },
  isRecurring: { type: Boolean, default: false },
  recurringPeriod: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  tags: [{ type: String }],
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'NetBanking', 'Other'], default: 'Other' },
}, { timestamps: true });

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
