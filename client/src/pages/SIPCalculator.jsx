import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { RiLineChartLine, RiMoneyRupeeCircleLine, RiTimeLine, RiPercentLine } from 'react-icons/ri'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const fmtCr = n => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
  return fmt(n)
}

const PRESETS = [
  { label: 'Conservative', sip: 5000, rate: 10, years: 20, color: '#3b82f6' },
  { label: 'Moderate', sip: 10000, rate: 13, years: 15, color: '#22c55e' },
  { label: 'Aggressive', sip: 20000, rate: 16, years: 10, color: '#f59e0b' },
]

function calcSIP(monthly, annualRate, years) {
  const months = years * 12
  const r = annualRate / 12 / 100
  const data = []
  let invested = 0
  let value = 0
  for (let m = 1; m <= months; m++) {
    invested += monthly
    value = (value + monthly) * (1 + r)
    if (m % 12 === 0) {
      data.push({
        year: m / 12,
        invested: Math.round(invested),
        value: Math.round(value),
        gain: Math.round(value - invested),
      })
    }
  }
  return { data, finalValue: Math.round(value), totalInvested: Math.round(invested), totalGain: Math.round(value - invested) }
}

const CUSTOM_TOOLTIP = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-xs space-y-1">
      <p className="text-gray-400 font-medium">Year {d.year}</p>
      <p className="text-gray-300">Invested: <span className="text-white font-semibold">{fmtCr(d.invested)}</span></p>
      <p className="text-gray-300">Value: <span className="text-brand-400 font-semibold">{fmtCr(d.value)}</span></p>
      <p className="text-gray-300">Gain: <span className="text-accent-gold font-semibold">{fmtCr(d.gain)}</span></p>
    </div>
  )
}

