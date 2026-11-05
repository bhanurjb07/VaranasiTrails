import { Helmet } from 'react-helmet-async'

import { site } from '@/data/site'

interface SeoHeadProps {
  /** Page title without the brand suffix. Omit on the home page. */
  title?: string
  description?: string
  /** Absolute image URL for social previews. */
  image?: string
  path?: string
  noIndex?: boolean
  /** Structured data (JSON-LD) object. */
  jsonLd?: Record<string, unknown>
}

export const SeoHead = ({ title, description, image, path, noIndex = false, jsonLd }: SeoHeadProps) => {
  const fullTitle = title ? site.seo.titleTemplate.replace('%s', title) : site.seo.defaultTitle
  const text = description ?? site.seo.defaultDescription
  const url = path ? `${site.siteUrl}${path}` : undefined

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={text} />
      {noIndex && <meta name="robots" content="noindex" />}
      {url && <link rel="canonical" href={url} />}
      <meta property="og:site_name" content={site.name} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={text} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
