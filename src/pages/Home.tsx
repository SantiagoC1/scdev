import { lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'
import PageMeta from '../components/ui/PageMeta'
import { SITE_URL } from '../constants'
import { FAQ } from '../data/faq'

// Todo lo que está debajo del hero se carga aparte. Cada fallback reserva alto para no mover el footer.
const Servicios = lazy(() => import('../components/sections/Servicios'))
const ComoTrabajamos = lazy(() => import('../components/sections/ComoTrabajamos'))
const Trabajos = lazy(() => import('../components/sections/Trabajos'))
const Nosotros = lazy(() => import('../components/sections/Nosotros'))
const Faq = lazy(() => import('../components/sections/Faq'))
const CtaFinal = lazy(() => import('../components/sections/CtaFinal'))

const Reserva = ({ alto }: { alto: number }) => <div aria-hidden="true" style={{ minHeight: alto }} />

const FAQ_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.pregunta,
    acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
  })),
})

export default function Home() {
  return (
    <>
      <PageMeta
        title="SCdev | Agencia de Desarrollo Web en La Plata, Argentina"
        description="Agencia de desarrollo web en La Plata, Argentina. Sitios web profesionales, sistemas a medida y automatización con IA. Precios claros, entrega rápida y soporte local para profesionales y empresas argentinas."
        canonical={`${SITE_URL}/`}
        ogTitle="SCdev | Agencia de Desarrollo Web en La Plata"
        ogDescription="Sitios web profesionales, sistemas a medida y automatización para negocios argentinos. Precios visibles, entrega rápida."
      />
      <Helmet>
        <script type="application/ld+json">{FAQ_JSON_LD}</script>
      </Helmet>
      <Navbar />
      <main id="contenido" tabIndex={-1}>
        <Hero />
        <Suspense fallback={<Reserva alto={1700} />}><Servicios /></Suspense>
        <Suspense fallback={<Reserva alto={600} />}><ComoTrabajamos /></Suspense>
        <Suspense fallback={<Reserva alto={760} />}><Trabajos /></Suspense>
        <Suspense fallback={<Reserva alto={700} />}><Nosotros /></Suspense>
        <Suspense fallback={<Reserva alto={640} />}><Faq /></Suspense>
        <Suspense fallback={<Reserva alto={620} />}><CtaFinal /></Suspense>
      </main>
      <Footer />
    </>
  )
}
