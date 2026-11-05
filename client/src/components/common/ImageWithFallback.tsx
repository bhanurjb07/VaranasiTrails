import { useState, type ImgHTMLAttributes } from 'react'

import { fallbackFor } from '@/data/placeholderMedia'
import { cn } from '@/lib/cn'
import { buildSrcSet } from '@/lib/images'

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string | null | undefined
  alt: string
  /** Eager-load above-the-fold images. */
  priority?: boolean
}

/**
 * Images from the API come from R2 and may not exist yet. On error (or when
 * there is no src) this swaps in the placeholder photo.
 */
export const ImageWithFallback = ({
  src,
  alt,
  priority = false,
  className,
  sizes = '(min-width: 1024px) 33vw, 100vw',
  ...props
}: ImageWithFallbackProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const usingFallback = !src || failedSrc === src
  const current = usingFallback ? fallbackFor(src ?? alt).url : src

  return (
    <img
      src={current}
      srcSet={buildSrcSet(current)}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      onError={() => src && setFailedSrc(src)}
      className={cn('object-cover', className)}
      {...props}
    />
  )
}
