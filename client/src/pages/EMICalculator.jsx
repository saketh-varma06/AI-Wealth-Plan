import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { RiCalculatorLine, RiHome2Line, RiCarLine, RiGraduationCapLine, RiBriefcaseLine, RiArrowDownSLine } from 'react-icons/ri'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const COLORS = ['#22c55e', '#ef4444', '#3b82f6']

const PRESETS = [
  { label: 'Home Loan', icon: RiHome2Line, amount: 5000000, rate: 8.5, tenure: 240 },
  { label: 'Car Loan', icon: RiCarLine, amount: 800000, rate: 9.5, tenure: 60 },
  { label: 'Education', icon: RiGraduationCapLine, amount: 1500000, rate: 10.5, tenure: 84 },
  { label: 'Personal', icon: RiBriefcaseLine, amount: 300000, rate: 14, tenure: 36 },
]

function calcEMI(principal, annualRate, months) {
  if (!principal || !annualRate || !months) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)
}

function buildSchedule(principal, annualRate, months) {
  const emi = calcEMI(principal, annualRate, months)
  const r = annualRate / 12 / 100
  let balance = principal
  const rows = []
  let totalInterest = 0
  for (let i = 1; i <= months; i++) {
    const interest = balance * r
    const principalPaid = emi - interest
    balance = Math.max(0, balance - principalPaid)
    totalInterest += interest
    rows.push({ month: i, emi, principal: principalPaid, interest, balance })
  }
  return { emi, totalInterest, rows }
}

export default function EMICalculator() {
  const [amount, setAmount] = useState(1000000)
  const [rate, setRate] = useState(9)
  const [tenure, setTenure] = useState(60)
  const [tenureType, setTenureType] = useState('months')
  const [showTable, setShowTable] = useState(false)
  const [prepay, setPrepay] = useState(0)

  const months = tenureType === 'years' ? tenure * 12 : tenure
  const effectivePrincipal = Math.max(0, amount - prepay)
  const { emi, totalInterest, rows } = useMemo(() => buildSchedule(effectivePrincipal, rate, months), [effectivePrincipal, rate, months])

  const totalPayment = emi * months
  const pieData = [
    { name: 'Principal', value: Math.round(effectivePrincipal) },
    { name: 'Interest', value: Math.round(totalInterest) },
  ]

  // Yearly breakdown for bar chart
  const yearlyData = []
  for (let y = 0; y < Math.ceil(months / 12); y++) {
    const slice = rows.slice(y * 12, y * 12 + 12)
    yearlyData.push({
      year: `Y${y + 1}`,
      Principal: Math.round(slice.reduce((s, r) => s + r.principal, 0)),
      Interest: Math.round(slice.reduce((s, r) => s + r.interest, 0)),
    })
  }

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <RiCalculatorLine className="text-brand-400" /> EMI & Loan Calculator
        </h1>
        <p className="text-gray-400 text-sm mt-1">Calculate EMIs, total interest, and view full amortization schedule</p>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setAmount(p.amount); setRate(p.rate); setTenure(p.tenure); setTenureType('months') }}
            className="card-hover flex flex-col items-center gap-2 py-4 text-center transition-all hover:border-brand-500/50">
            <p.icon className="text-2xl text-brand-400" />
            <p className="text-sm font-medium text-white">{p.label}</p>
            <p className="text-xs text-gray-500">{fmt(p.amount)} @ {p.rate}%</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="card space-y-6">
          <h2 className="font-display font-semibold text-white">Loan Details</h2>

          <div>
            <label className="label">Loan Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
              className="input-field" placeholder="1000000" />
            <p className="text-xs text-brand-400 mt-1">{fmt(amount)}</p>
          </div>

          <div>
            <label className="label">Annual Interest Rate (%)</label>
            <div className="flex items-center gap-4">
              <input type="range" min="1" max="30" step="0.1" value={rate}
                onChange={e => setRate(Number(e.target.value))}
                className="flex-1 accent-brand-500" />
              <span className="text-white font-semibold w-14 text-right">{rate}%</span>
            </div>
          </div>

          <div>
            <label className="label">Tenure</label>
            <div className="flex gap-3">
              <input type="number" value={tenure} onChange={e => setTenure(Number(e.target.value))}
                className="input-field flex-1" />
              <select value={tenureType} onChange={e => setTenureType(e.target.value)}
                className="input-field w-28">
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">{months} months total</p>
          </div>

          <div>
            <label className="label">Down Payment / Prepayment (optional)</label>
            <input type="number" value={prepay} onChange={e => setPrepay(Number(e.target.value))}
              className="input-field" placeholder="0" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-brand-900/40 to-surface-800 border-brand-600/30">
            <p className="text-gray-400 text-sm">Monthly EMI</p>
            <p className="font-display text-4xl font-bold text-white mt-1">{fmt(emi)}</p>
            <p className="text-xs text-gray-500 mt-1">per month for {months} months</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-xs text-gray-400">Principal</p>
              <p className="text-white font-semibold mt-1 text-sm">{fmt(effectivePrincipal)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-400">Total Interest</p>
              <p className="text-red-400 font-semibold mt-1 text-sm">{fmt(totalInterest)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-400">Total Payment</p>
              <p className="text-accent-blue font-semibold mt-1 text-sm">{fmt(totalPayment)}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-4 text-sm">Principal vs Interest Split</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? '#22c55e' : '#ef4444'} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px', color: '#f0fdf4', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-500" /><span className="text-gray-400">Principal</span><span className="ml-auto text-white font-medium">{((effectivePrincipal / totalPayment) * 100).toFixed(1)}%</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-gray-400">Interest</span><span className="ml-auto text-red-400 font-medium">{((totalInterest / totalPayment) * 100).toFixed(1)}%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Breakdown Chart */}
      {yearlyData.length > 0 && yearlyData.length <= 30 && (
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-6">Yearly Principal vs Interest Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={yearlyData} barSize={yearlyData.length > 15 ? 10 : 20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243326" />
              <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1a2b1f', border: '1px solid #2d3e30', borderRadius: '12px', color: '#f0fdf4', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
              <Bar dataKey="Principal" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="Interest" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Amortization Table */}
      <div className="card">
        <button onClick={() => setShowTable(!showTable)}
          className="w-full flex items-center justify-between font-display font-semibold text-white">
          <span>Full Amortization Schedule ({months} months)</span>
          <RiArrowDownSLine className={`text-xl text-gray-400 transition-transform ${showTable ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showTable && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4">
              <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-xl border border-surface-600">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface-700">
                    <tr>
                      {['Month', 'EMI', 'Principal', 'Interest', 'Balance'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700">
                    {rows.map(r => (
                      <tr key={r.month} className="hover:bg-surface-700/50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-400">{r.month}</td>
                        <td className="px-4 py-2.5 text-white font-medium">{fmt(r.emi)}</td>
                        <td className="px-4 py-2.5 text-brand-400">{fmt(r.principal)}</td>
                        <td className="px-4 py-2.5 text-red-400">{fmt(r.interest)}</td>
                        <td className="px-4 py-2.5 text-gray-300">{fmt(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
