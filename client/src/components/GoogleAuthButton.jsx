import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { RiGoogleLine } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const isGoogleConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your_google_client_id_here'

export default function GoogleAuthButton({ label = 'Continue with Google' }) {
  const { googleLogin } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true)
    try {
      const user = await googleLogin(tokenResponse.access_token)
      toast.success(`Welcome${user.onboardingCompleted ? ' back' : ''}, ${user.name}!`)
      navigate(user.onboardingCompleted ? '/dashboard' : '/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in was cancelled or failed'),
    scope: 'openid email profile',
  })

  const handleClick = () => {
    if (!isGoogleConfigured) {
      toast.error('Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to client/.env')
      return
    }
    login()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-surface-700 hover:bg-surface-600 border border-surface-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <RiGoogleLine className="text-lg" />
      )}
      {loading ? 'Signing in...' : label}
    </button>
  )
}
