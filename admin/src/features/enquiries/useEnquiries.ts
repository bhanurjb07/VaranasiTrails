import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/components/ui/toast'
import { dashboardKey } from '@/features/dashboard/useDashboard'
import { downloadFile } from '@/lib/csv'
import { errorMessage } from '@/lib/formErrors'
import { enquiriesApi, type EnquiryQuery } from './api'

const key = (query: EnquiryQuery) => ['admin', 'enquiries', query] as const

export const useEnquiryList = (query: EnquiryQuery) =>
  useQuery({
    queryKey: key(query),
    queryFn: ({ signal }) => enquiriesApi.list(query, signal),
    placeholderData: keepPreviousData,
  })

export const useEnquiryMutations = () => {
  const queryClient = useQueryClient()
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'enquiries'] }),
      queryClient.invalidateQueries({ queryKey: dashboardKey }),
    ])

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof enquiriesApi.update>[1] }) =>
      enquiriesApi.update(id, input).then((response) => response.enquiry),
    onSuccess: async () => {
      await refresh()
      toast.success('Enquiry updated')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: enquiriesApi.remove,
    onSuccess: async () => {
      await refresh()
      toast.success('Enquiry deleted')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const exportCsv = useMutation({
    mutationFn: (query: EnquiryQuery) => enquiriesApi.exportCsv(query),
    onSuccess: (blob) => downloadFile(blob, `enquiries-${new Date().toISOString().slice(0, 10)}.csv`),
    onError: (error) => toast.error(errorMessage(error)),
  })

  return { update, remove, exportCsv }
}
