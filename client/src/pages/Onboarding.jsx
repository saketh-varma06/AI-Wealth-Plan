import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { RiArrowRightLine, RiArrowLeftLine, RiCheckLine } from 'react-icons/ri'

const steps = [
  {
    title: 'Monthly Income',
    subtitle: 'What is your total monthly income?',
    fields: [{ key: 'monthlyIncome', label: 'Monthly Income (₹)', placeholder: '50000', hint: 'Include salary, freelance, and other income sources' }],
  },
  {
    title: 'Fixed Expenses',
    subtitle: 'Tell us about your regular monthly expenses',
    fields: [
      { key: 'rent', label: 'Rent / EMI (₹)', placeholder: '15000' },
      { key: 'food', label: 'Food & Groceries (₹)', placeholder: '8000' },
      { key: 'transport', label: 'Transport (₹)', placeholder: '3000' },
      { key: 'education', label: 'Education (₹)', placeholder: '2000' },
      { key: 'emi', label: 'Loan EMI (₹)', placeholder: '5000' },
    ],
  },
  {
    title: 'Savings Goals',
    subtitle: 'Set your savings targets to get started',
    fields: [
      { key: 'existingSavings', label: 'Current Savings (₹)', placeholder: '100000', hint: 'Total money you currently have saved' },
      { key: 'monthlySavingsTarget', label: 'Monthly Savings Target (₹)', placeholder: '10000', hint: 'How much do you want to save each month?' },
    ],
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ monthlyIncome: '', rent: '', food: '', transport: '', education: '', emi: '', existingSavings: '', monthlySavingsTarget: '' })
  const [loading, setLoading] = useState(false)
  const { updateUser } = useAuth()
  const navigate = useNavigate()

  const handleNext = () => { if (step < steps.length - 1) setStep(s => s + 1) }
  const handleBack = () => { if (step > 0) setStep(s => s - 1) }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        monthlyIncome: Number(data.monthlyIncome),
        fixedExpenses: { rent: Number(data.rent), food: Number(data.food), transport: Number(data.transport), education: Number(data.education), emi: Number(data.emi), others: 0 },
        existingSavings: Number(data.existingSavings),
        monthlySavingsTarget: Number(data.monthlySavingsTarget),
      }
      await userAPI.saveOnboarding(payload)
      updateUser({ onboardingCompleted: true })
      toast.success('🎉 Profile setup complete!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed')
    } finally { setLoading(false) }
  }

  const currentStep = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mesh">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-surface-800 border border-surface-600 rounded-full px-4 py-2 mb-4">
            <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-xs">₹</div>
            <span className="text-sm text-gray-400">AI Wealth Planner</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Let's set up your profile</h1>
          <p className="text-gray-400 mt-2">Step {step + 1} of {steps.length}</p>
        </div>

        {/* Progress */}
        <div className="w-full bg-surface-700 rounded-full h-2 mb-8">
          <motion.div className="bg-brand-500 h-2 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>

        {/* Step Card */}
        <div className="card">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display text-xl font-bold text-white mb-1">{currentStep.title}</h2>
              <p className="text-gray-400 text-sm mb-6">{currentStep.subtitle}</p>
              <div className="space-y-4">
                {currentStep.fields.map(({ key, label, placeholder, hint }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400 font-semibold">₹</span>
                      <input type="number" value={data[key]} onChange={e => setData(d => ({ ...d, [key]: e.target.value }))} placeholder={placeholder} className="input-field pl-9" min="0" />
                    </div>
                    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
                <RiArrowLeftLine />Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Continue<RiArrowRightLine />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : <><RiCheckLine />Complete Setup</>}
              </button>
            )}
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-brand-500 w-6' : i < step ? 'bg-brand-700' : 'bg-surface-600'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
