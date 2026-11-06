import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/components/ui/toast'
import { errorMessage } from '@/lib/formErrors'
import { categoriesApi, type CategoryInput } from './api'

export const categoriesKey = ['admin', 'categories'] as const

export const useCategories = () =>
  useQuery({
    queryKey: categoriesKey,
    queryFn: ({ signal }) => categoriesApi.list(signal).then((response) => response.data),
    staleTime: 60 * 1000,
  })

export const useCategoryMutations = () => {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: categoriesKey })

  const create = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: async () => {
      await refresh()
      toast.success('Category created')
    },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) => categoriesApi.update(id, input),
    onSuccess: async () => {
      await refresh()
      toast.success('Category saved')
    },
  })

  const remove = useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: async () => {
      await refresh()
      toast.success('Category deleted')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const reorder = useMutation({
    mutationFn: categoriesApi.reorder,
    onError: async (error) => {
      toast.error(errorMessage(error))
      await refresh()
    },
    onSuccess: ({ data }) => queryClient.setQueryData(categoriesKey, data),
  })

  return { create, update, remove, reorder }
}
