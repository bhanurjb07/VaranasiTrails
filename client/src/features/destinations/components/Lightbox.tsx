import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import type { GalleryImage } from '@/types/api'

interface LightboxProps {
  images: readonly GalleryImage[]
  index: number
  open: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
}

/** Fullscreen viewer on a native <dialog>: arrows move, Escape closes, focus is trapped. */
export const Lightbox = ({ images, index, open, onClose, onIndexChange }: LightboxProps) => {
  const ref = useRef<HTMLDialogElement>(null)
  const count = images.length

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const go = (delta: number) => onIndexChange((index + delta + count) % count)

  const image = images[index]

  return (
    <dialog
      ref={ref}
      aria-label="Photo viewer"
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') go(1)
        if (event.key === 'ArrowLeft') go(-1)
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/90"
    >
      {open && image && (
        <div className="relative flex h-full flex-col items-center justify-center p-4 sm:p-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
          >
            <X className="size-6" aria-hidden="true" />
          </button>

          <ImageWithFallback
            src={image.url}
            alt={image.alt}
            priority
            sizes="100vw"
            className="max-h-[80vh] w-auto max-w-full rounded-control object-contain"
          />
          <p className="mt-4 text-sm text-white/80" aria-live="polite">
            {image.alt} ({index + 1} of {count})
          </p>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute top-1/2 left-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 sm:left-6"
              >
                <ChevronLeft className="size-7" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute top-1/2 right-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 sm:right-6"
              >
                <ChevronRight className="size-7" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  )
}
