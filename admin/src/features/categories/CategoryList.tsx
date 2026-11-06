import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SortableItem, SortableList } from '@/components/ui/SortableList'
import { Switch } from '@/components/ui/Switch'
import type { AdminCategory } from '@/types/api'

interface CategoryListProps {
  categories: AdminCategory[]
  onMove: (from: number, to: number) => void
  onToggleActive: (category: AdminCategory, active: boolean) => void
  onEdit: (category: AdminCategory) => void
  onDelete: (category: AdminCategory) => void
  togglingId?: string
}

/** Sortable list of categories (drag the handle, or focus it and use the arrow keys). */
export const CategoryList = ({ categories, onMove, onToggleActive, onEdit, onDelete, togglingId }: CategoryListProps) => (
  <SortableList ids={categories.map((category) => category.id)} onMove={onMove}>
    <ul className="space-y-3">
      {categories.map((category) => {
        const inUse = category.destinationCount > 0
        return (
          <li key={category.id}>
            <SortableItem id={category.id} handleLabel={`Reorder ${category.name}`}>
              {(handle) => (
                <Card className="flex flex-wrap items-center gap-4 p-4">
                  {handle}
                  <span className="size-14 shrink-0 overflow-hidden rounded-control bg-cream-deep">
                    {category.imageUrl && <img src={category.imageUrl} alt="" loading="lazy" className="size-full object-cover" />}
                  </span>

                  <div className="min-w-0 flex-1 basis-56">
                    <p className="truncate font-semibold text-indigo">{category.name}</p>
                    <p className="truncate text-xs text-muted">/{category.slug}</p>
                    {category.description && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{category.description}</p>}
                  </div>

                  <Badge variant={inUse ? 'info' : 'neutral'}>
                    {category.destinationCount} trip{category.destinationCount === 1 ? '' : 's'}
                  </Badge>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted" aria-hidden="true">
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      label={`${category.name} is ${category.isActive ? 'active' : 'inactive'}`}
                      checked={category.isActive}
                      disabled={togglingId === category.id}
                      onChange={(active) => onToggleActive(category, active)}
                    />
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${category.name}`} onClick={() => onEdit(category)}>
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${category.name}`}
                      title={inUse ? 'Move its trips elsewhere first, or deactivate it instead' : 'Delete'}
                      onClick={() => onDelete(category)}
                    >
                      <Trash2 className="size-4 text-danger" aria-hidden="true" />
                    </Button>
                  </div>
                </Card>
              )}
            </SortableItem>
          </li>
        )
      })}
    </ul>
  </SortableList>
)
