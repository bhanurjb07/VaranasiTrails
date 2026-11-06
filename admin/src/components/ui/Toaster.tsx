import { Toaster as SonnerToaster } from 'sonner'

export const Toaster = () => (
  <SonnerToaster position="top-center" richColors closeButton toastOptions={{ classNames: { toast: 'font-sans' } }} />
)
