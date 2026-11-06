import { arrayMove } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Tags } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from '@/components/ui/toast'
import { CategoryList } from '@/features/categories/CategoryList'
import { CategoryModal } from '@/features/categories/CategoryModal'
import { categoriesKey, useCategories, useCategoryMutations } from '@/features/categories/useCategories'
import { errorMessage } from '@/lib/formErrors'
import type { AdminCategory } from '@/types/api'

export const CategoriesPage = () => {
  const queryClient = useQueryClient()
  const { data, isPending, isError, error, refetch } = useCategories()
  const { update, remove, reorder } = useCategoryMutations()
  const [editing, setEditing] = useState<AdminCategory | 'new' | null>(null)
  const [deleting, setDeleting] = useState<AdminCategory | null>(null)

  const move = (from: number, to: number) => {
    if (!data) return
    const next = arrayMove(data, from, to)
    // Show the new order straight away; the server confirms (or we roll back).
    queryClient.setQueryData(categoriesKey, next)
    reorder.mutate(next.map((category) => category.id))
  }

  const askDelete = (category: AdminCategory) => {
    if (category.destinationCount > 0) {
      toast.warning(`"${category.name}" still has ${category.destinationCount} trip(s). Move them to another category, or switch it off instead.`)
      return
    }
    setDeleting(category)
  }

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group trips so visitors can filter them. Drag to change the order shown on the site."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden="true" /> New category
          </Button>
        }
      />

      {isError ? (
        <ErrorState error={error} title="Could not load categories" onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-20 rounded-card" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          text="Create categories like Honeymoon, Family Tour or Pilgrimage, then assign trips to them."
          action={<Button onClick={() => setEditing('new')}>New category</Button>}
        />
      ) : (
        <CategoryList
          categories={data}
          onMove={move}
          onEdit={setEditing}
          onDelete={askDelete}
          togglingId={update.isPending ? update.variables?.id : undefined}
          onToggleActive={(category, isActive) =>
            update.mutate({ id: category.id, input: { isActive } }, { onError: (err) => toast.error(errorMessage(err)) })
          }
        />
      )}

      {editing !== null && <CategoryModal open onClose={() => setEditing(null)} category={editing === 'new' ? undefined : editing} />}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
        loading={remove.isPending}
        danger
        title="Delete this category?"
        confirmLabel="Delete category"
      >
        <strong>{deleting?.name}</strong> will be removed. This cannot be undone.
      </ConfirmDialog>
    </>
  )
}
