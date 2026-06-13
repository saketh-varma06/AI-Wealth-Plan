import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { RiAddLine, RiDeleteBinLine, RiArrowUpLine, RiArrowDownLine, RiScalesLine } from 'react-icons/ri'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const fmtCr = n => {
  if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)} L`
  return fmt(n)
}

const ASSET_CATEGORIES = ['Bank Savings', 'Fixed Deposits', 'Mutual Funds', 'Stocks', 'Gold', 'Real Estate', 'PPF / NPS', 'Other Assets']
const LIABILITY_CATEGORIES = ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card', 'Education Loan', 'Other Debt']
const ASSET_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#14b8a6', '#f97316', '#84cc16', '#ec4899']
const LIAB_COLORS = ['#ef4444', '#f97316', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']

const STORAGE_KEY = 'networth_v1'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { assets: [], liabilities: [], history: [] } }
  catch { return { assets: [], liabilities: [], history: [] } }
}
function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export default function NetWorthTracker() {
  const [data, setData] = useState(load)
  const [tab, setTab] = useState('overview')
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [showAddLiab, setShowAddLiab] = useState(false)
  const [assetForm, setAssetForm] = useState({ name: '', category: 'Bank Savings', value: '' })
  const [liabForm, setLiabForm] = useState({ name: '', category: 'Home Loan', value: '' })

  const totalAssets = data.assets.reduce((s, a) => s + Number(a.value), 0)
  const totalLiabilities = data.liabilities.reduce((s, l) => s + Number(l.value), 0)
  const netWorth = totalAssets - totalLiabilities
  const debtToAsset = totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0

  // Snapshot net worth to history (once per session if changed)
  useEffect(() => {
    if (totalAssets === 0 && totalLiabilities === 0) return
    const today = new Date().toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    setData(prev => {
      const history = [...(prev.history || [])]
      const last = history[history.length - 1]
      if (!last || last.label !== today) {
        history.push({ label: today, netWorth, assets: totalAssets, liabilities: totalLiabilities })
        if (history.length > 12) history.shift()
        const updated = { ...prev, history }
        save(updated)
        return updated
      }
      return prev
    })
  }, [netWorth])

  const addAsset = (e) => {
    e.preventDefault()
    if (!assetForm.name || !assetForm.value) return
    const updated = { ...data, assets: [...data.assets, { id: Date.now(), ...assetForm, value: Number(assetForm.value) }] }
    save(updated); setData(updated); setShowAddAsset(false); setAssetForm({ name: '', category: 'Bank Savings', value: '' })
  }
  const addLiab = (e) => {
    e.preventDefault()
    if (!liabForm.name || !liabForm.value) return
    const updated = { ...data, liabilities: [...data.liabilities, { id: Date.now(), ...liabForm, value: Number(liabForm.value) }] }
    save(updated); setData(updated); setShowAddLiab(false); setLiabForm({ name: '', category: 'Home Loan', value: '' })
  }
  const removeAsset = (id) => { const u = { ...data, assets: data.assets.filter(a => a.id !== id) }; save(u); setData(u) }
  const removeLiab = (id) => { const u = { ...data, liabilities: data.liabilities.filter(l => l.id !== id) }; save(u); setData(u) }

  // Pie data by category
  const assetPie = ASSET_CATEGORIES.map((cat, i) => ({
    name: cat, value: data.assets.filter(a => a.category === cat).reduce((s, a) => s + a.value, 0), fill: ASSET_COLORS[i]
  })).filter(d => d.value > 0)

  const liabPie = LIABILITY_CATEGORIES.map((cat, i) => ({
    name: cat, value: data.liabilities.filter(l => l.category === cat).reduce((s, l) => s + l.value, 0), fill: LIAB_COLORS[i]
  })).filter(d => d.value > 0)

  const TABS = ['overview', 'assets', 'liabilities', 'history']

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <RiScalesLine className="text-brand-400" /> Net Worth Tracker
        </h1>
        <p className="text-gray-400 text-sm mt-1">Track your assets, liabilities, and true financial position</p>
      </div>

      {/* Net Worth Hero */}
      <div className={`card bg-gradient-to-br ${netWorth >= 0 ? 'from-brand-900/40 to-surface-800 border-brand-600/30' : 'from-red-900/40 to-surface-800 border-red-600/30'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-gray-400 text-sm">Your Net Worth</p>
            <div className="flex items-center gap-2 mt-1">
              {netWorth >= 0 ? <RiArrowUpLine className="text-brand-400 text-2xl" /> : <RiArrowDownLine className="text-red-400 text-2xl" />}
              <p className={`font-display text-4xl font-bold ${netWorth >= 0 ? 'text-white' : 'text-red-400'}`}>{fmtCr(Math.abs(netWorth))}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{netWorth >= 0 ? 'Assets exceed liabilities' : 'Liabilities exceed assets'}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Total Assets</p>
              <p className="text-brand-400 font-bold text-lg mt-0.5">{fmtCr(totalAssets)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Debt</p>
              <p className="text-red-400 font-bold text-lg mt-0.5">{fmtCr(totalLiabilities)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Debt Ratio</p>
              <p className={`font-bold text-lg mt-0.5 ${debtToAsset < 40 ? 'text-brand-400' : debtToAsset < 70 ? 'text-yellow-400' : 'text-red-400'}`}>{debtToAsset}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-gray-400 hover:bg-surface-700 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {assetPie.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Asset Allocation</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={assetPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                    {assetPie.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px', color: '#f0fdf4', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {assetPie.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} /><span className="text-gray-400">{d.name}</span></div>
                    <span className="text-white">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {liabPie.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Liability Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={liabPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                    {liabPie.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px', color: '#f0fdf4', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {liabPie.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} /><span className="text-gray-400">{d.name}</span></div>
                    <span className="text-white">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalAssets === 0 && totalLiabilities === 0 && (
            <div className="md:col-span-2 card text-center py-12">
              <RiScalesLine className="text-5xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">Start by adding your assets and liabilities</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setTab('assets'); setShowAddAsset(true) }} className="btn-primary">Add Asset</button>
                <button onClick={() => { setTab('liabilities'); setShowAddLiab(true) }} className="btn-secondary">Add Liability</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'assets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">{data.assets.length} assets · Total: <span className="text-brand-400 font-semibold">{fmtCr(totalAssets)}</span></p>
            <button onClick={() => setShowAddAsset(!showAddAsset)} className="btn-primary flex items-center gap-2"><RiAddLine />Add Asset</button>
          </div>

          <AnimatePresence>
            {showAddAsset && (
              <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={addAsset} className="card border-brand-500/30 space-y-3">
                <h3 className="font-semibold text-white text-sm">New Asset</h3>
                <div className="grid grid-cols-3 gap-3">
                  <input className="input-field" placeholder="Asset name" value={assetForm.name} onChange={e => setAssetForm(p => ({ ...p, name: e.target.value }))} />
                  <select className="input-field" value={assetForm.category} onChange={e => setAssetForm(p => ({ ...p, category: e.target.value }))}>
                    {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" className="input-field" placeholder="Current value ₹" value={assetForm.value} onChange={e => setAssetForm(p => ({ ...p, value: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm px-4 py-2">Add</button>
                  <button type="button" onClick={() => setShowAddAsset(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {data.assets.map(a => (
            <div key={a.id} className="card-hover flex items-center justify-between group">
              <div>
                <p className="text-white font-medium">{a.name}</p>
                <span className="badge bg-brand-500/20 text-brand-400 text-xs mt-1">{a.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-brand-400 font-semibold">{fmt(a.value)}</p>
                <button onClick={() => removeAsset(a.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-all"><RiDeleteBinLine /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'liabilities' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">{data.liabilities.length} liabilities · Total: <span className="text-red-400 font-semibold">{fmtCr(totalLiabilities)}</span></p>
            <button onClick={() => setShowAddLiab(!showAddLiab)} className="btn-primary flex items-center gap-2"><RiAddLine />Add Liability</button>
          </div>

          <AnimatePresence>
            {showAddLiab && (
              <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={addLiab} className="card border-red-500/30 space-y-3">
                <h3 className="font-semibold text-white text-sm">New Liability</h3>
                <div className="grid grid-cols-3 gap-3">
                  <input className="input-field" placeholder="Liability name" value={liabForm.name} onChange={e => setLiabForm(p => ({ ...p, name: e.target.value }))} />
                  <select className="input-field" value={liabForm.category} onChange={e => setLiabForm(p => ({ ...p, category: e.target.value }))}>
                    {LIABILITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" className="input-field" placeholder="Outstanding amount ₹" value={liabForm.value} onChange={e => setLiabForm(p => ({ ...p, value: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm px-4 py-2">Add</button>
                  <button type="button" onClick={() => setShowAddLiab(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {data.liabilities.map(l => (
            <div key={l.id} className="card-hover flex items-center justify-between group">
              <div>
                <p className="text-white font-medium">{l.name}</p>
                <span className="badge bg-red-500/20 text-red-400 text-xs mt-1">{l.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-red-400 font-semibold">{fmt(l.value)}</p>
                <button onClick={() => removeLiab(l.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-all"><RiDeleteBinLine /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <h3 className="font-semibold text-white mb-6">Net Worth History</h3>
          {data.history?.length > 1 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243326" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => fmtCr(v)} width={80} />
                <Tooltip formatter={v => fmtCr(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px', color: '#f0fdf4', fontSize: 12 }} />
                <Bar dataKey="assets" fill="#22c55e" name="Assets" radius={[4, 4, 0, 0]} />
                <Bar dataKey="liabilities" fill="#ef4444" name="Liabilities" radius={[4, 4, 0, 0]} />
                <Bar dataKey="netWorth" fill="#3b82f6" name="Net Worth" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">Update your net worth over multiple sessions to see the trend here.</p>
          )}
        </div>
      )}
    </div>
  )
}
