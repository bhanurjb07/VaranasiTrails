import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'
import type { HeroSceneHandle } from './heroScene'

/**
 * Loads the 3D river scene (three.js is its own chunk, fetched only on the home page)
 * and fades it in once the first frame is drawn. Without WebGL, the dusk gradient
 * behind it is all that shows, which still looks intentional.
 */
export const HeroBackground = ({ className }: { className?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    let handle: HeroSceneHandle | undefined
    let cancelled = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onScroll = () => {
      const height = container.clientHeight || window.innerHeight
      handle?.setScroll(window.scrollY / height)
    }

    import('./heroScene')
      .then(({ createHeroScene }) => {
        if (cancelled) return
        handle = createHeroScene(container, { reducedMotion, onReady: () => setReady(true) })
        onScroll()
      })
      .catch(() => {
        // No WebGL (or the chunk failed to load): keep the gradient.
      })

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelled = true
      window.removeEventListener('scroll', onScroll)
      handle?.dispose()
    }
  }, [])

  return (
    <div aria-hidden="true" className={cn('bg-dusk absolute inset-0 -z-20 overflow-hidden', className)}>
      <div
        ref={ref}
        className={cn('absolute inset-0 transition-opacity duration-[1400ms] ease-out', ready ? 'opacity-100' : 'opacity-0')}
      />
    </div>
  )
}
