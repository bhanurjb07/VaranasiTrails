import { useCallback, useSyncExternalStore } from 'react'

// Browser-only storage for the admin screens that do not have a server yet.
// Each key holds one JSON value in localStorage. Every component that reads a key is
// updated when any component writes it. When the real endpoints exist, replace the hooks
// below with API calls: the screens only depend on the shapes these hooks return.

const PREFIX = 'vt-admin:'

const listeners = new Map<string, Set<() => void>>()
const cache = new Map<string, { raw: string | null; value: unknown }>()

const readRaw = (key: string): string | null => {
  try {
    return localStorage.getItem(PREFIX + key)
  } catch {
    return null
  }
}

const snapshot = <T>(key: string, seed: T): T => {
  const raw = readRaw(key)
  const hit = cache.get(key)
  if (hit && hit.raw === raw) return hit.value as T
  let value: T = seed
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T
    } catch {
      value = seed
    }
  }
  cache.set(key, { raw, value })
  return value
}

const subscribe = (key: string, listener: () => void) => {
  const set = listeners.get(key) ?? new Set()
  set.add(listener)
  listeners.set(key, set)
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFIX + key) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    set.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/** Writes a value and tells every subscriber. Returns false if the browser refused (storage full or blocked). */
export const writeLocal = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    return false
  }
  listeners.get(key)?.forEach((listener) => listener())
  return true
}

export const readLocal = <T>(key: string, seed: T): T => snapshot(key, seed)

/** Keys used by the screens, so the Export page can list them. */
export const storeKeys = [
  'bookings',
  'customers',
  'coupons',
  'media',
  'availability',
  'offers',
  'why-cards',
  'faq',
  'founders',
  'about',
  'legal',
  'settings',
] as const

/** One stored value (an object or array). `seed` must be a stable constant. */
export const useLocalValue = <T>(key: string, seed: T) => {
  const value = useSyncExternalStore(
    (listener) => subscribe(key, listener),
    () => snapshot(key, seed),
    () => seed,
  )
  const set = useCallback(
    (next: T | ((current: T) => T)) => {
      const current = snapshot(key, seed)
      const resolved = typeof next === 'function' ? (next as (current: T) => T)(current) : next
      return writeLocal(key, resolved)
    },
    [key, seed],
  )
  return [value, set] as const
}

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export interface HasId {
  id: string
}

/** A stored list of records with add, update and remove. */
export const useLocalList = <T extends HasId>(key: string, seed: readonly T[]) => {
  const [items, setItems] = useLocalValue<readonly T[]>(key, seed)

  const add = useCallback((record: Omit<T, 'id'>) => setItems((current) => [{ ...record, id: newId() } as T, ...current]), [setItems])
  const update = useCallback(
    (id: string, patch: Partial<T>) => setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    [setItems],
  )
  const remove = useCallback((id: string) => setItems((current) => current.filter((item) => item.id !== id)), [setItems])

  return { items, setItems, add, update, remove }
}
