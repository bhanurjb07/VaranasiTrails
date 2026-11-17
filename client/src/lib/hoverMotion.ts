import { gsap } from 'gsap'
import { useEffect, type RefObject } from 'react'

/**
 * Builds a paused GSAP timeline for every element matching `selector` inside `scope`,
 * plays it on hover or keyboard focus and reverses it on leave. Slow, eased, no bounce.
 * Skipped entirely for visitors who prefer reduced motion.
 */
export const useHoverMotion = (
  scope: RefObject<HTMLElement | null>,
  selector: string,
  build: (item: HTMLElement, timeline: gsap.core.Timeline) => void,
  deps: readonly unknown[] = [],
) => {
  useEffect(() => {
    const root = scope.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cleanups: (() => void)[] = []
    const context = gsap.context(() => {
      root.querySelectorAll<HTMLElement>(selector).forEach((item) => {
        const timeline = gsap.timeline({ paused: true, defaults: { duration: 0.6, ease: 'power2.out' } })
        build(item, timeline)
        const enter = () => timeline.play()
        const leave = (event: Event) => {
          // Keep it open while focus is still inside the item.
          if (event.type === 'focusout' && item.contains((event as FocusEvent).relatedTarget as Node)) return
          timeline.reverse()
        }
        item.addEventListener('mouseenter', enter)
        item.addEventListener('mouseleave', leave)
        item.addEventListener('focusin', enter)
        item.addEventListener('focusout', leave)
        cleanups.push(() => {
          item.removeEventListener('mouseenter', enter)
          item.removeEventListener('mouseleave', leave)
          item.removeEventListener('focusin', enter)
          item.removeEventListener('focusout', leave)
        })
      })
    }, root)

    return () => {
      cleanups.forEach((cleanup) => cleanup())
      context.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, selector, ...deps])
}
