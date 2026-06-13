/**
 * AI Financial Analysis Service
 * Provides intelligent financial insights, predictions, and recommendations
 */

exports.analyzeGoal = ({ productPrice, targetDate, existingSavings = 0, monthlyIncome = 0, monthlySavingsTarget = 0 }) => {
  const now = new Date();
  const target = new Date(targetDate);
  const monthsLeft = Math.max(1, Math.ceil((target - now) / (1000 * 60 * 60 * 24 * 30)));
  const amountNeeded = productPrice - existingSavings;
  const monthlySavingNeeded = Math.ceil(amountNeeded / monthsLeft);
  const dailySavingNeeded = Math.ceil(amountNeeded / (monthsLeft * 30));
  const isAchievable = monthlySavingNeeded <= monthlySavingsTarget;
  const achievabilityScore = Math.min(100, Math.round((monthlySavingsTarget / monthlySavingNeeded) * 100));

  const alternativePlans = [];
  // Plan A: Extend timeline
  if (!isAchievable && monthlySavingsTarget > 0) {
    const extendedMonths = Math.ceil(amountNeeded / monthlySavingsTarget);
    alternativePlans.push({ title: 'Extended Timeline', description: `Save ₹${monthlySavingsTarget.toLocaleString('en-IN')}/month and reach goal in ${extendedMonths} months`, monthlySaving: monthlySavingsTarget });
  }
  // Plan B: Increase savings
  alternativePlans.push({ title: 'Accelerated Plan', description: `Increase savings by ₹${Math.max(0, monthlySavingNeeded - monthlySavingsTarget).toLocaleString('en-IN')} to hit your deadline`, monthlySaving: monthlySavingNeeded });
  // Plan C: EMI
  const emiAmount = Math.ceil(productPrice / 12);
  alternativePlans.push({ title: 'Part-Pay + EMI', description: `Save ₹${existingSavings.toLocaleString('en-IN')} now and finance rest over 12 months at ~₹${emiAmount.toLocaleString('en-IN')}/mo`, monthlySaving: emiAmount });

  return { monthlySavingNeeded, dailySavingNeeded, isAchievable, achievabilityScore, alternativePlans };
};

exports.generateFinancialAdvice = (financialData) => {
  const { monthlyIncome, monthlyExpense, savings, goals, investments } = financialData;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  const expenseRate = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;
  const advice = [];

  if (savingsRate < 10) advice.push({ type: 'warning', title: 'Low Savings Rate', message: `Your savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income.`, priority: 'high' });
  else if (savingsRate >= 30) advice.push({ type: 'success', title: 'Excellent Savings!', message: `You're saving ${savingsRate.toFixed(1)}% of your income — outstanding!`, priority: 'info' });

  if (expenseRate > 80) advice.push({ type: 'danger', title: 'High Expense Ratio', message: 'Your expenses exceed 80% of income. Review discretionary spending to free up budget.', priority: 'high' });

  if (investments.length === 0) advice.push({ type: 'info', title: 'Start Investing', message: 'No investments detected. Consider starting a SIP with as little as ₹500/month for long-term wealth building.', priority: 'medium' });

  if (goals.length === 0) advice.push({ type: 'info', title: 'Set Financial Goals', message: 'Goal-based saving helps you stay focused. Add your first purchase goal to get started!', priority: 'medium' });

  const healthScore = Math.min(100, Math.round(savingsRate * 1.5 + (investments.length > 0 ? 20 : 0) + (goals.length > 0 ? 10 : 0)));

  return { advice, healthScore, savingsRate: savingsRate.toFixed(1), expenseRate: expenseRate.toFixed(1) };
};

exports.predictExpenses = (historicalExpenses) => {
  if (!historicalExpenses || historicalExpenses.length < 2) return null;
  const values = historicalExpenses.map(e => e.total);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const trend = values.length > 1 ? (values[values.length - 1] - values[0]) / values.length : 0;
  const prediction = Math.max(0, avg + trend);
  return { predictedNext: Math.round(prediction), trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable', confidence: Math.min(95, 60 + values.length * 5) };
};
