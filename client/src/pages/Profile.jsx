import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { userAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { RiEditLine, RiSaveLine, RiTrophyLine, RiFireLine, RiStarLine, RiShieldLine } from 'react-icons/ri'

const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`

const BADGES = {
  profile_complete: { label: 'Profile Complete', icon: '✅', color: 'bg-brand-500/20 text-brand-400 border-brand-500/30' },
  goal_achiever: { label: 'Goal Achiever', icon: '🏆', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  first_investment: { label: 'Investor', icon: '📈', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  savings_streak: { label: 'Streak Master', icon: '🔥', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  budget_master: { label: 'Budget Master', icon: '🎯', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
}

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editProfile, setEditProfile] = useState(false)
  const [editFinance, setEditFinance] = useState(false)
  const [nameForm, setNameForm] = useState({ name: user?.name || '' })
  const [finForm, setFinForm] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    userAPI.getFinancialProfile()
      .then(r => {
        setProfile(r.data.financialProfile)
        const fp = r.data.financialProfile
        setFinForm({
          monthlyIncome: fp?.monthlyIncome || '',
          rent: fp?.fixedExpenses?.rent || '',
          food: fp?.fixedExpenses?.food || '',
          transport: fp?.fixedExpenses?.transport || '',
          education: fp?.fixedExpenses?.education || '',
          emi: fp?.fixedExpenses?.emi || '',
          existingSavings: fp?.existingSavings || '',
          monthlySavingsTarget: fp?.monthlySavingsTarget || '',
        })
      })
      .catch(console.error)
  }, [])

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const { data } = await authAPI.updateProfile({ name: nameForm.name })
      updateUser({ name: data.user.name })
      toast.success('Profile updated!')
      setEditProfile(false)
    } catch { toast.error('Update failed') }
    finally { setLoading(false) }
  }

  const handleFinanceSave = async () => {
    setLoading(true)
    try {
      await userAPI.updateFinancialProfile({
        monthlyIncome: Number(finForm.monthlyIncome),
        fixedExpenses: { rent: Number(finForm.rent), food: Number(finForm.food), transport: Number(finForm.transport), education: Number(finForm.education), emi: Number(finForm.emi), others: 0 },
        existingSavings: Number(finForm.existingSavings),
        monthlySavingsTarget: Number(finForm.monthlySavingsTarget),
      })
      toast.success('Financial profile updated!')
      setEditFinance(false)
    } catch { toast.error('Update failed') }
    finally { setLoading(false) }
  }

  const xpForNextLevel = (user?.level || 1) * 500
  const xpProgress = ((user?.xp || 0) % xpForNextLevel) / xpForNextLevel * 100

  return (
    <div className="page-container space-y-6 max-w-3xl">
      <h1 className="section-title">My Profile</h1>

      {/* Avatar & Name */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-3xl font-display font-bold text-white flex-shrink-0">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" /> : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            {editProfile ? (
              <div className="flex gap-2">
                <input value={nameForm.name} onChange={e => setNameForm({ name: e.target.value })} className="input-field flex-1" placeholder="Your name" />
                <button onClick={handleProfileSave} disabled={loading} className="btn-primary px-4"><RiSaveLine /></button>
                <button onClick={() => setEditProfile(false)} className="btn-secondary px-4">✕</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">{user?.name}</h2>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  {user?.role === 'admin' && <span className="badge bg-accent-purple/20 text-accent-purple border-accent-purple/30 text-xs mt-1"><RiShieldLine className="inline" /> Admin</span>}
                </div>
                <button onClick={() => setEditProfile(true)} className="btn-ghost flex items-center gap-1.5 text-sm"><RiEditLine />Edit</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Gamification */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <RiTrophyLine className="text-3xl text-yellow-400 mx-auto mb-2" />
          <p className="font-display text-2xl font-bold text-white">Lv.{user?.level || 1}</p>
          <p className="text-xs text-gray-500">Level</p>
        </div>
        <div className="card text-center">
          <RiStarLine className="text-3xl text-accent-gold mx-auto mb-2" />
          <p className="font-display text-2xl font-bold text-white">{user?.xp || 0}</p>
          <p className="text-xs text-gray-500">Total XP</p>
        </div>
        <div className="card text-center">
          <RiFireLine className="text-3xl text-orange-400 mx-auto mb-2" />
          <p className="font-display text-2xl font-bold text-white">{user?.savingsStreak || 0}</p>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>
        <div className="card text-center">
          <span className="text-3xl mx-auto mb-2 block">🏅</span>
          <p className="font-display text-2xl font-bold text-white">{user?.badges?.length || 0}</p>
          <p className="text-xs text-gray-500">Badges</p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Progress to Level {(user?.level || 1) + 1}</span>
          <span className="text-xs text-gray-500">{user?.xp || 0} / {xpForNextLevel} XP</span>
        </div>
        <div className="h-2 bg-surface-700 rounded-full"><motion.div className="h-full bg-gradient-to-r from-brand-500 to-accent-teal rounded-full" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1 }} /></div>
      </div>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4">Earned Badges</h3>
          <div className="flex flex-wrap gap-3">
            {user.badges.map(b => {
              const badge = BADGES[b] || { label: b, icon: '🏅', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
              return (
                <div key={b} className={`badge border px-3 py-2 text-sm ${badge.color}`}>
                  <span className="mr-1.5">{badge.icon}</span>{badge.label}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Financial Profile */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-white">Financial Profile</h3>
          {!editFinance ? (
            <button onClick={() => setEditFinance(true)} className="btn-ghost flex items-center gap-1.5 text-sm"><RiEditLine />Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleFinanceSave} disabled={loading} className="btn-primary text-sm py-2">{loading ? 'Saving...' : 'Save Changes'}</button>
              <button onClick={() => setEditFinance(false)} className="btn-secondary text-sm py-2">Cancel</button>
            </div>
          )}
        </div>

        {finForm && (
          <div className="space-y-4">
            {editFinance ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: 'monthlyIncome', label: 'Monthly Income' },
                  { key: 'monthlySavingsTarget', label: 'Savings Target/Month' },
                  { key: 'existingSavings', label: 'Current Savings' },
                  { key: 'rent', label: 'Rent / Home EMI' },
                  { key: 'food', label: 'Food & Groceries' },
                  { key: 'transport', label: 'Transport' },
                  { key: 'education', label: 'Education' },
                  { key: 'emi', label: 'Other Loans / EMI' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="label">{label} (₹)</label>
                    <input type="number" value={finForm[key]} onChange={e => setFinForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" min="0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                {[
                  ['Monthly Income', fmt(profile?.monthlyIncome)],
                  ['Savings Target', fmt(profile?.monthlySavingsTarget) + '/mo'],
                  ['Current Savings', fmt(profile?.existingSavings)],
                  ['Rent', fmt(profile?.fixedExpenses?.rent)],
                  ['Food', fmt(profile?.fixedExpenses?.food)],
                  ['Transport', fmt(profile?.fixedExpenses?.transport)],
                  ['Education', fmt(profile?.fixedExpenses?.education)],
                  ['Loan EMI', fmt(profile?.fixedExpenses?.emi)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-surface-600">
                    <span className="text-gray-400 text-sm">{k}</span>
                    <span className="text-white text-sm font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
