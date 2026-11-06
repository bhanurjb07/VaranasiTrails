import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface SortableListProps {
  ids: readonly string[]
  /** Called after a drop with the item's old and new index. */
  onMove: (from: number, to: number) => void
  layout?: 'list' | 'grid'
  children: ReactNode
}

/** Drag-to-reorder container. Works with the mouse, touch and the keyboard (space, arrows). */
export const SortableList = ({ ids, onMove, layout = 'list', children }: SortableListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from === -1 || to === -1) return
    onMove(from, to)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={[...ids]} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

interface SortableItemProps {
  id: string
  /** Accessible name for the drag handle, e.g. "Reorder highlight 2". */
  handleLabel: string
  className?: string
  /** Receives the drag handle so it can be placed anywhere in the row. */
  children: (handle: ReactNode) => ReactNode
}

export const SortableItem = ({ id, handleLabel, className, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const handle = (
    <button
      type="button"
      aria-label={handleLabel}
      className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-control text-muted hover:bg-cream-deep hover:text-indigo active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-5" aria-hidden="true" />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'relative z-10 opacity-80 shadow-lift', className)}
    >
      {children(handle)}
    </div>
  )
}
