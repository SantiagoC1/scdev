import { Helmet } from 'react-helmet-async'

interface PageMetaProps {
  title: string
  description: string
  canonical: string
  ogTitle?: string
  ogDescription?: string
}

export default function PageMeta({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
}: PageMetaProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={ogTitle ?? title} />
      <meta property="og:description" content={ogDescription ?? description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
    </Helmet>
  )
}
