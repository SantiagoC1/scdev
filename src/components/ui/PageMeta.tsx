import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '../../constants'

const OG_IMAGE = `${SITE_URL}/images/og-scdev.jpg`

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
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  )
}
