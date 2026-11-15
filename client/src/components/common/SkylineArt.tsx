import { cn } from '@/lib/cn'

/**
 * Decorative ghats-at-dusk silhouette with a few softly glowing diyas on the water.
 * Pure SVG + CSS (no WebGL), so it is cheap enough for the auth screens.
 */
export const SkylineArt = ({ className }: { className?: string }) => (
  <div aria-hidden="true" className={cn('pointer-events-none select-none', className)}>
    <svg viewBox="0 0 600 220" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
      <defs>
        <linearGradient id="skyline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-night-deep)" stopOpacity="0.95" />
          <stop offset="1" stopColor="var(--color-night-deep)" />
        </linearGradient>
        <linearGradient id="skyline-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0763d" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f0763d" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        fill="url(#skyline-fill)"
        d="M0 150 L0 132 L30 132 L30 120 L52 120 L52 132 L70 132 C74 112 84 92 92 70 L95 58 L98 70 C106 92 116 112 120 132 L150 132 L150 116 C150 96 182 96 182 116 L182 132 L205 132 L205 104 L214 104 C218 94 226 94 230 104 L262 104 L262 132 L290 132 C296 108 306 84 316 56 L320 40 L324 56 C334 84 344 108 350 132 L372 132 L372 112 C372 90 410 90 410 112 L410 132 L436 132 L436 98 L470 98 L470 132 L492 132 C498 114 506 96 514 76 L517 66 L520 76 C528 96 536 114 542 132 L566 132 L566 118 L600 118 L600 150 Z"
      />
      <rect x="0" y="150" width="600" height="70" fill="url(#skyline-water)" />
      <g stroke="#f0763d" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round">
        <path d="M80 166h60M230 176h90M410 168h70M140 192h50M330 198h80" />
      </g>
      <g fill="#ffb347">
        <circle cx="120" cy="172" r="3" className="animate-[float-glow_5s_ease-in-out_infinite]" />
        <circle cx="300" cy="186" r="3.5" className="animate-[float-glow_6s_ease-in-out_infinite_0.8s]" />
        <circle cx="455" cy="176" r="3" className="animate-[float-glow_5.5s_ease-in-out_infinite_1.6s]" />
      </g>
    </svg>
  </div>
)
