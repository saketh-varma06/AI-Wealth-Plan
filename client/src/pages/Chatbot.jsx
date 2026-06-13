import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiRobotLine, RiSendPlaneLine, RiUserLine, RiDeleteBinLine, RiLightbulbLine, RiRefreshLine } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { userAPI, expenseAPI } from '../services/api'

const QUICK_PROMPTS = [
  "How can I save more money this month?",
  "Explain the 50-30-20 budgeting rule",
  "What are good SIP mutual funds for beginners?",
  "How to build an emergency fund?",
  "Should I invest in gold or stocks?",
  "How to reduce my monthly expenses?",
]

const SYSTEM_PROMPT = `You are FinBot, a smart AI financial advisor built into the AI Wealth Planner app. You specialize in:
- Personal finance for Indian users (INR, Indian markets, SEBI, NSE/BSE)
- Expense management, budget planning, savings strategies
- Investment guidance: SIPs, mutual funds, stocks, FDs, gold, crypto
- Goal-based savings, EMI calculations, tax planning (Indian tax system)
- NIFTY/SENSEX trends, blue-chip stocks, index funds

Guidelines:
- Always use ₹ (INR) for monetary values
- Be concise, friendly, and practical — give actionable advice
- Reference Indian financial products (PPF, NPS, ELSS, SGB) where relevant
- When asked about specific stocks, give balanced educational perspectives with a disclaimer
- If you have the user's financial context, use it to personalize your advice
- Keep responses focused and not too long unless a detailed explanation is specifically asked for`

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm **FinBot**, your AI financial advisor. I can help you with budgeting, investments, savings strategies, and all things personal finance — tailored for the Indian market.\n\nWhat would you like to know today?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [financialContext, setFinancialContext] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    // Load user's financial context to personalize responses
    Promise.all([userAPI.getDashboardStats(), expenseAPI.getStats()])
      .then(([statsRes, expenseRes]) => {
        const stats = statsRes.data.stats
        const expenseStats = expenseRes.data
        setFinancialContext({ stats, expenseStats })
      })
      .catch(() => {}) // silently fail — chatbot still works without context
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildContextMessage = () => {
    if (!financialContext?.stats) return ''
    const s = financialContext.stats
    const savingsRate = s.monthlyIncome > 0 ? ((s.actualSavings / s.monthlyIncome) * 100).toFixed(1) : 0
    return `\n\n[User's current financial snapshot: Monthly Income ₹${(s.monthlyIncome || 0).toLocaleString('en-IN')}, Monthly Expenses ₹${(s.monthlyExpense || 0).toLocaleString('en-IN')}, Savings ₹${(s.actualSavings || 0).toLocaleString('en-IN')}, Savings Rate ${savingsRate}%, Financial Health Score ${s.healthScore || 0}/100. Use this context to personalize your response if relevant.]`
  }

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return

    setInput('')
    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      // Build message history for the API (exclude the initial greeting from history)
      const apiMessages = newMessages
        .slice(1) // skip the initial assistant greeting
        .map(m => ({ role: m.role, content: m.content }))

      // Inject financial context into the last user message
      if (apiMessages.length > 0 && financialContext) {
        apiMessages[apiMessages.length - 1] = {
          ...apiMessages[apiMessages.length - 1],
          content: apiMessages[apiMessages.length - 1].content + buildContextMessage()
        }
      }

      const groqKey = import.meta.env.VITE_GROQ_KEY || ''
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...apiMessages
          ],
          max_tokens: 1000,
        }),
      })

      const data = await response.json()
      const assistantReply = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response. Please try again.'

      setMessages(prev => [...prev, { role: 'assistant', content: assistantReply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Something went wrong connecting to the AI. Please check your connection and try again.'
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "👋 Hi! I'm **FinBot**, your AI financial advisor. Chat cleared — how can I help you today?"
    }])
  }

  const renderMessage = (content) => {
    // Simple markdown-like rendering: bold, line breaks
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-surface-700 px-1.5 py-0.5 rounded text-brand-400 text-xs font-mono">$1</code>')
      .split('\n')
      .map((line, i) => `<span key="${i}">${line || '&nbsp;'}</span>`)
      .join('<br/>')
  }

  return (
    <div className="page-container flex flex-col h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <RiRobotLine className="text-brand-400" />
            FinBot — AI Chat Advisor
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Ask anything about personal finance, investments, or your financial health
          </p>
        </div>
        <button
          onClick={clearChat}
          className="btn-ghost flex items-center gap-2 text-sm text-gray-400 hover:text-red-400"
          title="Clear chat"
        >
          <RiDeleteBinLine />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap mb-4 flex-shrink-0">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full bg-surface-700 border border-surface-600 text-gray-300 hover:border-brand-500/50 hover:text-brand-400 transition-all disabled:opacity-50 flex items-center gap-1"
          >
            <RiLightbulbLine className="text-brand-500 flex-shrink-0" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-600 border border-surface-500 text-brand-400'
              }`}>
                {msg.role === 'user' ? <RiUserLine className="text-sm" /> : <RiRobotLine className="text-sm" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600/20 border border-brand-600/30 text-gray-100 rounded-tr-sm'
                  : 'bg-surface-700 border border-surface-600 text-gray-200 rounded-tl-sm'
              }`}>
                <div
                  dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-surface-600 border border-surface-500 text-brand-400">
              <RiRobotLine className="text-sm" />
            </div>
            <div className="bg-surface-700 border border-surface-600 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-brand-400 rounded-full"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 pt-3 border-t border-surface-600">
        {financialContext && (
          <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />
            FinBot has access to your financial profile for personalized advice
          </p>
        )}
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about budgeting, investments, savings..."
            className="input-field flex-1"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 py-3 flex items-center gap-2 flex-shrink-0"
          >
            {loading
              ? <RiRefreshLine className="animate-spin text-lg" />
              : <RiSendPlaneLine className="text-lg" />
            }
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          FinBot is for educational purposes only. Always consult a SEBI-registered advisor for investment decisions.
        </p>
      </div>
    </div>
  )
}
