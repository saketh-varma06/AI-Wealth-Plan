import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { RiUserLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Let\'s set up your profile.')
      navigate('/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Create account</h1>
        <p className="text-gray-400 mt-1">Start your journey to financial freedom</p>
      </div>

      <div className="mb-6">
        <GoogleAuthButton label="Sign up with Google" />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-surface-600" />
        <span className="text-xs text-gray-500">or register with email</span>
        <div className="flex-1 h-px bg-surface-600" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'name', label: 'Full Name', icon: RiUserLine, type: 'text', placeholder: 'John Doe' },
          { key: 'email', label: 'Email', icon: RiMailLine, type: 'email', placeholder: 'you@example.com' },
        ].map(({ key, label, icon: Icon, type, placeholder }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <div className="relative">
              <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="input-field pl-11" required />
            </div>
          </div>
        ))}
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" className="input-field pl-11 pr-11" required />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter password" className="input-field pl-11" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account...</span> : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-gray-400 mt-6 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
      </p>
    </motion.div>
  )
}
