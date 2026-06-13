import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { userAPI, expenseAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { RiRobotLine, RiLightbulbLine, RiHeartPulseLine, RiArrowUpLine, RiAlertLine } from 'react-icons/ri'

const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`

export default function Advisor() {
  const [stats, setStats] = useState(null)
  const [expenseStats, setExpenseStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([userAPI.getDashboardStats(), expenseAPI.getStats()])
      .then(([s, e]) => { setStats(s.data.stats); setExpenseStats(e.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const generateAdvice = () => {
    if (!stats) return []
    const advice = []
    const income = stats.monthlyIncome || 0
    const expense = stats.monthlyExpense || 0
    const savings = stats.actualSavings || 0
    const savingsRate = income > 0 ? (savings / income * 100) : 0

    if (savingsRate < 10) advice.push({ type: 'danger', icon: RiAlertLine, title: 'Critical: Low Savings Rate', message: `You're saving only ${savingsRate.toFixed(1)}% of income. Aim for 20%+ to build financial security. Try reducing discretionary spending by ₹${Math.round(income * 0.1).toLocaleString('en-IN')}/month.` })
    else if (savingsRate >= 30) advice.push({ type: 'success', icon: RiArrowUpLine, title: 'Excellent Savings Rate!', message: `Outstanding! You're saving ${savingsRate.toFixed(1)}% of income. Consider channeling surplus into index funds or SIPs for long-term wealth.` })
    else advice.push({ type: 'info', icon: RiLightbulbLine, title: 'Good Progress', message: `You're saving ${savingsRate.toFixed(1)}% — solid! Push to 25-30% by reviewing subscriptions and dining-out expenses.` })

    if (expense > income * 0.8) advice.push({ type: 'warning', icon: RiAlertLine, title: 'High Expense Ratio', message: 'Expenses exceed 80% of income. Review your top 3 spending categories and set category budgets.' })

    advice.push({ type: 'info', icon: RiLightbulbLine, title: '50-30-20 Rule', message: `Ideal split: 50% needs (₹${(income*0.5).toLocaleString('en-IN')}), 30% wants (₹${(income*0.3).toLocaleString('en-IN')}), 20% savings (₹${(income*0.2).toLocaleString('en-IN')}).` })
    advice.push({ type: 'info', icon: RiLightbulbLine, title: 'Emergency Fund', message: 'Maintain 3-6 months of expenses as emergency fund before aggressive investing. Current target: ' + fmt((expense || 30000) * 4) })
    if (stats.healthScore < 50) advice.push({ type: 'warning', icon: RiHeartPulseLine, title: 'Improve Financial Health', message: 'Focus on reducing debt, building savings buffer, and setting measurable goals to boost your health score.' })

    return advice
  }

  const advice = generateAdvice()
  const TYPE_STYLES = { danger: 'border-red-500/30 bg-red-500/10 text-red-400', warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400', success: 'border-brand-500/30 bg-brand-500/10 text-brand-400', info: 'border-blue-500/30 bg-blue-500/10 text-blue-400' }

  const budgetData = stats ? [
    { name: 'Income', amount: stats.monthlyIncome },
    { name: 'Expenses', amount: stats.monthlyExpense },
    { name: 'Savings', amount: stats.actualSavings },
    { name: 'Target', amount: stats.savingsTarget },
  ] : []

  if (loading) return <div className="page-container flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="section-title">AI Financial Advisor</h1>
        <p className="text-gray-400 mt-1 text-sm">Personalized insights based on your financial data</p>
      </div>

      {/* Health Score */}
      <div className="card bg-gradient-to-br from-surface-700 to-surface-800">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#243326" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="10"
                strokeDasharray={`${(stats?.healthScore || 0) * 2.51} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-2xl font-bold text-white">{stats?.healthScore || 0}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1"><RiHeartPulseLine className="text-brand-400" /><span className="font-display font-bold text-white">Financial Health Score</span></div>
            <p className="text-gray-400 text-sm">{stats?.healthScore >= 70 ? 'Your finances are in great shape! Keep building on this foundation.' : stats?.healthScore >= 40 ? 'Good foundation with room to improve. Focus on savings rate and debt reduction.' : 'Needs immediate attention. Review your budget and start emergency fund building.'}</p>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span>Savings Rate: <strong className="text-brand-400">{stats?.monthlyIncome > 0 ? ((stats.actualSavings/stats.monthlyIncome)*100).toFixed(1) : 0}%</strong></span>
              <span>XP: <strong className="text-accent-gold">{stats?.xp || 0}</strong></span>
              <span>Streak: <strong className="text-accent-blue">{stats?.savingsStreak || 0}d</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Advice Cards */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-white flex items-center gap-2"><RiRobotLine className="text-brand-400" />Personalized Recommendations</h2>
        {advice.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className={`border rounded-xl p-4 ${TYPE_STYLES[a.type]}`}>
            <div className="flex items-start gap-3">
              <a.icon className="text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">{a.title}</h3>
                <p className="text-sm text-gray-300">{a.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Budget vs Reality Chart */}
      {budgetData.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-6">Budget Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={budgetData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243326" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px', color: '#f0fdf4' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ML Predictions */}
      {expenseStats?.categoryBreakdown?.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4">Spending Analysis by Category</h3>
          <div className="space-y-3">
            {expenseStats.categoryBreakdown.slice(0, 6).map((cat, i) => {
              const income = stats?.monthlyIncome || 1
              const pct = Math.min(100, (cat.total / income) * 100)
              return (
                <div key={cat._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{cat._id}</span>
                    <div className="flex gap-3">
                      <span className="text-gray-500">{cat.count} txns</span>
                      <span className="text-white font-medium">{fmt(cat.total)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-700 rounded-full">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.6 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
