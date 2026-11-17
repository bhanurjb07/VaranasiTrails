import type { ReactElement } from 'react'

// Small flat illustrations for the "Why VaranasiTrails?" cards, drawn with the site's
// own colours only: yellow, white and the two blues. Keys match the icon names in
// src/data/home.ts.
const base = { viewBox: '0 0 64 64', fill: 'none', 'aria-hidden': true } as const
const line = { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const whyIllustrations: Record<string, ReactElement> = {
  shield: (
    <svg {...base}>
      <rect x="14" y="6" width="32" height="46" rx="3" className="fill-white stroke-navy" {...line} />
      <path d="M21 18h18M21 26h18M21 34h10" className="stroke-brand" {...line} />
      <circle cx="44" cy="44" r="13" className="fill-gold stroke-navy" {...line} />
      <path d="m38 44 4.5 4.5L50.5 40" className="stroke-navy" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  map: (
    <svg {...base}>
      <path d="m6 17 17-6 18 6 17-6v36l-17 6-18-6-17 6z" className="fill-white stroke-navy" {...line} />
      <path d="m23 11 18 6v36l-18-6z" className="fill-gold stroke-navy" {...line} />
      <path d="M45 8c-5.5 0-9.5 4-9.5 9 0 7 9.5 15 9.5 15s9.5-8 9.5-15c0-5-4-9-9.5-9z" className="fill-brand stroke-navy" {...line} />
      <circle cx="45" cy="17" r="3.5" className="fill-white" />
    </svg>
  ),
  group: (
    <svg {...base}>
      <circle cx="12" cy="26" r="5.5" className="fill-white stroke-navy" {...line} />
      <path d="M2 52c0-8 4-14 10-14s10 6 10 14z" className="fill-gold stroke-navy" {...line} />
      <circle cx="52" cy="26" r="5.5" className="fill-white stroke-navy" {...line} />
      <path d="M42 52c0-8 4-14 10-14s10 6 10 14z" className="fill-gold stroke-navy" {...line} />
      <circle cx="32" cy="20" r="8" className="fill-gold stroke-navy" {...line} />
      <path d="M17 54c0-10 6-18 15-18s15 8 15 18z" className="fill-white stroke-navy" {...line} />
    </svg>
  ),
  chat: (
    <svg {...base}>
      <path d="M24 8h30a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4h-6v8l-9-8H24a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" className="fill-brand stroke-navy" {...line} />
      <path d="M10 24h30a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H27l-9 8v-8h-8a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z" className="fill-gold stroke-navy" {...line} />
      <path d="M15 33h22M15 40h13" className="stroke-navy" {...line} />
    </svg>
  ),
}
