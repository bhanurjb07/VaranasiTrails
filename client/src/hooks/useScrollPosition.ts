import { useEffect, useState } from 'react'

/** Returns true once the page is scrolled past `threshold` pixels. */
export const useScrolledPast = (threshold = 24): boolean => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