export default function SIPCalculator() {
  const [sip, setSip] = useState(10000)
  const [rate, setRate] = useState(12)
  const [years, setYears] = useState(15)
  const [lumpsum, setLumpsum] = useState(0)
  const [lumpsumRate, setLumpsumRate] = useState(12)

  const { data, finalValue, totalInvested, totalGain } = useMemo(() => calcSIP(sip, rate, years), [sip, rate, years])

  // Lumpsum calculation
  const lumpsumValue = useMemo(() => {
    if (!lumpsum) return 0
    return Math.round(lumpsum * Math.pow(1 + lumpsumRate / 100, years))
  }, [lumpsum, lumpsumRate, years])

  const combinedValue = finalValue + lumpsumValue
  const wealthMultiple = totalInvested > 0 ? (finalValue / totalInvested).toFixed(2) : 0
  const absReturn = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : 0

  // Compare rates
  const compareData = [6, 8, 10, 12, 14, 16].map(r => {
    const { finalValue: fv, totalInvested: ti } = calcSIP(sip, r, years)
    return { rate: `${r}%`, value: fv, invested: ti }
  })

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <RiLineChartLine className="text-brand-400" /> SIP & Returns Calculator
        </h1>
        <p className="text-gray-400 text-sm mt-1">Visualize the power of compounding on your investments</p>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setSip(p.sip); setRate(p.rate); setYears(p.years) }}
            className="card-hover p-4 text-left transition-all hover:border-brand-500/50">
            <p className="text-sm font-semibold text-white">{p.label}</p>
            <p className="text-xs text-gray-500 mt-1">{fmt(p.sip)}/mo · {p.rate}% · {p.years}yr</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-2 card space-y-6">
          <h2 className="font-display font-semibold text-white">SIP Details</h2>

          <div>
            <label className="label flex items-center gap-1"><RiMoneyRupeeCircleLine className="text-brand-400" /> Monthly SIP Amount</label>
            <input type="number" value={sip} onChange={e => setSip(Number(e.target.value))} className="input-field" />
            <p className="text-xs text-brand-400 mt-1">{fmt(sip)} / month</p>
          </div>

          <div>
            <label className="label flex items-center gap-1"><RiPercentLine className="text-brand-400" /> Expected Annual Returns</label>
            <div className="flex items-center gap-3">
              <input type="range" min="4" max="25" step="0.5" value={rate} onChange={e => setRate(Number(e.target.value))} className="flex-1 accent-brand-500" />
              <span className="text-white font-bold w-12 text-right">{rate}%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>FD ~6%</span><span>Index ~12%</span><span>Small Cap ~18%</span>
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1"><RiTimeLine className="text-brand-400" /> Investment Duration</label>
            <div className="flex items-center gap-3">
              <input type="range" min="1" max="40" step="1" value={years} onChange={e => setYears(Number(e.target.value))} className="flex-1 accent-brand-500" />
              <span className="text-white font-bold w-16 text-right">{years} yrs</span>
            </div>
          </div>

          <hr className="border-surface-600" />
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">+ Lump Sum (optional)</h3>
            <input type="number" value={lumpsum} onChange={e => setLumpsum(Number(e.target.value))} className="input-field mb-2" placeholder="One-time investment ₹" />
            <div className="flex items-center gap-3">
              <input type="range" min="4" max="20" step="0.5" value={lumpsumRate} onChange={e => setLumpsumRate(Number(e.target.value))} className="flex-1 accent-brand-500" />
              <span className="text-xs text-white w-12 text-right">{lumpsumRate}%</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Hero Result */}
          <div className="card bg-gradient-to-br from-brand-900/50 to-surface-800 border-brand-600/30">
            <p className="text-gray-400 text-sm">SIP Corpus after {years} years</p>
            <p className="font-display text-4xl font-bold text-white mt-1">{fmtCr(finalValue)}</p>
            {lumpsum > 0 && (
              <p className="text-brand-400 text-sm mt-1">+ Lumpsum: {fmtCr(lumpsumValue)} = <strong className="text-white">{fmtCr(combinedValue)}</strong> combined</p>
            )}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-surface-600">
              <div>
                <p className="text-xs text-gray-500">Total Invested</p>
                <p className="text-white font-semibold text-sm mt-0.5">{fmtCr(totalInvested)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Gain</p>
                <p className="text-brand-400 font-semibold text-sm mt-0.5">{fmtCr(totalGain)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Wealth Multiple</p>
                <p className="text-accent-gold font-semibold text-sm mt-0.5">{wealthMultiple}x</p>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="card">
            <h3 className="font-semibold text-white mb-4 text-sm">Investment Growth Over Time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="sipGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243326" />
                <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `Y${v}`} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => fmtCr(v)} width={70} />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Area type="monotone" dataKey="invested" stroke="#3b82f6" fill="url(#invGrad)" strokeWidth={2} name="Invested" />
                <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#sipGrad)" strokeWidth={2.5} name="Value" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> Invested</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-brand-500 inline-block" /> Corpus Value</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Comparison */}
      <div className="card">
        <h3 className="font-display font-semibold text-white mb-1">Rate Comparison — {fmt(sip)}/mo for {years} years</h3>
        <p className="text-gray-500 text-sm mb-6">See how return rate dramatically changes your wealth</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {compareData.map((c, i) => {
            const isActive = c.rate === `${rate}%`
            const multiple = (c.value / c.invested).toFixed(1)
            return (
              <motion.button key={c.rate} whileHover={{ scale: 1.03 }}
                onClick={() => setRate(Number(c.rate.replace('%', '')))}
                className={`rounded-xl p-3 text-center border transition-all ${isActive ? 'bg-brand-500/20 border-brand-500/50 text-brand-400' : 'bg-surface-700 border-surface-600 text-gray-400 hover:border-brand-500/30'}`}>
                <p className="text-lg font-bold">{c.rate}</p>
                <p className="text-xs mt-1">{fmtCr(c.value)}</p>
                <p className="text-xs mt-0.5 text-gray-500">{multiple}x</p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: '📅 Break-even point', value: `${data.find(d => d.value >= d.invested * 1.5)?.year || '—'} years`, sub: 'When returns hit 1.5x invested' },
          { title: '📈 Absolute Return', value: `${absReturn}%`, sub: 'Total gain on invested amount' },
          { title: '💰 Monthly target for ₹1 Cr', value: `${fmt(Math.ceil(calcSIP(1, rate, years).finalValue > 0 ? 10000000 / calcSIP(10000, rate, years).finalValue * 10000 : 0))}/mo`, sub: `At ${rate}% for ${years} years` },
        ].map(card => (
          <div key={card.title} className="card">
            <p className="text-sm font-semibold text-white">{card.title}</p>
            <p className="font-display text-2xl font-bold text-brand-400 mt-2">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
