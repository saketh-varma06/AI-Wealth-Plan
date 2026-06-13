import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts'
import { userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { RiArrowUpLine, RiArrowDownLine, RiCoinLine, RiFlag2Line, RiTrophyLine, RiFireLine, RiLineChartLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#ef4444', '#f97316']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const StatCard = ({ title, value, icon: Icon, color, sub, trend }) => (
  <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex items-center justify-between">
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="text-lg" />
      </div>
    </div>
    <p className="font-display text-2xl font-bold text-white">{value}</p>
    {sub && <p className="text-xs text-gray-500">{sub}</p>}
    {trend !== undefined && (
      <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
        {trend >= 0 ? <RiArrowUpLine /> : <RiArrowDownLine />} {Math.abs(trend)}% vs last month
      </div>
    )}
  </motion.div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    userAPI.getDashboardStats().then(r => setStats(r.data.stats)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const pieData = stats?.expenseByCategory?.map(c => ({ name: c._id, value: c.total })) || []
  const trendData = stats?.monthlyTrend?.map(t => ({ name: MONTH_NAMES[t._id.month - 1], amount: t.total })) || []

  return (
    <div className="page-container space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400 mt-1 text-sm">Here's your financial overview</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-surface-800 border border-surface-600 rounded-xl px-4 py-2">
          <RiFireLine className="text-accent-gold" />
          <span className="text-sm text-gray-300 font-medium">{user?.savingsStreak || 0} day streak</span>
        </div>
      </div>

      {/* Health Score Banner */}
      {stats && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card bg-gradient-to-r from-brand-900/40 to-surface-800 border-brand-600/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-gray-400 text-sm">Financial Health Score</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="font-display text-5xl font-bold text-gradient">{stats.healthScore}</span>
                <span className="text-gray-400 mb-1">/100</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.healthScore >= 70 ? '🟢 Excellent financial health' : stats.healthScore >= 40 ? '🟡 Room for improvement' : '🔴 Needs attention'}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="badge bg-brand-500/20 text-brand-400 border border-brand-500/30">Level {stats.level || 1}</div>
              <div className="badge bg-accent-gold/20 text-accent-gold border border-accent-gold/30">⚡ {stats.xp || 0} XP</div>
              {stats.badges?.slice(0, 2).map(b => <div key={b} className="badge bg-accent-purple/20 text-accent-purple border border-accent-purple/30">🏅 {b.replace('_', ' ')}</div>)}
            </div>
          </div>
          <div className="mt-4 h-2 bg-surface-700 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-brand-500 to-accent-teal rounded-full" initial={{ width: 0 }} animate={{ width: `${stats.healthScore}%` }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monthly Income" value={fmt(stats?.monthlyIncome)} icon={RiCoinLine} color="bg-brand-500/20 text-brand-400" />
        <StatCard title="This Month Spent" value={fmt(stats?.monthlyExpense)} icon={RiArrowDownLine} color="bg-red-500/20 text-red-400" />
        <StatCard title="Actual Savings" value={fmt(stats?.actualSavings)} icon={RiArrowUpLine} color="bg-accent-teal/20 text-accent-teal" />
        <StatCard title="Investments" value={fmt(stats?.totalCurrentValue)} icon={RiLineChartLine} color="bg-accent-blue/20 text-accent-blue" sub={stats?.investmentGain > 0 ? `+${fmt(stats.investmentGain)} gain` : undefined} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expense Pie */}
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-6">Expenses by Category</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px', color: '#f0fdf4' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="text-gray-400">{item.name}</span></div>
                    <span className="text-gray-300 font-medium">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No expenses this month</div>}
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-6">6-Month Spending Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243326" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px', color: '#f0fdf4' }} />
              <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goals & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Active Goals</h3>
            <Link to="/goals" className="text-sm text-brand-400 hover:text-brand-300">View all →</Link>
          </div>
          {stats?.activeGoals > 0 ? (
            <p className="text-gray-400 text-sm">You have <span className="text-brand-400 font-semibold">{stats.activeGoals} active goal{stats.activeGoals !== 1 ? 's' : ''}</span>. Keep saving! 💪</p>
          ) : (
            <div className="text-center py-6">
              <RiFlag2Line className="text-4xl text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No active goals yet.</p>
              <Link to="/goals" className="text-brand-400 text-sm hover:text-brand-300">Set your first goal →</Link>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Add Expense', to: '/expenses', color: 'text-brand-400' },
              { label: 'New Goal', to: '/goals', color: 'text-accent-gold' },
              { label: 'Add Investment', to: '/investments', color: 'text-accent-blue' },
              { label: 'View Reports', to: '/reports', color: 'text-accent-purple' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="flex items-center justify-between p-3 rounded-xl bg-surface-700 hover:bg-surface-600 transition-all group">
                <span className="text-sm text-gray-300 group-hover:text-white">{a.label}</span>
                <span className={`text-sm ${a.color}`}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
