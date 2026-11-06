import { useMutation, useQueryClient } from '@tanstack/react-query'
import { arrayMove } from '@dnd-kit/sortable'

import { toast } from '@/components/ui/toast'
import { errorMessage } from '@/lib/formErrors'
import type { AdminDestination } from '@/types/api'
import { destinationsApi } from '../api'
import { destinationKeys } from '../useDestinations'

/** Image and video changes save immediately (they are not part of the form's Save button). */
export const useMediaMutations = (id: string) => {
  const queryClient = useQueryClient()
  const detailKey = destinationKeys.detail(id)

  const accept = (destination: AdminDestination) => {
    queryClient.setQueryData(detailKey, destination)
    // Covers and counts show in the list, so refresh it without refetching this editor.
    void queryClient.invalidateQueries({ queryKey: ['admin', 'destinations', 'list'] })
  }

  const reorder = useMutation({
    mutationFn: ({ from, to }: { from: number; to: number }) => {
      const current = queryClient.getQueryData<AdminDestination>(detailKey)
      const ids = arrayMove(current?.images.map((image) => image.id) ?? [], from, to)
      return destinationsApi.reorderImages(id, ids).then((response) => response.destination)
    },
    // Move the thumbnail straight away; roll back if the server says no.
    onMutate: async ({ from, to }) => {
      await queryClient.cancelQueries({ queryKey: detailKey })
      const previous = queryClient.getQueryData<AdminDestination>(detailKey)
      if (previous) {
        queryClient.setQueryData<AdminDestination>(detailKey, { ...previous, images: arrayMove(previous.images, from, to) })
      }
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(detailKey, context.previous)
      toast.error(errorMessage(error))
    },
    onSuccess: accept,
  })

  const updateImage = useMutation({
    mutationFn: ({ imageId, input }: { imageId: string; input: { alt?: string; isCover?: boolean } }) =>
      destinationsApi.updateImage(id, imageId, input).then((response) => response.destination),
    onSuccess: accept,
    onError: (error) => toast.error(errorMessage(error)),
  })

  const deleteImage = useMutation({
    mutationFn: (imageId: string) => destinationsApi.deleteImage(id, imageId).then((response) => response.destination),
    onSuccess: (destination) => {
      accept(destination)
      toast.success('Photo removed')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const setVideo = useMutation({
    mutationFn: (input: { youtubeUrl: string } | { key: string }) =>
      destinationsApi.setVideo(id, input).then((response) => response.destination),
    onSuccess: (destination) => {
      accept(destination)
      toast.success('Video saved')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const removeVideo = useMutation({
    mutationFn: () => destinationsApi.removeVideo(id).then((response) => response.destination),
    onSuccess: (destination) => {
      accept(destination)
      toast.success('Video removed')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  return { accept, reorder, updateImage, deleteImage, setVideo, removeVideo }
}
