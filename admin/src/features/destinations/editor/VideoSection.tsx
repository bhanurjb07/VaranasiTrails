import { Play, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field } from '@/components/ui/Field'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { toast } from '@/components/ui/toast'
import { errorMessage } from '@/lib/formErrors'
import { parseYouTubeUrl } from '@/lib/youtube'
import { uploadToUrl } from '@/lib/upload'
import type { AdminVideo } from '@/types/api'
import { destinationsApi } from '../api'

const MAX_VIDEO_BYTES = 50 * 1024 * 1024
const VIDEO_TYPES = ['video/mp4', 'video/webm']

interface VideoSectionProps {
  destinationId: string
  video: AdminVideo | null
  saving: boolean
  onSaveYouTube: (url: string) => void
  onSaveUpload: (key: string) => void
  onRemove: () => void
}

/** Video: paste a YouTube link (validated and previewed) or upload an MP4 / WebM. */
export const VideoSection = ({ destinationId, video, saving, onSaveYouTube, onSaveUpload, onRemove }: VideoSectionProps) => {
  const [link, setLink] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const embed = link.trim() ? parseYouTubeUrl(link) : null
  const linkError = link.trim() && !embed ? 'Paste a YouTube link (watch, youtu.be or embed).' : undefined

  const upload = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    if (!VIDEO_TYPES.includes(file.type)) return void toast.error('Use an MP4 or WebM video.')
    if (file.size > MAX_VIDEO_BYTES) return void toast.error('Videos can be at most 50 MB.')

    try {
      setProgress(0)
      const presigned = await destinationsApi.presign(destinationId, { filename: file.name, contentType: file.type, sizeBytes: file.size })
      await uploadToUrl(presigned.uploadUrl, file, file.type, setProgress)
      onSaveUpload(presigned.key)
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-sans text-base font-semibold text-indigo">Video (optional)</h3>

      {video && (
        <div className="space-y-3">
          <div className="aspect-video overflow-hidden rounded-card bg-indigo">
            {video.type === 'YOUTUBE' ? (
              <iframe src={video.url} title="Trip video" loading="lazy" allowFullScreen className="size-full" />
            ) : (
              <video src={video.url} controls preload="metadata" className="size-full" aria-label="Trip video" />
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm text-muted">{video.type === 'YOUTUBE' ? 'YouTube video' : 'Uploaded video'}</p>
            <Button variant="outline" size="sm" onClick={() => setConfirmRemove(true)}>
              <Trash2 className="size-4 text-danger" aria-hidden="true" /> Remove video
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="YouTube link" error={linkError}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} invalid={invalid} aria-describedby={describedBy} placeholder="https://www.youtube.com/watch?v=..." value={link} onChange={(event) => setLink(event.target.value)} />
            )}
          </Field>
          {embed && (
            <div className="aspect-video overflow-hidden rounded-card bg-indigo">
              <iframe src={embed} title="YouTube preview" loading="lazy" allowFullScreen className="size-full" />
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            disabled={!embed}
            loading={saving}
            onClick={() => {
              if (embed) {
                onSaveYouTube(link.trim())
                setLink('')
              }
            }}
          >
            <Play className="size-4" aria-hidden="true" /> {video ? 'Replace with this link' : 'Use this link'}
          </Button>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-indigo">Or upload a file</p>
          {progress !== null ? (
            <div className="flex items-center gap-3 rounded-card border border-line p-4" role="status">
              <Spinner className="size-5 text-saffron" />
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo">Uploading video... {Math.round(progress * 100)}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-deep">
                  <div className="h-full rounded-full bg-saffron" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <FileDropzone accept="video/mp4,video/webm" onFiles={(files) => void upload(files)} disabled={saving} title="Drop an MP4 or WebM, or choose a file" hint="Up to 50 MB." />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => {
          onRemove()
          setConfirmRemove(false)
        }}
        danger
        title="Remove the video?"
        confirmLabel="Remove video"
      >
        The video disappears from the trip{video?.type === 'UPLOAD' ? ' and the uploaded file is deleted' : ''}.
      </ConfirmDialog>
    </div>
  )
}
