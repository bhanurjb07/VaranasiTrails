import { useCallback, useEffect, useState } from 'react'

/** Counts down from `seconds` to 0. `restart()` begins again (e.g. after a resend). */
export const useCountdown = (initialSeconds: number) => {
  const [remaining, setRemaining] = useState(initialSeconds)

  useEffect(() => {
    if (remaining <= 0) return
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  const restart = useCallback((seconds = initialSeconds) => setRemaining(seconds), [initialSeconds])

  return { remaining, restart }
}
