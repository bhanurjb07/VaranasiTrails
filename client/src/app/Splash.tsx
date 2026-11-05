import { Logo } from '@/components/layout/Logo'
import { Spinner } from '@/components/ui/Spinner'

/** Shown while the first route's code loads, instead of a blank screen. */
export const Splash = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream" role="status" aria-label="Loading">
    <Logo />
    <Spinner className="size-7 text-saffron" />
  </div>
)
