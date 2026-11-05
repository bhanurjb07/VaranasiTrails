import { api } from '@/lib/apiClient'
import type { AuthResponse, MessageResponse, OtpPurpose } from '@/types/api'

export interface SignupPayload {
  name: string
  phone: string
  email: string
  password: string
}

export const authApi = {
  signup: (payload: SignupPayload) => api.post<MessageResponse>('/auth/signup', payload),
  verifyEmail: (email: string, otp: string) => api.post<AuthResponse>('/auth/verify-email', { email, otp }),
  resendOtp: (email: string, purpose: OtpPurpose) =>
    api.post<MessageResponse>('/auth/resend-otp', { email, purpose }),
  login: (email: string, password: string) => api.post<AuthResponse>('/auth/login', { email, password }),
  logout: () => api.post<MessageResponse>('/auth/logout'),
  forgotPassword: (email: string) => api.post<MessageResponse>('/auth/forgot-password', { email }),
  verifyResetOtp: (email: string, otp: string) =>
    api.post<{ resetToken: string }>('/auth/verify-reset-otp', { email, otp }),
  resetPassword: (email: string, resetToken: string, newPassword: string) =>
    api.post<MessageResponse>('/auth/reset-password', { email, resetToken, newPassword }),
}
