import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, type PointerEvent } from 'react'
import { Link } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Container } from '@/components/layout/Container'
import { Skeleton } from '@/components/ui/Skeleton'
import { categoryImageKeys, placeholderImages } from '@/data/placeholderMedia'
import { useCategories } from '@/features/destinations/hooks/useDestinations'
import type { Category } from '@/types/api'

/** Pixels per second the strip drifts left on its own. */
const SPEED = 38
/** Tiles in one copy of the strip, so it is always wider than the screen. */
const MIN_TILES = 6

const Tile = ({ category, hidden = false }: { category: Category; hidden?: boolean }) => {
  const image = placeholderImages[categoryImageKeys[category.slug] ?? 'riverBoats']
  return (
    <Link
      to={`/destinations?category=${category.slug}`}
      tabIndex={hidden ? -1 : undefined}
      draggable={false}
      className="lift group relative flex h-72 flex-col justify-between overflow-hidden rounded-lg bg-canvas-alt p-5 select-none lg:h-[21rem]"
    >
      <ImageWithFallback
        src={image.url}
        alt=""
        sizes="288px"
        draggable={false}
        className="absolute inset-0 size-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/10 to-black/55" aria-hidden="true" />
      <span className="relative font-sans text-xl leading-snug font-bold text-ivory sm:text-2xl">{category.name}</span>
      <span className="relative text-sm text-ivory">Browse trips</span>
    </Link>
  )
}

/**
 * Every category in one endless strip. It drifts left by itself, pauses while the pointer or
 * focus is on it, and can be moved by hand: scroll, swipe, drag with the mouse, or use the
 * arrows. The list is shown twice, and the position jumps back by one copy's width, so there
 * is never an end. It stands still for people who ask their device to reduce motion.
 */
const CategoryStrip = ({ categories }: { categories: readonly Category[] }) => {
  const scroller = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLUListElement>(null)
  /** True while the pointer or keyboard focus is on the strip. */
  const hover = useRef(false)
  /** After a swipe, wheel scroll or key press the drift waits this long (a timestamp). */
  const holdUntil = useRef(0)
  const dragging = useRef<{ startX: number; startLeft: number; moved: boolean } | null>(null)

  const holdOff = (ms = 2000) => {
    holdUntil.current = performance.now() + ms
  }

  const half = Array.from({ length: Math.max(1, Math.ceil(MIN_TILES / categories.length)) }, () => categories).flat()

  useEffect(() => {
    const el = scroller.current
    const list = track.current
    if (!el || !list) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let visible = true
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
    })
    observer.observe(el)

    // Start one copy in, so there is room to scroll left as well as right.
    const loopWidth = () => list.scrollWidth / 2
    el.scrollLeft = loopWidth() / 2

    let position = el.scrollLeft
    let last = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const width = loopWidth()
      // Someone moved it by hand (or a smooth scroll is under way): carry on from there.
      if (Math.abs(el.scrollLeft - position) > 1.5) position = el.scrollLeft
      // Only write the position when this loop is the one moving it. Writing every frame would
      // cancel the browser's own smooth scroll and swipe momentum.
      let write = false
      if (!reduced && visible && !hover.current && now >= holdUntil.current && !dragging.current) {
        position += SPEED * dt
        write = true
      }
      if (width > 0) {
        const shift = position >= width ? -width : position <= 0 ? width : 0
        if (shift !== 0) {
          position += shift
          write = true
          // Keep a drag in progress lined up with the jump.
          if (dragging.current) dragging.current.startLeft += shift
        }
      }
      if (write) {
        el.scrollLeft = position
        position = el.scrollLeft
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  const nudge = (direction: 1 | -1) => scroller.current?.scrollBy({ left: direction * 304, behavior: 'smooth' })

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !scroller.current) return
    dragging.current = { startX: event.clientX, startLeft: scroller.current.scrollLeft, moved: false }
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragging.current
    if (!drag || !scroller.current) return
    const dx = event.clientX - drag.startX
    if (Math.abs(dx) > 5) drag.moved = true
    if (drag.moved) scroller.current.scrollLeft = drag.startLeft - dx
  }
  const endDrag = () => {
    // Keep the flag a moment so the click that ends a drag does not open a category.
    const drag = dragging.current
    if (drag?.moved) window.setTimeout(() => (dragging.current = null), 0)
    else dragging.current = null
  }

  return (
    <div
      className="group/strip relative mt-5"
      role="region"
      aria-label="Browse by category, scrolls on its own. Use the arrows or swipe to move it."
      onPointerEnter={(event) => {
        // Touch has no hover; it is handled by the touch events below.
        if (event.pointerType === 'mouse') hover.current = true
      }}
      onPointerLeave={() => (hover.current = false)}
      onFocusCapture={() => (hover.current = true)}
      onBlurCapture={() => (hover.current = false)}
    >
      <div
        ref={scroller}
        onWheel={() => holdOff()}
        onTouchStart={() => holdOff(4000)}
        onTouchMove={() => holdOff(4000)}
        onTouchEnd={() => holdOff()}
        onKeyDown={() => holdOff()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(event) => {
          if (dragging.current?.moved) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
        className="scrollbar-none cursor-grab overflow-x-auto py-3 active:cursor-grabbing [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
      >
        <ul ref={track} className="flex w-max">
          {[...half, ...half].map((category, index) => (
            <li key={`${category.id}-${index}`} className="mr-4 w-[18rem] shrink-0" aria-hidden={index >= half.length || undefined}>
              <Tile category={category} hidden={index >= half.length} />
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        aria-label="Previous categories"
        onClick={() => nudge(-1)}
        className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg transition-[opacity,transform] duration-200 group-hover/strip:opacity-100 hover:scale-105 focus-visible:opacity-100"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next categories"
        onClick={() => nudge(1)}
        className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg transition-[opacity,transform] duration-200 group-hover/strip:opacity-100 hover:scale-105 focus-visible:opacity-100"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}

export const Categories = () => {
  const { data, isPending } = useCategories()

  // Categories are a nice-to-have on the home page: hide the section if they fail.
  if (!isPending && (!data || data.length === 0)) return null

  return (
    <section className="hidden bg-canvas py-8 sm:block sm:py-12" aria-labelledby="categories-title">
      <Container>
        <h2 id="categories-title" className="font-sans text-2xl font-bold tracking-normal text-ink sm:text-[1.75rem]">
          Browse by category
        </h2>
      </Container>

      {isPending || !data ? (
        <Container>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <li key={index}>
                <Skeleton className="h-72 rounded-lg lg:h-[21rem]" />
              </li>
            ))}
          </ul>
        </Container>
      ) : (
        <CategoryStrip categories={data} />
      )}
    </section>
  )
}
