import { useCallback, useEffect, useRef, useState } from 'react'

import { toast } from '@/components/ui/toast'
import { errorMessage } from '@/lib/formErrors'
import { compressImage } from '@/lib/imageCompress'
import { uploadToUrl } from '@/lib/upload'
import type { AdminDestination } from '@/types/api'
import { destinationsApi } from '../api'

export const MAX_IMAGES = 20
const MAX_SOURCE_BYTES = 40 * 1024 * 1024
const CONCURRENCY = 2

export type UploadStatus = 'queued' | 'compressing' | 'uploading' | 'saving' | 'done' | 'error'

export interface UploadItem {
  id: string
  name: string
  status: UploadStatus
  /** 0..1 while uploading. */
  progress: number
  error?: string
}

const fileLabel = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()

/**
 * Upload pipeline for photos: shrink to WebP in the browser, ask the server for a signed
 * URL, PUT straight to R2 with progress, then register the file on the trip.
 */
export const useImageUpload = (
  destinationId: string,
  currentCount: number,
  onSaved: (destination: AdminDestination) => void,
) => {
  const [items, setItems] = useState<UploadItem[]>([])
  const counter = useRef(0)
  const active = useRef(0)
  const queue = useRef<{ id: string; file: File }[]>([])
  // Latest values for use inside callbacks without re-creating them.
  const countRef = useRef(currentCount)
  const itemsRef = useRef<UploadItem[]>([])
  useEffect(() => {
    countRef.current = currentCount
    itemsRef.current = items
  })

  const patch = useCallback((id: string, update: Partial<UploadItem>) => {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...update } : item)))
  }, [])

  const processOne = useCallback(
    async ({ id, file }: { id: string; file: File }) => {
      try {
        patch(id, { status: 'compressing' })
        const compressed = await compressImage(file)

        patch(id, { status: 'uploading', progress: 0 })
        const presigned = await destinationsApi.presign(destinationId, {
          filename: file.name,
          contentType: compressed.contentType,
          sizeBytes: compressed.blob.size,
        })
        await uploadToUrl(presigned.uploadUrl, compressed.blob, compressed.contentType, (progress) => patch(id, { progress }))

        patch(id, { status: 'saving', progress: 1 })
        const { destination } = await destinationsApi.addImage(destinationId, presigned.key, fileLabel(file.name))
        onSaved(destination)

        patch(id, { status: 'done' })
        setTimeout(() => setItems((list) => list.filter((item) => item.id !== id)), 2500)
      } catch (error) {
        patch(id, { status: 'error', error: errorMessage(error) })
      }
    },
    [destinationId, onSaved, patch],
  )

  const pump = useCallback(
    function run() {
      while (active.current < CONCURRENCY && queue.current.length > 0) {
        const next = queue.current.shift()!
        active.current += 1
        void processOne(next).finally(() => {
          active.current -= 1
          run()
        })
      }
    },
    [processOne],
  )

  const addFiles = useCallback(
    (files: File[]) => {
      const inFlight = itemsRef.current.filter((item) => item.status !== 'done' && item.status !== 'error').length
      const room = MAX_IMAGES - countRef.current - inFlight
      const valid: File[] = []

      for (const file of files) {
        if (!file.type.startsWith('image/')) toast.error(`${file.name} is not an image`)
        else if (file.size > MAX_SOURCE_BYTES) toast.error(`${file.name} is too large (max 40 MB)`)
        else valid.push(file)
      }

      if (valid.length > room) {
        toast.warning(room > 0 ? `Only ${room} more photo${room === 1 ? '' : 's'} fit (max ${MAX_IMAGES}). Extra files were skipped.` : `A trip can have at most ${MAX_IMAGES} photos.`)
      }
      const taken = valid.slice(0, Math.max(room, 0))
      if (taken.length === 0) return

      const added = taken.map((file) => ({ id: `upload-${++counter.current}`, file }))
      setItems((list) => [...list, ...added.map(({ id, file }) => ({ id, name: file.name, status: 'queued' as const, progress: 0 }))])
      queue.current.push(...added)
      pump()
    },
    [pump],
  )

  const dismiss = useCallback((id: string) => {
    setItems((list) => list.filter((item) => item.id !== id))
  }, [])

  const busy = items.some((item) => item.status !== 'done' && item.status !== 'error')

  return { items, addFiles, dismiss, busy }
}
