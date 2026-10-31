import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '../../constants'

const OG_IMAGE = `${SITE_URL}/images/og-scdev.jpg`

interface PageMetaProps {
  title: string
  description: string
  canonical: string
  ogTitle?: string
  ogDescription?: string
  /** Objeto JSON-LD (o @graph) de la ruta. */
  jsonLd?: object
}

export default function PageMeta({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  jsonLd,
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
      <meta name="twitter:title" content={ogTitle ?? title} />
      <meta name="twitter:description" content={ogDescription ?? description} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:image" content={OG_IMAGE} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
