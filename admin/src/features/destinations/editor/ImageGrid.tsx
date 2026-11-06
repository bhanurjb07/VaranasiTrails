import { Star, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { SortableItem, SortableList } from '@/components/ui/SortableList'
import { formatBytes } from '@/lib/format'
import type { AdminImage } from '@/types/api'

interface ImageGridProps {
  images: AdminImage[]
  onMove: (from: number, to: number) => void
  onMakeCover: (image: AdminImage) => void
  onAlt: (image: AdminImage, alt: string) => void
  onDelete: (image: AdminImage) => void
  deleting: boolean
}

const AltInput = ({ image, onAlt }: { image: AdminImage; onAlt: (alt: string) => void }) => {
  const [value, setValue] = useState(image.alt)
  const save = () => {
    const alt = value.trim()
    if (alt !== image.alt) onAlt(alt)
  }

  return (
    <Input
      aria-label={`Alt text for photo ${image.sortOrder + 1}`}
      placeholder="Describe the photo"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => event.key === 'Enter' && (event.currentTarget.blur(), event.preventDefault())}
      className="h-9 text-sm"
    />
  )
}

/** Drag-to-reorder photo grid with cover, alt text and delete. */
export const ImageGrid = ({ images, onMove, onMakeCover, onAlt, onDelete, deleting }: ImageGridProps) => {
  const [toDelete, setToDelete] = useState<AdminImage | null>(null)

  return (
    <>
      <SortableList ids={images.map((image) => image.id)} onMove={onMove} layout="grid">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.id}>
              <SortableItem id={image.id} handleLabel={`Reorder photo ${index + 1}`} className="overflow-hidden rounded-card border border-line bg-surface">
                {(handle) => (
                  <div>
                    <div className="relative aspect-[4/3] bg-cream-deep">
                      <img src={image.url} alt={image.alt || `Photo ${index + 1}`} loading="lazy" className="size-full object-cover" />
                      <div className="absolute top-2 left-2 rounded-control bg-white/90 shadow-card">{handle}</div>
                      {image.isCover && (
                        <Badge variant="warning" className="absolute top-2 right-2 bg-saffron text-indigo">
                          <Star className="size-3 fill-current" aria-hidden="true" /> Cover
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2.5 p-3">
                      <AltInput key={image.alt} image={image} onAlt={(alt) => onAlt(image, alt)} />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted">
                          #{index + 1} &middot; {formatBytes(image.sizeBytes)}
                        </span>
                        <div className="flex gap-1">
                          {!image.isCover && (
                            <Button size="sm" variant="ghost" onClick={() => onMakeCover(image)}>
                              Make cover
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" aria-label={`Delete photo ${index + 1}`} onClick={() => setToDelete(image)}>
                            <Trash2 className="size-4 text-danger" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </SortableItem>
            </li>
          ))}
        </ul>
      </SortableList>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) onDelete(toDelete)
          setToDelete(null)
        }}
        loading={deleting}
        danger
        title="Delete this photo?"
        confirmLabel="Delete photo"
      >
        The photo is removed from this trip{toDelete?.isCover ? ' and another photo becomes the cover' : ''}. If no other trip uses the file, it is deleted from storage.
      </ConfirmDialog>
    </>
  )
}
