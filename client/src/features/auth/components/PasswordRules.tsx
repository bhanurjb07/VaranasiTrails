import { Check, Circle } from 'lucide-react'

import { cn } from '@/lib/cn'
import { passwordRules } from '../schemas'

/** Live checklist of the password requirements. */
export const PasswordRules = ({ value }: { value: string }) => (
  <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2" aria-label="Password requirements">
    {passwordRules.map((rule) => {
      const ok = value.length > 0 && rule.test(value)
      return (
        <li key={rule.id} className={cn('flex items-center gap-2', ok ? 'text-success' : 'text-muted')}>
          {ok ? <Check className="size-4" aria-hidden="true" /> : <Circle className="size-3 opacity-60" aria-hidden="true" />}
          {rule.label}
          <span className="sr-only">{ok ? ' (met)' : ' (not met)'}</span>
        </li>
      )
    })}
  </ul>
)
