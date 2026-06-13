import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { expenseAPI } from '../services/api'
import { RiAddLine, RiSearchLine, RiDeleteBinLine, RiEditLine, RiFilterLine, RiUploadLine } from 'react-icons/ri'

const CATEGORIES = ['All', 'Food', 'Travel', 'Shopping', 'Education', 'Bills', 'Health', 'Entertainment', 'Others']
const CAT_COLORS = { Food: 'bg-orange-500/20 text-orange-400', Travel: 'bg-blue-500/20 text-blue-400', Shopping: 'bg-pink-500/20 text-pink-400', Education: 'bg-purple-500/20 text-purple-400', Bills: 'bg-red-500/20 text-red-400', Health: 'bg-teal-500/20 text-teal-400', Entertainment: 'bg-yellow-500/20 text-yellow-400', Others: 'bg-gray-500/20 text-gray-400' }
const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

const defaultForm = { title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], note: '', paymentMethod: 'UPI', isRecurring: false }

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState({ category: 'All', search: '', page: 1 })
  const [file, setFile] = useState(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: filter.page, limit: 20 }
      if (filter.category !== 'All') params.category = filter.category
      if (filter.search) params.search = filter.search
      const { data } = await expenseAPI.getExpenses(params)
      setExpenses(data.expenses)
      setTotal(data.total)
    } catch { toast.error('Failed to fetch expenses') }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const openAdd = () => { setForm(defaultForm); setEditId(null); setFile(null); setShowModal(true) }
  const openEdit = (exp) => {
    setForm({ title: exp.title, amount: exp.amount, category: exp.category, date: exp.date?.split('T')[0] || '', note: exp.note || '', paymentMethod: exp.paymentMethod || 'UPI', isRecurring: exp.isRecurring || false })
    setEditId(exp._id); setFile(null); setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('bill', file)
      if (editId) await expenseAPI.updateExpense(editId, form)
      else await expenseAPI.addExpense(fd)
      toast.success(editId ? 'Expense updated!' : 'Expense added! +10 XP')
      setShowModal(false)
      fetchExpenses()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    try { await expenseAPI.deleteExpense(id); toast.success('Deleted'); fetchExpenses() }
    catch { toast.error('Delete failed') }
  }

  const monthTotal = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Expense Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">Total this view: <span className="text-brand-400 font-semibold">{fmt(monthTotal)}</span></p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <RiAddLine className="text-lg" />Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value, page: 1 }))} placeholder="Search expenses..." className="input-field pl-9 py-2.5 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter(f => ({ ...f, category: cat, page: 1 }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter.category === cat ? 'bg-brand-500 text-white' : 'bg-surface-700 text-gray-400 hover:bg-surface-600'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <p>No expenses found</p>
            <button onClick={openAdd} className="text-brand-400 text-sm mt-2 hover:text-brand-300">Add your first expense →</button>
          </div>
        ) : (
          <div className="divide-y divide-surface-600">
            {expenses.map((exp, i) => (
              <motion.div key={exp._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-4 hover:bg-surface-700/50 transition-all group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${CAT_COLORS[exp.category] || 'bg-gray-500/20 text-gray-400'}`}>
                    {exp.category[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{exp.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString('en-IN')}</span>
                      <span className={`badge text-[10px] py-0.5 ${CAT_COLORS[exp.category]}`}>{exp.category}</span>
                      {exp.paymentMethod && <span className="text-xs text-gray-600">{exp.paymentMethod}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-semibold text-white font-mono">{fmt(exp.amount)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(exp)} className="p-1.5 rounded-lg bg-surface-600 hover:bg-brand-500/20 hover:text-brand-400 text-gray-400 transition-all"><RiEditLine /></button>
                    <button onClick={() => handleDelete(exp._id)} className="p-1.5 rounded-lg bg-surface-600 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all"><RiDeleteBinLine /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button disabled={filter.page === 1} onClick={() => setFilter(f => ({ ...f, page: f.page - 1 }))} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <span className="flex items-center text-sm text-gray-400">Page {filter.page} of {Math.ceil(total / 20)}</span>
          <button disabled={filter.page >= Math.ceil(total / 20)} onClick={() => setFilter(f => ({ ...f, page: f.page + 1 }))} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="font-display text-lg font-bold text-white mb-5">{editId ? 'Edit Expense' : 'Add Expense'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Title</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Lunch at Zomato" className="input-field" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="500" className="input-field" required min="0" />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                      {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Payment</label>
                    <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="input-field">
                      {['Cash', 'Card', 'UPI', 'NetBanking', 'Other'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Note (optional)</label>
                  <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Any notes..." className="input-field" />
                </div>
                {!editId && (
                  <div>
                    <label className="label">Upload Bill (optional)</label>
                    <label className="flex items-center gap-3 p-3 border border-dashed border-surface-500 rounded-xl cursor-pointer hover:border-brand-500/50 transition-all">
                      <RiUploadLine className="text-gray-500" />
                      <span className="text-sm text-gray-500">{file ? file.name : 'Click to upload'}</span>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
                    </label>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : editId ? 'Update' : 'Add Expense'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
