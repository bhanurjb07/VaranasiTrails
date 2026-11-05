import { api } from '@/lib/apiClient'
import type { EnquiryInput } from '@/types/api'

export const enquiryApi = {
  create: (input: EnquiryInput) => api.post<{ id: string; message: string }>('/enquiries', input),
}
