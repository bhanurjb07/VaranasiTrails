import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { PageHeader } from '@/components/common/PageHeader'
import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { aboutContent } from '@/data/home'
import { placeholderImages } from '@/data/placeholderMedia'
import { site } from '@/data/site'

export const AboutPage = () => {
  const image = placeholderImages.riverBoats

  return (
    <>
      <SeoHead
        title="About us"
        description={`${site.name} is a team of local guides planning small-group trips in Varanasi and Uttar Pradesh since ${site.foundedYear}.`}
        path="/about"
      />
      <PageHeader eyebrow={`Since ${site.foundedYear}`} title={aboutContent.title} subtitle={aboutContent.intro} />

      <Container className="grid gap-12 py-14 lg:grid-cols-2 lg:items-center">
        <figure>
          <ImageWithFallback
            src={image.url}
            alt={image.alt}
            width={1200}
            height={800}
            className="aspect-[4/3] w-full rounded-card shadow-lift"
          />
          <figcaption className="mt-2 text-xs text-muted">Photo: {image.credit}</figcaption>
        </figure>
        <div className="space-y-5 text-lg leading-relaxed text-ink/90">
          {aboutContent.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Container>

      <Container className="pb-8">
        <ul className="grid gap-6 md:grid-cols-3">
          {aboutContent.values.map((value) => (
            <li key={value.title} className="rounded-card border border-line/70 bg-surface p-7 shadow-card">
              <h2 className="text-2xl">{value.title}</h2>
              <p className="mt-2 text-muted">{value.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 text-center">
          <ButtonLink to="/destinations" size="lg">
            Explore our trips
          </ButtonLink>
        </div>
      </Container>
    </>
  )
}
