import { CircleCheck, CircleX, ImageIcon, X } from 'lucide-react'

import { FileDropzone } from '@/components/ui/FileDropzone'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { MAX_IMAGES, type UploadItem } from './useImageUpload'

const statusText: Record<UploadItem['status'], string> = {
  queued: 'Waiting',
  compressing: 'Optimising',
  uploading: 'Uploading',
  saving: 'Saving',
  done: 'Added',
  error: 'Failed',
}

interface ImageUploaderProps {
  items: UploadItem[]
  onFiles: (files: File[]) => void
  onDismiss: (id: string) => void
  count: number
}

export const ImageUploader = ({ items, onFiles, onDismiss, count }: ImageUploaderProps) => (
  <div className="space-y-3">
    <FileDropzone
      accept="image/*"
      multiple
      onFiles={onFiles}
      disabled={count >= MAX_IMAGES}
      title="Drop photos here or choose files"
      hint={`Resized to WebP in your browser (about 2000px, under 400 KB). ${count}/${MAX_IMAGES} photos.`}
    />

    {items.length > 0 && (
      <ul className="space-y-2" aria-label="Upload progress">
        {items.map((item) => (
          <li key={item.id} className="rounded-control border border-line bg-surface px-3 py-2.5">
            <div className="flex items-center gap-3">
              {item.status === 'done' ? (
                <CircleCheck className="size-5 shrink-0 text-success" aria-hidden="true" />
              ) : item.status === 'error' ? (
                <CircleX className="size-5 shrink-0 text-danger" aria-hidden="true" />
              ) : item.status === 'queued' ? (
                <ImageIcon className="size-5 shrink-0 text-muted" aria-hidden="true" />
              ) : (
                <Spinner className="size-5 shrink-0 text-saffron" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-indigo">{item.name}</span>
              <span className={cn('text-xs font-semibold', item.status === 'error' ? 'text-danger' : 'text-muted')}>{statusText[item.status]}</span>
              {(item.status === 'error' || item.status === 'queued') && (
                <button type="button" onClick={() => onDismiss(item.id)} aria-label={`Dismiss ${item.name}`} className="rounded p-1 text-muted hover:text-indigo">
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {item.status === 'uploading' && (
              <div
                role="progressbar"
                aria-label={`Uploading ${item.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(item.progress * 100)}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-deep"
              >
                <div className="h-full rounded-full bg-saffron transition-[width]" style={{ width: `${Math.round(item.progress * 100)}%` }} />
              </div>
            )}
            {item.error && <p role="alert" className="mt-1.5 text-xs text-danger">{item.error}</p>}
          </li>
        ))}
      </ul>
    )}
  </div>
)
