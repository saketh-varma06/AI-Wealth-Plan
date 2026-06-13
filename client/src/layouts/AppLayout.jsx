import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import NotificationPanel from '../components/NotificationPanel'
import {
  RiDashboardLine, RiWalletLine, RiFlag2Line, RiLineChartLine,
  RiFileChartLine, RiRobotLine, RiSettings4Line, RiLogoutBoxLine,
  RiMenuLine, RiCloseLine, RiBellLine, RiShieldLine, RiUserLine,
  RiChat3Line, RiCalculatorLine, RiScalesLine, RiFundsFill
} from 'react-icons/ri'

const navItems = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/expenses', icon: RiWalletLine, label: 'Expenses' },
  { to: '/goals', icon: RiFlag2Line, label: 'Goals' },
  { to: '/investments', icon: RiLineChartLine, label: 'Investments' },
  { to: '/net-worth', icon: RiScalesLine, label: 'Net Worth' },
  { to: '/advisor', icon: RiRobotLine, label: 'AI Advisor' },
  { to: '/chatbot', icon: RiChat3Line, label: 'FinBot Chat' },
  { to: '/emi-calculator', icon: RiCalculatorLine, label: 'EMI Calculator' },
  { to: '/sip-calculator', icon: RiFundsFill, label: 'SIP Calculator' },
  { to: '/reports', icon: RiFileChartLine, label: 'Reports' },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-surface-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-display font-bold glow-green">₹</div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-none">AI Wealth</p>
            <p className="text-xs text-brand-400 font-medium">Planner</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-gray-400 hover:bg-surface-700 hover:text-white'}`}>
            <Icon className="text-lg flex-shrink-0" />
            {label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin" onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30' : 'text-gray-400 hover:bg-surface-700 hover:text-white'}`}>
            <RiShieldLine className="text-lg" />Admin
          </NavLink>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-surface-600 space-y-1">
        <NavLink to="/profile" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-surface-700 hover:text-white transition-all">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.avatar ? <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" alt="" /> : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs truncate">Level {user?.level || 1}</p>
          </div>
        </NavLink>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <RiLogoutBoxLine className="text-lg" />Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 xl:w-64 flex-col bg-surface-800 border-r border-surface-600 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }} className="fixed left-0 top-0 h-full w-64 bg-surface-800 border-r border-surface-600 z-50 lg:hidden">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><RiCloseLine className="text-xl" /></button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-surface-800/80 backdrop-blur border-b border-surface-600 px-4 lg:px-6 h-16 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white p-2">
            <RiMenuLine className="text-xl" />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-2">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative btn-ghost p-2">
              <RiBellLine className="text-lg" />
            </button>
            <NavLink to="/profile" className="btn-ghost p-2"><RiUserLine className="text-lg" /></NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
