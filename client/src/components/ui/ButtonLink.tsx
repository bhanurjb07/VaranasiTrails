import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router'

import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles'

interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Internal route. */
  to?: string
  /** External URL (opens in a new tab). */
  href?: string
}

export const ButtonLink = ({ variant, size, to, href, className, children, ...props }: ButtonLinkProps) => {
  const classes = buttonStyles(variant, size, className)

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
      {children}
    </a>
  )
}
