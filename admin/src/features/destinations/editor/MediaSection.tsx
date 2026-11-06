import { Info } from 'lucide-react'

import { SectionCard } from '@/components/ui/SectionCard'
import type { AdminDestination } from '@/types/api'
import { ImageGrid } from './ImageGrid'
import { ImageUploader } from './ImageUploader'
import { useImageUpload } from './useImageUpload'
import { useMediaMutations } from './useMediaMutations'
import { VideoSection } from './VideoSection'

interface MediaSectionProps {
  /** The saved trip. Undefined for a brand-new draft that has not been saved yet. */
  destination: AdminDestination | undefined
  disabled?: boolean
}

export const MediaSection = ({ destination, disabled }: MediaSectionProps) => {
  if (!destination) {
    return (
      <SectionCard id="media" title="Photos and video" description="Photos appear on the trip card and detail page.">
        <p className="flex items-start gap-2 rounded-control bg-info-soft px-4 py-3 text-sm text-info">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Save the draft first, then you can upload photos and a video.
        </p>
      </SectionCard>
    )
  }

  return <SavedMedia destination={destination} disabled={disabled} />
}

const SavedMedia = ({ destination, disabled }: { destination: AdminDestination; disabled?: boolean }) => {
  const media = useMediaMutations(destination.id)
  const upload = useImageUpload(destination.id, destination.images.length, media.accept)

  return (
    <SectionCard id="media" title="Photos and video" description="Drag photos to reorder. The first star marks the cover shown on cards.">
      <fieldset disabled={disabled} className="space-y-8">
        <div className="space-y-5">
          <ImageUploader items={upload.items} onFiles={upload.addFiles} onDismiss={upload.dismiss} count={destination.images.length} />

          {destination.images.length > 0 && (
            <ImageGrid
              images={destination.images}
              deleting={media.deleteImage.isPending}
              onMove={(from, to) => media.reorder.mutate({ from, to })}
              onMakeCover={(image) => media.updateImage.mutate({ imageId: image.id, input: { isCover: true } })}
              onAlt={(image, alt) => media.updateImage.mutate({ imageId: image.id, input: { alt } })}
              onDelete={(image) => media.deleteImage.mutate(image.id)}
            />
          )}
        </div>

        <VideoSection
          destinationId={destination.id}
          video={destination.video}
          saving={media.setVideo.isPending || media.removeVideo.isPending}
          onSaveYouTube={(youtubeUrl) => media.setVideo.mutate({ youtubeUrl })}
          onSaveUpload={(key) => media.setVideo.mutate({ key })}
          onRemove={() => media.removeVideo.mutate()}
        />
      </fieldset>
    </SectionCard>
  )
}
