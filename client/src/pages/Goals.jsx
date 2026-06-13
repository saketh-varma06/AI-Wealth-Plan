import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { goalAPI } from '../services/api'
import { RiAddLine, RiFlag2Line, RiDeleteBinLine, RiRobotLine, RiCheckLine, RiCalendarLine } from 'react-icons/ri'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

const defaultForm = { productName: '', productPrice: '', targetDate: '', category: 'Electronics', notes: '' }

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showContrib, setShowContrib] = useState(null)
  const [showImpact, setShowImpact] = useState(null)
  const [impact, setImpact] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [contrib, setContrib] = useState({ amount: '', note: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { goalAPI.getGoals().then(r => setGoals(r.data.goals)).catch(console.error).finally(() => setLoading(false)) }, [])

  const fetchGoals = () => goalAPI.getGoals().then(r => setGoals(r.data.goals))

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await goalAPI.createGoal({ ...form, productPrice: Number(form.productPrice) })
      toast.success('Goal created! AI analyzed your plan 🎯')
      setShowModal(false)
      setForm(defaultForm)
      fetchGoals()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleContribute = async (e) => {
    e.preventDefault()
    try {
      await goalAPI.addContribution(showContrib, { amount: Number(contrib.amount), note: contrib.note })
      toast.success('Contribution added! 💪')
      setShowContrib(null)
      setContrib({ amount: '', note: '' })
      fetchGoals()
    } catch { toast.error('Failed to add contribution') }
  }

  const handleImpact = async (id) => {
    try {
      const { data } = await goalAPI.getPurchaseImpact(id)
      setImpact(data.impact)
      setShowImpact(id)
    } catch { toast.error('Failed to analyze impact') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return
    try { await goalAPI.deleteGoal(id); toast.success('Goal deleted'); fetchGoals() }
    catch { toast.error('Delete failed') }
  }

  const CATEGORIES = ['Electronics', 'Vehicle', 'Property', 'Education', 'Travel', 'Other']

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Purchase Goal Planner</h1>
          <p className="text-gray-400 text-sm mt-1">AI-powered savings analysis for your goals</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <RiAddLine />New Goal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : goals.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <RiFlag2Line className="text-5xl text-gray-600 mb-3" />
          <h3 className="font-display font-semibold text-white mb-2">No goals yet</h3>
          <p className="text-gray-500 text-sm mb-4">Set a purchase goal and let AI calculate your savings plan</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Set First Goal</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {goals.map((goal, i) => {
            const pct = Math.min(100, (goal.currentSaved / goal.productPrice) * 100)
            const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000*60*60*24))
            return (
              <motion.div key={goal._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card-hover flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">{goal.productName}</h3>
                    <p className="text-gray-400 text-sm">{goal.category}</p>
                  </div>
                  <div className={`badge ${goal.status === 'completed' ? 'bg-brand-500/20 text-brand-400' : goal.aiAnalysis?.isAchievable ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {goal.status === 'completed' ? '✓ Done' : goal.aiAnalysis?.isAchievable ? '✅ On Track' : '⚠️ Stretch'}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Target</span>
                    <span className="text-white font-semibold">{fmt(goal.productPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Saved</span>
                    <span className="text-brand-400 font-semibold">{fmt(goal.currentSaved)}</span>
                  </div>
                  <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${pct >= 100 ? 'bg-brand-500' : 'bg-gradient-to-r from-brand-600 to-brand-400'}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }} />
                  </div>
                  <p className="text-xs text-gray-500 text-right">{pct.toFixed(1)}% saved</p>
                </div>

                {/* AI Analysis */}
                {goal.aiAnalysis && (
                  <div className="bg-surface-700/50 rounded-xl p-3 mb-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-brand-400 font-semibold mb-2"><RiRobotLine />AI Analysis</div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Save monthly</span>
                      <span className="text-white font-semibold">{fmt(goal.aiAnalysis.monthlySavingNeeded)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Daily amount</span>
                      <span className="text-white">{fmt(goal.aiAnalysis.dailySavingNeeded)}</span>
                    </div>
                    {daysLeft > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <RiCalendarLine />{daysLeft} days left
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  {goal.status !== 'completed' && (
                    <button onClick={() => setShowContrib(goal._id)} className="btn-primary flex-1 text-sm py-2">+ Save</button>
                  )}
                  <button onClick={() => handleImpact(goal._id)} className="btn-secondary text-sm py-2 px-3">Impact</button>
                  <button onClick={() => handleDelete(goal._id)} className="p-2 rounded-xl bg-surface-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all"><RiDeleteBinLine /></button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="card w-full max-w-md">
              <h2 className="font-display text-lg font-bold text-white mb-5">New Purchase Goal</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">What do you want to buy?</label>
                  <input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} placeholder="e.g. MacBook Pro, Scooter, iPhone 15" className="input-field" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Price (₹)</label>
                    <input type="number" value={form.productPrice} onChange={e => setForm(f => ({ ...f, productPrice: e.target.value }))} placeholder="90000" className="input-field" required min="0" />
                  </div>
                  <div>
                    <label className="label">Target Date</label>
                    <input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} className="input-field" required min={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Analyzing...' : '🤖 Analyze & Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contribute Modal */}
      <AnimatePresence>
        {showContrib && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowContrib(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card w-full max-w-sm">
              <h2 className="font-display text-lg font-bold text-white mb-4">Add Contribution</h2>
              <form onSubmit={handleContribute} className="space-y-4">
                <div>
                  <label className="label">Amount (₹)</label>
                  <input type="number" value={contrib.amount} onChange={e => setContrib(c => ({ ...c, amount: e.target.value }))} placeholder="5000" className="input-field" required min="1" />
                </div>
                <div>
                  <label className="label">Note (optional)</label>
                  <input value={contrib.note} onChange={e => setContrib(c => ({ ...c, note: e.target.value }))} placeholder="Bonus savings, etc." className="input-field" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowContrib(null)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1"><RiCheckLine className="inline mr-1" />Add</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Impact Modal */}
      <AnimatePresence>
        {showImpact && impact && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowImpact(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card w-full max-w-sm">
              <h2 className="font-display text-lg font-bold text-white mb-4">Purchase Impact Analysis</h2>
              <div className="space-y-3">
                {[
                  ['Product Price', fmt(impact.productPrice)],
                  ['Amount Saved', fmt(impact.currentSaved)],
                  ['Remaining', fmt(impact.remaining)],
                  ['Progress', `${impact.percentSaved}%`],
                  ['Monthly Impact', fmt(impact.monthlyImpact)],
                  ['Budget Impact', `${impact.budgetImpactPercent}% of income`],
                  ['Recovery Time', `${impact.recoveryMonths} months`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-surface-600">
                    <span className="text-gray-400 text-sm">{k}</span>
                    <span className="text-white text-sm font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowImpact(null)} className="btn-secondary w-full mt-5">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
