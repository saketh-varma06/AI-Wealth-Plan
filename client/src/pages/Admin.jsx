import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { RiUserLine, RiShieldLine, RiBarChartLine, RiSearchLine } from 'react-icons/ri'

const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    adminAPI.getStats()
      .then(r => setStats(r.data.stats))
      .catch(() => toast.error('Failed to load admin stats'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'users') {
      adminAPI.getAllUsers({ search, limit: 30 })
        .then(r => { setUsers(r.data.users); setTotal(r.data.total) })
        .catch(console.error)
    }
  }, [tab, search])

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.updateUserRole(id, role)
      setUsers(u => u.map(user => user._id === id ? { ...user, role } : user))
      toast.success('Role updated')
    } catch { toast.error('Failed to update role') }
  }

  const trendData = stats?.usersByMonth?.map(m => ({
    name: MONTH_NAMES[m._id.month - 1],
    users: m.count,
  })) || []

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent-purple/20 rounded-xl flex items-center justify-center">
          <RiShieldLine className="text-accent-purple text-xl" />
        </div>
        <div>
          <h1 className="section-title">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Platform analytics and user management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-600">
        {[['overview', 'Overview'], ['users', 'Users']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === key ? 'border-accent-purple text-accent-purple' : 'border-transparent text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'text-blue-400' },
                  { label: 'Total Expenses', value: stats.totalExpenses, icon: '💸', color: 'text-red-400' },
                  { label: 'Active Goals', value: stats.totalGoals, icon: '🎯', color: 'text-brand-400' },
                  { label: 'Total Tracked', value: fmt(stats.totalExpenseAmount), icon: '💰', color: 'text-yellow-400' },
                ].map(s => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card text-center">
                    <span className="text-3xl block mb-2">{s.icon}</span>
                    <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* User Growth Chart */}
              {trendData.length > 0 && (
                <div className="card">
                  <h3 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
                    <RiBarChartLine className="text-accent-purple" />User Growth (Monthly)
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={trendData} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#243326" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px', color: '#f0fdf4' }} />
                      <Bar dataKey="users" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent Users */}
              <div className="card">
                <h3 className="font-display font-semibold text-white mb-4">Recent Signups</h3>
                <div className="divide-y divide-surface-600">
                  {stats.recentUsers?.map(u => (
                    <div key={u._id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{u.name}</p>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge text-xs ${u.role === 'admin' ? 'bg-accent-purple/20 text-accent-purple' : 'bg-surface-600 text-gray-400'}`}>
                          {u.role}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">Total: <span className="text-white font-medium">{total} users</span></p>
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9 py-2.5 text-sm w-64" />
                </div>
              </div>

              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-600">
                        {['User','Email','Role','Level','Joined','Actions'].map(h => (
                          <th key={h} className="text-left text-gray-400 font-medium px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-700">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-surface-700/30 transition-all">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {u.name?.[0]?.toUpperCase()}
                              </div>
                              <span className="text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{u.email}</td>
                          <td className="px-4 py-3">
                            <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded-lg border outline-none cursor-pointer transition-all ${u.role === 'admin' ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/30' : 'bg-surface-600 text-gray-300 border-surface-500'}`}>
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-gray-400">Lv.{u.level || 1}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <RiUserLine className="text-gray-500 text-base" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-sm">No users found</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
