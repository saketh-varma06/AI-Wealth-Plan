import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Goals from './pages/Goals'
import Investments from './pages/Investments'
import Reports from './pages/Reports'
import Advisor from './pages/Advisor'
import Chatbot from './pages/Chatbot'
import EMICalculator from './pages/EMICalculator'
import SIPCalculator from './pages/SIPCalculator'
import NetWorthTracker from './pages/NetWorthTracker'
import Admin from './pages/Admin'
import Profile from './pages/Profile'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const OnboardingGuard = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && !user.onboardingCompleted) return <Navigate to="/onboarding" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Onboarding */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      {/* App Routes */}
      <Route element={<OnboardingGuard><AppLayout /></OnboardingGuard>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/emi-calculator" element={<EMICalculator />} />
        <Route path="/sip-calculator" element={<SIPCalculator />} />
        <Route path="/net-worth" element={<NetWorthTracker />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a2b1f', color: '#f0fdf4', border: '1px solid #2d3e30', fontFamily: 'DM Sans' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0a0f0d' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0f0d' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
