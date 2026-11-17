import type { ReactNode } from 'react'

export interface Tile {
  label: string
  value: ReactNode
  hint?: string
}

/** A row of small summary numbers above a table or chart. */
export const StatTiles = ({ tiles }: { tiles: readonly Tile[] }) => (
  <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {tiles.map((tile) => (
      <div key={tile.label} className="rounded-lg border border-line bg-paper p-4">
        <dt className="text-sm text-muted">{tile.label}</dt>
        <dd className="mt-1 font-sans text-2xl font-bold text-ink">{tile.value}</dd>
        {tile.hint && <p className="mt-1 text-xs text-muted">{tile.hint}</p>}
      </div>
    ))}
  </dl>
)
