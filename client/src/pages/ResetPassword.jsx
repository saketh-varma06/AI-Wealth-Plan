import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { RiLockLine } from 'react-icons/ri'

export default function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const { token } = useParams()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await authAPI.resetPassword(token, form.password)
      toast.success('Password reset successful!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-display text-3xl font-bold text-white mb-2">New password</h1>
      <p className="text-gray-400 mb-8">Enter your new password below</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['password', 'confirm'].map((key) => (
          <div key={key}>
            <label className="label">{key === 'password' ? 'New Password' : 'Confirm Password'}</label>
            <div className="relative">
              <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="password" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder="••••••••" className="input-field pl-11" required minLength={6} />
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </motion.div>
  )
}
