import { useState, useEffect, useCallback } from 'react'
import { expenseAPI } from '../services/api'
import toast from 'react-hot-toast'

export function useExpenses(initialFilter = {}) {
  const [expenses, setExpenses] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ category: 'All', search: '', page: 1, ...initialFilter })

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: filter.page, limit: 20 }
      if (filter.category !== 'All') params.category = filter.category
      if (filter.search) params.search = filter.search
      if (filter.startDate) params.startDate = filter.startDate
      if (filter.endDate) params.endDate = filter.endDate
      const { data } = await expenseAPI.getExpenses(params)
      setExpenses(data.expenses)
      setTotal(data.total)
    } catch { toast.error('Failed to load expenses') }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetch() }, [fetch])

  return { expenses, total, loading, filter, setFilter, refetch: fetch }
}

export function useExpenseStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    expenseAPI.getStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { stats, loading }
}
