import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'
import Nosotros from '../components/sections/Nosotros'
import Servicios from '../components/sections/Servicios'
import Clientes from '../components/sections/Clientes'
import Portfolio from '../components/sections/Portfolio'
import CtaFinal from '../components/sections/CtaFinal'
import PageMeta from '../components/ui/PageMeta'
import { SITE_URL } from '../constants'

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
      <Navbar />
      <main>
        <Hero />
        <Nosotros />
        <Servicios />
        <Clientes />
        <Portfolio />
        <CtaFinal />
      </main>
      <Footer />
    </>
  )
}
