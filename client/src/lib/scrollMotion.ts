import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

/**
 * Gentle parallax: the element drifts from -distance% to +distance% of its height while its
 * parent scrolls through the viewport. Give the element some extra height (for example
 * scale-110 or -inset-y-[10%]) inside an overflow-hidden parent so no edge ever shows.
 * Nothing moves for visitors who prefer reduced motion.
 */
export const useParallax = (target: RefObject<HTMLElement | null>, distance = 6) => {
  useEffect(() => {
    const element = target.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { yPercent: -distance },
        {
          yPercent: distance,
          ease: 'none',
          scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        },
      )
    })
    return () => context.revert()
  }, [target, distance])
}
