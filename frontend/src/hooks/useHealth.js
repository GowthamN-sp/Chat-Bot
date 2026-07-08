/**
 * useHealth — polls the backend /api/health endpoint every 30s.
 * Returns { isOnline: boolean }.
 */
import { useState, useEffect } from 'react'
import { checkHealth } from '../services/api'

export function useHealth(intervalMs = 30_000) {
  const [isOnline, setIsOnline] = useState(null) // null = checking

  useEffect(() => {
    let cancelled = false

    const ping = async () => {
      const ok = await checkHealth()
      if (!cancelled) setIsOnline(ok)
    }

    ping()
    const id = setInterval(ping, intervalMs)
    return () => { cancelled = true; clearInterval(id) }
  }, [intervalMs])

  return { isOnline }
}
