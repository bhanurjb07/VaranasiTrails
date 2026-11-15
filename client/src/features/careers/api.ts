import { api } from '@/lib/apiClient'
import type { Career } from '@/types/api'

export const careersApi = {
  list: (signal?: AbortSignal) => api.get<{ data: Career[] }>('/careers', undefined, signal),
  detail: (id: string, signal?: AbortSignal) =>
    api.get<{ career: Career }>(`/careers/${encodeURIComponent(id)}`, undefined, signal),
}
