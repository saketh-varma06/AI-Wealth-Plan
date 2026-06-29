const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  googleId: { type: String, sparse: true, unique: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  onboardingCompleted: { type: Boolean, default: false },
  financialProfile: {
    monthlyIncome: { type: Number, default: 0 },
    fixedExpenses: {
      rent: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      emi: { type: Number, default: 0 },
      others: { type: Number, default: 0 },
    },
    existingSavings: { type: Number, default: 0 },
    monthlySavingsTarget: { type: Number, default: 0 },
  },
  badges: [{ type: String }],
  savingsStreak: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
