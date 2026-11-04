import { useEffect, useState } from 'react'

/**
 * True once `active` has stayed true for `delay` ms. Used to explain a slow
 * request: the free backend sleeps when idle and takes up to a minute to wake.
 */
export function useSlow(active, delay = 4000) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setSlow(true), delay)
    return () => {
      clearTimeout(timer)
      setSlow(false)
    }
  }, [active, delay])

  return active && slow
}