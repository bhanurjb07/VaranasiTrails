import { api, type Query } from '@/lib/apiClient'
import type { AdminCareer, EmploymentType, Paginated, WorkMode } from '@/types/api'

export interface CareerInput {
  title: string
  department: string
  location: string
  employmentType: EmploymentType
  workMode: WorkMode
  experience: string | null
  salary: string | null
  aboutRole: string
  responsibilities: string[]
  requirements: string[]
  applyUrl: string
  /** YYYY-MM-DD, the last day applications are accepted. */
  closesAt: string | null
  isPublished: boolean
}

export interface CareerQuery {
  q?: string
  published?: boolean
  department?: string
  page?: number
  limit?: number
}

export const careersApi = {
  list: (query: CareerQuery, signal?: AbortSignal) => api.get<Paginated<AdminCareer>>('/admin/careers', query as Query, signal),
  departments: (signal?: AbortSignal) => api.get<{ data: string[] }>('/admin/careers/departments', undefined, signal),
  create: (input: CareerInput) => api.post<{ career: AdminCareer }>('/admin/careers', input),
  update: (id: string, input: Partial<CareerInput>) => api.patch<{ career: AdminCareer }>(`/admin/careers/${id}`, input),
  remove: (id: string) => api.delete<void>(`/admin/careers/${id}`),
}
