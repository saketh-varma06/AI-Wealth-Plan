import { motion } from 'framer-motion'

export default function StatCard({ title, value, subtitle, icon: Icon, iconColor = 'bg-brand-500/20 text-brand-400', trend, index = 0 }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
            <Icon className="text-lg" />
          </div>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      {trend !== undefined && (
        <p className={`text-xs font-medium ${trend >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
        </p>
      )}
    </motion.div>
  )
}
