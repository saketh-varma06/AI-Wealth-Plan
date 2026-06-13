import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'
import { reportAPI } from '../services/api'
import { RiDownloadLine, RiFileChartLine, RiCalendarLine } from 'react-icons/ri'

const COLORS = ['#22c55e','#f59e0b','#3b82f6','#8b5cf6','#14b8a6','#ef4444','#f97316']
const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Reports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  useEffect(() => {
    setLoading(true)
    reportAPI.getReportData({ month, year })
      .then(r => setReport(r.data.report))
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false))
  }, [month, year])

  const handleDownloadCSV = async () => {
    setDownloading(true)
    try {
      const { data } = await reportAPI.downloadCSV({ month, year })
      const url = window.URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `expenses-${year}-${month}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('CSV downloaded!')
    } catch { toast.error('Download failed') }
    finally { setDownloading(false) }
  }

  const catData = report ? Object.entries(report.byCategory).map(([name, value]) => ({ name, value })) : []
  const savingsRate = report?.income > 0 ? ((report.savings / report.income) * 100).toFixed(1) : 0
  const expenseRate = report?.income > 0 ? ((report.totalExpense / report.income) * 100).toFixed(1) : 0

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Financial Reports</h1>
          <p className="text-gray-400 text-sm mt-1">Monthly summary and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-800 border border-surface-600 rounded-xl px-3 py-2">
            <RiCalendarLine className="text-gray-400" />
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-transparent text-white text-sm outline-none">
              {MONTHS.map((m, i) => <option key={i} value={i+1} className="bg-surface-800">{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-transparent text-white text-sm outline-none">
              {[2023,2024,2025,2026].map(y => <option key={y} value={y} className="bg-surface-800">{y}</option>)}
            </select>
          </div>
          <button onClick={handleDownloadCSV} disabled={downloading} className="btn-primary flex items-center gap-2">
            <RiDownloadLine />{downloading ? 'Downloading...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : !report ? (
        <div className="card text-center py-16 text-gray-500">No data for selected period</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Income', value: fmt(report.income), color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
              { label: 'Total Expenses', value: fmt(report.totalExpense), color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
              { label: 'Net Savings', value: fmt(report.savings), color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
              { label: 'Health Score', value: `${report.healthScore}/100`, color: 'text-accent-gold', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`card border ${s.bg}`}>
                <p className="text-gray-400 text-xs mb-2">{s.label}</p>
                <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Rates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <p className="text-gray-400 text-sm mb-1">Savings Rate</p>
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-2xl font-bold text-brand-400">{savingsRate}%</span>
                <span className="text-xs text-gray-500">Target: 20%+</span>
              </div>
              <div className="h-2 bg-surface-700 rounded-full">
                <motion.div className="h-full rounded-full bg-brand-500" initial={{ width: 0 }} animate={{ width: `${Math.min(100, savingsRate)}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
            <div className="card">
              <p className="text-gray-400 text-sm mb-1">Expense Rate</p>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-display text-2xl font-bold ${expenseRate > 80 ? 'text-red-400' : 'text-yellow-400'}`}>{expenseRate}%</span>
                <span className="text-xs text-gray-500">Target: &lt;80%</span>
              </div>
              <div className="h-2 bg-surface-700 rounded-full">
                <motion.div className={`h-full rounded-full ${expenseRate > 80 ? 'bg-red-500' : 'bg-yellow-500'}`} initial={{ width: 0 }} animate={{ width: `${Math.min(100, expenseRate)}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {catData.length > 0 && (
              <div className="card">
                <h3 className="font-display font-semibold text-white mb-5">Expense by Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {catData.length > 0 && (
              <div className="card">
                <h3 className="font-display font-semibold text-white mb-5">Category Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={catData} barSize={28} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#243326" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} width={80} />
                    <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px' }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Goals Summary */}
          {report.goals?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-white mb-4">Goals Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-600">
                      {['Goal','Target Price','Saved','Progress','Status'].map(h => <th key={h} className="text-left text-gray-400 font-medium pb-3 pr-4">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700">
                    {report.goals.map((g, i) => (
                      <tr key={i} className="hover:bg-surface-700/30 transition-all">
                        <td className="py-3 pr-4 text-white font-medium">{g.name}</td>
                        <td className="py-3 pr-4 text-gray-300">{fmt(g.price)}</td>
                        <td className="py-3 pr-4 text-brand-400">{fmt(g.saved)}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-surface-600 rounded-full"><div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100,(g.saved/g.price)*100)}%` }} /></div>
                            <span className="text-gray-400">{((g.saved/g.price)*100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3"><span className={`badge text-xs ${g.status === 'completed' ? 'bg-brand-500/20 text-brand-400' : 'bg-blue-500/20 text-blue-400'}`}>{g.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {report.expenses?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-white mb-4">All Transactions — {MONTHS[month-1]} {year}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-600">
                      {['Date','Description','Category','Amount','Payment'].map(h => <th key={h} className="text-left text-gray-400 font-medium pb-3 pr-4">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700">
                    {report.expenses.slice(0, 20).map(e => (
                      <tr key={e._id} className="hover:bg-surface-700/30 transition-all">
                        <td className="py-2.5 pr-4 text-gray-400">{new Date(e.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</td>
                        <td className="py-2.5 pr-4 text-white">{e.title}</td>
                        <td className="py-2.5 pr-4"><span className="badge bg-surface-600 text-gray-300 text-xs">{e.category}</span></td>
                        <td className="py-2.5 pr-4 text-white font-mono font-medium">{fmt(e.amount)}</td>
                        <td className="py-2.5 text-gray-400">{e.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {report.expenses.length > 20 && <p className="text-center text-gray-500 text-xs mt-3">Showing 20 of {report.expenses.length} transactions. Download CSV for full data.</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
