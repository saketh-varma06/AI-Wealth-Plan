import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-800 flex-col justify-between p-12">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-brand-500/10"
              style={{ width: `${(i+1)*120}px`, height: `${(i+1)*120}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animationDelay: `${i*0.5}s` }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg">₹</div>
            <span className="font-display text-xl font-bold text-white">AI Wealth Planner</span>
          </div>
        </div>
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
              Your money,<br />
              <span className="text-gradient">intelligently managed.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">AI-powered financial planning that learns your habits and helps you build real wealth.</p>
          </motion.div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[['₹2.4Cr', 'Total Managed'], ['94%', 'Goal Success'], ['12K+', 'Users']].map(([v, l]) => (
              <div key={l} className="glass rounded-xl p-4">
                <p className="font-display text-2xl font-bold text-brand-400">{v}</p>
                <p className="text-xs text-gray-500 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-gray-600">© 2024 AI Wealth Planner. All rights reserved.</div>
      </div>

      {/* Right auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
