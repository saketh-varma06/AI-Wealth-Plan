import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { RiEyeLine, RiEyeOffLine, RiGoogleLine, RiLockLine, RiMailLine } from 'react-icons/ri'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.onboardingCompleted ? '/dashboard' : '/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } })
        const profile = await res.json()
        const user = await googleLogin({ googleId: profile.sub, email: profile.email, name: profile.name, avatar: profile.picture })
        toast.success(`Welcome, ${user.name}!`)
        navigate(user.onboardingCompleted ? '/dashboard' : '/onboarding')
      } catch { toast.error('Google login failed') }
    },
    onError: () => toast.error('Google login failed'),
  })

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 lg:hidden">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-display font-bold">₹</div>
          <span className="font-display font-bold text-white">AI Wealth Planner</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
        <p className="text-gray-400 mt-1">Sign in to your financial dashboard</p>
      </div>

      <button onClick={() => handleGoogle()} className="w-full flex items-center justify-center gap-3 bg-surface-700 hover:bg-surface-600 border border-surface-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 mb-6">
        <RiGoogleLine className="text-lg" />Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-surface-600" />
        <span className="text-xs text-gray-500">or continue with email</span>
        <div className="flex-1 h-px bg-surface-600" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="input-field pl-11" required />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="input-field pl-11 pr-11" required />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</span> : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-gray-400 mt-6 text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Create account</Link>
      </p>
    </motion.div>
  )
}
