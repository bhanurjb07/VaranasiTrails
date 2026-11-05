import { Expand } from 'lucide-react'
import { useState } from 'react'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/lib/cn'
import type { GalleryImage } from '@/types/api'
import { Lightbox } from './Lightbox'
import { VideoEmbed } from './VideoEmbed'

interface GalleryProps {
  images: readonly GalleryImage[]
  title: string
  videoUrl?: string | null
}

export const Gallery = ({ images, title, videoUrl }: GalleryProps) => {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [tab, setTab] = useState('photos')

  const current = images[index] ?? images[0]

  const photos = (
    <div>
      <div className="group relative overflow-hidden rounded-card bg-cream-deep">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label={`Open ${title} photo ${index + 1} fullscreen`}
          className="block aspect-[4/3] w-full cursor-zoom-in sm:aspect-[16/10]"
        >
          <ImageWithFallback
            src={current?.url}
            alt={current?.alt ?? title}
            width={1200}
            height={750}
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="size-full transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </button>
        <span className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-indigo/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <Expand className="size-3.5" aria-hidden="true" />
          {index + 1} / {Math.max(images.length, 1)}
        </span>
      </div>

      {images.length > 1 && (
        <ul
          className="scrollbar-none mt-3 flex gap-3 overflow-x-auto pb-1"
          role="listbox"
          aria-label="Photo thumbnails"
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') setIndex((value) => (value + 1) % images.length)
            if (event.key === 'ArrowLeft') setIndex((value) => (value - 1 + images.length) % images.length)
          }}
        >
          {images.map((image, i) => (
            <li key={image.url + i} role="presentation" className="shrink-0">
              <button
                type="button"
                role="option"
                aria-selected={i === index}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'block h-16 w-24 overflow-hidden rounded-control border-2 transition-all sm:h-20 sm:w-28',
                  i === index ? 'border-saffron' : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <ImageWithFallback
                  src={image.url}
                  alt=""
                  width={224}
                  height={160}
                  sizes="112px"
                  className="size-full"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Lightbox
        images={images}
        index={index}
        open={lightbox}
        onClose={() => setLightbox(false)}
        onIndexChange={setIndex}
      />
    </div>
  )

  if (!videoUrl) return photos

  return (
    <Tabs
      value={tab}
      onChange={setTab}
      items={[
        { id: 'photos', label: 'Photos', panel: photos },
        { id: 'video', label: 'Video', panel: <VideoEmbed url={videoUrl} title={title} /> },
      ]}
    />
  )
}
