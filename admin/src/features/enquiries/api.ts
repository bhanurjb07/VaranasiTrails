import { api, type Query } from '@/lib/apiClient'
import type { AdminEnquiry, EnquiryList, EnquiryStatus } from '@/types/api'

export interface EnquiryQuery {
  q?: string
  status?: EnquiryStatus
  from?: string
  to?: string
  page?: number
  limit?: number
}

export const enquiriesApi = {
  list: (query: EnquiryQuery, signal?: AbortSignal) => api.get<EnquiryList>('/admin/enquiries', query as Query, signal),
  update: (id: string, input: { status?: EnquiryStatus; adminNotes?: string | null }) =>
    api.patch<{ enquiry: AdminEnquiry }>(`/admin/enquiries/${id}`, input),
  remove: (id: string) => api.delete<void>(`/admin/enquiries/${id}`),
  exportCsv: (query: EnquiryQuery) => api.blob('/admin/enquiries/export.csv', query as Query),
}
