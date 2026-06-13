import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { investmentAPI } from '../services/api'
import { RiAddLine, RiDeleteBinLine, RiStockLine, RiArrowUpLine, RiArrowDownLine, RiInformationLine } from 'react-icons/ri'

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#8b5cf6','#14b8a6','#ef4444']
const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`
const TYPES = ['Stock','MutualFund','SIP','FD','Gold','Crypto','Other']
const RISKS = ['Low','Medium','High']

const defaultForm = { name: '', symbol: '', type: 'MutualFund', investedAmount: '', currentValue: '', riskLevel: 'Medium', purchaseDate: '', isSIP: false, sipAmount: '', notes: '' }

export default function Investments() {
  const [investments, setInvestments] = useState([])
  const [summary, setSummary] = useState(null)
  const [watchlist, setWatchlist] = useState([])
  const [sipSuggestions, setSipSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('portfolio')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [invRes, watchRes] = await Promise.all([investmentAPI.getInvestments(), investmentAPI.getWatchlist()])
      setInvestments(invRes.data.investments)
      setSummary(invRes.data.summary)
      setWatchlist(watchRes.data.watchlist)
      setSipSuggestions(watchRes.data.sipSuggestions)
    } catch { toast.error('Failed to load investments') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await investmentAPI.addInvestment({ ...form, investedAmount: Number(form.investedAmount), currentValue: Number(form.currentValue || form.investedAmount), sipAmount: Number(form.sipAmount || 0) })
      toast.success('Investment added!')
      setShowModal(false)
      setForm(defaultForm)
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this investment?')) return
    try { await investmentAPI.deleteInvestment(id); toast.success('Deleted'); fetchAll() }
    catch { toast.error('Delete failed') }
  }

  const byType = investments.reduce((acc, inv) => { acc[inv.type] = (acc[inv.type] || 0) + inv.investedAmount; return acc }, {})
  const pieData = Object.entries(byType).map(([name, value]) => ({ name, value }))

  const RISK_COLORS = { Low: 'text-brand-400 bg-brand-500/20', Medium: 'text-yellow-400 bg-yellow-500/20', High: 'text-red-400 bg-red-500/20' }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Investment Intelligence</h1>
          <p className="text-gray-400 text-sm mt-1">Track your portfolio and discover opportunities</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><RiAddLine />Add Investment</button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invested', value: fmt(summary.totalInvested), color: 'text-white' },
            { label: 'Current Value', value: fmt(summary.totalCurrentValue), color: 'text-brand-400' },
            { label: 'Total Gain/Loss', value: `${summary.gain >= 0 ? '+' : ''}${fmt(summary.gain)}`, color: summary.gain >= 0 ? 'text-brand-400' : 'text-red-400' },
            { label: 'Return %', value: `${summary.gain >= 0 ? '+' : ''}${summary.gainPercent}%`, color: summary.gain >= 0 ? 'text-brand-400' : 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="card">
              <p className="text-gray-400 text-xs mb-1">{s.label}</p>
              <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-600 pb-0">
        {[['portfolio','Portfolio'],['watchlist','Market Watchlist'],['sip','SIP Suggestions']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === key ? 'border-brand-500 text-brand-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div> : (
        <>
          {tab === 'portfolio' && (
            <div className="space-y-6">
              {investments.length > 0 && pieData.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="font-display font-semibold text-white mb-4">Portfolio Allocation</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                        {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                      </Pie><Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px' }} /></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card">
                    <h3 className="font-display font-semibold text-white mb-4">By Type</h3>
                    <div className="space-y-3">
                      {pieData.map((item, i) => (
                        <div key={item.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">{item.name}</span>
                            <span className="text-white">{fmt(item.value)}</span>
                          </div>
                          <div className="h-1.5 bg-surface-700 rounded-full">
                            <div className="h-full rounded-full" style={{ width: `${(item.value/(summary?.totalInvested||1))*100}%`, background: COLORS[i%COLORS.length] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {investments.length === 0 ? (
                <div className="card flex flex-col items-center py-16 text-center">
                  <RiStockLine className="text-5xl text-gray-600 mb-3" />
                  <h3 className="font-display font-semibold text-white mb-2">No investments yet</h3>
                  <p className="text-gray-500 text-sm mb-4">Start tracking your investments and SIPs</p>
                  <button onClick={() => setShowModal(true)} className="btn-primary">Add First Investment</button>
                </div>
              ) : (
                <div className="card p-0 overflow-hidden">
                  <div className="divide-y divide-surface-600">
                    {investments.map(inv => {
                      const gain = (inv.currentValue || inv.investedAmount) - inv.investedAmount
                      const gainPct = inv.investedAmount > 0 ? (gain / inv.investedAmount * 100).toFixed(1) : 0
                      return (
                        <div key={inv._id} className="flex items-center justify-between p-4 hover:bg-surface-700/50 transition-all group">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">{inv.name}</p>
                              <span className={`badge text-xs ${RISK_COLORS[inv.riskLevel]}`}>{inv.riskLevel}</span>
                              {inv.isSIP && <span className="badge bg-brand-500/20 text-brand-400 text-xs">SIP</span>}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{inv.type} {inv.symbol && `• ${inv.symbol}`}</p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <p className="text-white font-semibold text-sm">{fmt(inv.currentValue || inv.investedAmount)}</p>
                              <p className={`text-xs flex items-center justify-end gap-0.5 ${gain >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                                {gain >= 0 ? <RiArrowUpLine /> : <RiArrowDownLine />}{Math.abs(gainPct)}%
                              </p>
                            </div>
                            <button onClick={() => handleDelete(inv._id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all"><RiDeleteBinLine /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'watchlist' && (
            <div className="grid md:grid-cols-2 gap-4">
              {watchlist.map(stock => (
                <div key={stock.symbol} className="card-hover flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{stock.symbol}</p>
                      <span className={`badge text-xs ${RISK_COLORS[stock.risk]}`}>{stock.risk}</span>
                      {stock.isLive && <span className="badge text-xs bg-brand-500/20 text-brand-400">● Live</span>}
                    </div>
                    <p className="text-gray-400 text-sm mt-0.5">{stock.name}</p>
                    <p className="text-xs text-gray-500">{stock.sector}</p>
                  </div>
                  <div className="text-right">
                    {stock.price && <p className="text-white text-sm font-semibold">₹{stock.price.toLocaleString('en-IN')}</p>}
                    <span className={`text-sm font-semibold ${stock.change === 'N/A' ? 'text-gray-500' : stock.change.startsWith('+') ? 'text-brand-400' : 'text-red-400'}`}>{stock.change}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{stock.suggestion}</p>
                  </div>
                </div>
              ))}
              <div className="md:col-span-2 card bg-accent-blue/10 border-accent-blue/30">
                <div className="flex items-start gap-3">
                  <RiInformationLine className="text-accent-blue text-xl flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-400">This watchlist is for <strong className="text-white">educational purposes only</strong>. Always consult a SEBI-registered financial advisor before investing. Past performance doesn't guarantee future returns.</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'sip' && (
            <div className="grid md:grid-cols-2 gap-4">
              {sipSuggestions.map(sip => (
                <div key={sip.name} className="card-hover">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{sip.name}</h3>
                      <p className="text-gray-400 text-sm">{sip.type}</p>
                    </div>
                    <span className={`badge ${RISK_COLORS[sip.risk]}`}>{sip.risk} Risk</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Min SIP</span>
                    <span className="text-white">₹{sip.minSIP}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Expected Returns</span>
                    <span className="text-brand-400 font-medium">{sip.returns} p.a.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="font-display text-lg font-bold text-white mb-5">Add Investment</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <div><label className="label">Name</label><input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Axis Bluechip Fund" className="input-field" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Type</label><select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} className="input-field">{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div><label className="label">Risk Level</label><select value={form.riskLevel} onChange={e => setForm(f=>({...f,riskLevel:e.target.value}))} className="input-field">{RISKS.map(r=><option key={r}>{r}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Invested (₹)</label><input type="number" value={form.investedAmount} onChange={e => setForm(f=>({...f,investedAmount:e.target.value}))} placeholder="10000" className="input-field" required min="0" /></div>
                  <div><label className="label">Current Value (₹)</label><input type="number" value={form.currentValue} onChange={e => setForm(f=>({...f,currentValue:e.target.value}))} placeholder="10000" className="input-field" min="0" /></div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isSIP" checked={form.isSIP} onChange={e => setForm(f=>({...f,isSIP:e.target.checked}))} className="w-4 h-4 accent-brand-500" />
                  <label htmlFor="isSIP" className="text-sm text-gray-300 cursor-pointer">This is a SIP investment</label>
                </div>
                {form.isSIP && <div><label className="label">Monthly SIP Amount (₹)</label><input type="number" value={form.sipAmount} onChange={e => setForm(f=>({...f,sipAmount:e.target.value}))} placeholder="1000" className="input-field" min="0" /></div>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Adding...' : 'Add Investment'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
