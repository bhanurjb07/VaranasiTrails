import { useSyncExternalStore } from 'react'

// Light / dark theme. index.html applies the saved (or system) theme before the first
// paint; this module keeps it in sync afterwards. The choice is a per-browser
// convenience stored in localStorage, so a blocked storage simply falls back to the
// system setting.

export type Theme = 'light' | 'dark'

const KEY = 'vt_theme'
const THEME_COLORS: Record<Theme, string> = { light: '#FBF8F4', dark: '#100D20' }

const listeners = new Set<() => void>()

const stored = (): Theme | null => {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

const systemTheme = (): Theme => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

const apply = (theme: Theme, animate: boolean) => {
  const root = document.documentElement
  if (animate) root.classList.add('theme-transition')
  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  if (animate) window.setTimeout(() => root.classList.remove('theme-transition'), 400)
  listeners.forEach((listener) => listener())
}

export const getTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

export const setTheme = (theme: Theme) => {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Not saved; the theme still changes for this visit.
  }
  apply(theme, true)
}

// Follow the operating system until the visitor makes a choice of their own.
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!stored()) apply(systemTheme(), true)
  })
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme)
  return { theme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
}
