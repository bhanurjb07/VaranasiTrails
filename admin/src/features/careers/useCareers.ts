import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/components/ui/toast'
import { errorMessage } from '@/lib/formErrors'
import { careersApi, type CareerInput, type CareerQuery } from './api'

export const careerKeys = {
  all: ['admin', 'careers'] as const,
  list: (query: CareerQuery) => ['admin', 'careers', 'list', query] as const,
  departments: ['admin', 'careers', 'departments'] as const,
}

export const useCareerList = (query: CareerQuery) =>
  useQuery({
    queryKey: careerKeys.list(query),
    queryFn: ({ signal }) => careersApi.list(query, signal),
    placeholderData: keepPreviousData,
  })

export const useDepartments = () =>
  useQuery({
    queryKey: careerKeys.departments,
    queryFn: ({ signal }) => careersApi.departments(signal).then((response) => response.data),
    staleTime: 60 * 1000,
  })

export const useCareerMutations = () => {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: careerKeys.all })

  const create = useMutation({
    mutationFn: (input: CareerInput) => careersApi.create(input).then((response) => response.career),
    onSuccess: async (career) => {
      await refresh()
      toast.success(career.isPublished ? 'Listing published' : 'Listing saved as a draft')
    },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CareerInput> }) =>
      careersApi.update(id, input).then((response) => response.career),
    onSuccess: async () => {
      await refresh()
      toast.success('Listing saved')
    },
  })

  /** Switches a listing on or off from the table without opening the form. */
  const setPublished = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      careersApi.update(id, { isPublished }).then((response) => response.career),
    onSuccess: async (career) => {
      await refresh()
      toast.success(career.isPublished ? 'Listing is now live on the Careers page' : 'Listing hidden from the Careers page')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: careersApi.remove,
    onSuccess: async () => {
      await refresh()
      toast.success('Listing deleted')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  return { create, update, setPublished, remove }
}
