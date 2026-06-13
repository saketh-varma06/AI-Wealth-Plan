import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { RiMailLine, RiArrowLeftLine } from 'react-icons/ri'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent to your email')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email')
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8">
        <RiArrowLeftLine />Back to login
      </Link>
      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RiMailLine className="text-3xl text-brand-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-gray-400">We sent a password reset link to <strong className="text-white">{email}</strong></p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Reset password</h1>
          <p className="text-gray-400 mb-8">Enter your email and we'll send a reset link</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-11" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </>
      )}
    </motion.div>
  )
}

export default ForgotPassword
