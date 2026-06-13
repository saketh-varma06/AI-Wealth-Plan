const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true, trim: true },
  productPrice: { type: Number, required: true, min: 0 },
  targetDate: { type: Date, required: true },
  currentSaved: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  category: { type: String, enum: ['Electronics', 'Vehicle', 'Property', 'Education', 'Travel', 'Other'], default: 'Other' },
  image: { type: String },
  notes: { type: String },
  contributions: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    note: String,
  }],
  aiAnalysis: {
    monthlySavingNeeded: Number,
    dailySavingNeeded: Number,
    isAchievable: Boolean,
    achievabilityScore: Number,
    alternativePlans: [{ title: String, description: String, monthlySaving: Number }],
    lastAnalyzed: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
