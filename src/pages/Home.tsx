import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'
import Nosotros from '../components/sections/Nosotros'
import Servicios from '../components/sections/Servicios'
import Clientes from '../components/sections/Clientes'
import Portfolio from '../components/sections/Portfolio'
import CtaFinal from '../components/sections/CtaFinal'

export default function Home() {
  return (
    <>
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
