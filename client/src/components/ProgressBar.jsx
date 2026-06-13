import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, color = 'bg-brand-500', showLabel = false, height = 'h-2', animate = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="w-full">
      <div className={`w-full bg-surface-700 rounded-full overflow-hidden ${height}`}>
        {animate ? (
          <motion.div
            className={`h-full rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ) : (
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        )}
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1 text-right">{pct.toFixed(1)}%</p>
      )}
    </div>
  )
}
