// Format currency in Indian style
export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

// Short format: ₹1.2L, ₹45K
export const formatShort = (n) => {
  if (!n) return '₹0'
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n}`
}

// Days between two dates
export const daysBetween = (d1, d2 = new Date()) =>
  Math.ceil((new Date(d1) - new Date(d2)) / (1000 * 60 * 60 * 24))

// Get month name
export const monthName = (date) =>
  new Date(date).toLocaleString('en-IN', { month: 'long' })

// Clamp number between min and max
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

// Debounce
export const debounce = (fn, delay = 300) => {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay) }
}

// Color by % (red → yellow → green)
export const progressColor = (pct) => {
  if (pct >= 80) return '#22c55e'
  if (pct >= 50) return '#f59e0b'
  return '#ef4444'
}
