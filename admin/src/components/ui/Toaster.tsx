import { Toaster as SonnerToaster } from 'sonner'

import { useTheme } from '@/lib/theme'

export const Toaster = () => {
  const { theme } = useTheme()
  return (
    <SonnerToaster
      theme={theme}
      position="top-center"
      richColors
      closeButton
      toastOptions={{ classNames: { toast: 'font-sans rounded-control' } }}
    />
  )
}
