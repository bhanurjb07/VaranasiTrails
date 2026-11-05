import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'

export interface SectionLink {
  id: string
  label: string
}

/** Sticky anchor bar that highlights the section currently in view. */
export const SectionNav = ({ sections }: { sections: readonly SectionLink[] }) => {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        const first = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (first) setActive(first.target.id)
      },
      { rootMargin: '-120px 0px -60% 0px' },
    )

    for (const section of sections) {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav
      aria-label="Trip sections"
      className="sticky top-[3.9rem] z-20 -mx-5 border-b border-line bg-cream/90 px-5 backdrop-blur sm:-mx-8 sm:px-8"
    >
      <ul className="scrollbar-none flex gap-1 overflow-x-auto py-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? 'true' : undefined}
              className={cn(
                'block rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                active === section.id ? 'bg-indigo text-white' : 'text-indigo hover:bg-indigo/5',
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
