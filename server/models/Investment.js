const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Stock', 'MutualFund', 'SIP', 'FD', 'Gold', 'Crypto', 'Other'], required: true },
  name: { type: String, required: true },
  symbol: { type: String },
  investedAmount: { type: Number, required: true },
  currentValue: { type: Number },
  units: { type: Number },
  buyPrice: { type: Number },
  currentPrice: { type: Number },
  purchaseDate: { type: Date },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  notes: { type: String },
  isSIP: { type: Boolean, default: false },
  sipAmount: { type: Number },
  sipFrequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
