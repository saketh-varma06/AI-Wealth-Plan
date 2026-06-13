import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'

export function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = () => {
    setLoading(true)
    userAPI.getDashboardStats()
      .then(r => setStats(r.data.stats))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  return { stats, loading, error, refetch: fetch }
}
