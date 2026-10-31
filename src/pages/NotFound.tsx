import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Página no encontrada | SCdev</title>
        <meta name="description" content="La página que buscás no existe. Volvé al inicio de SCdev." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />
      <main id="contenido" tabIndex={-1} className="pt-24 md:pt-26 min-h-[70vh] flex items-center">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <p className="text-sm text-white/60 mb-3">Error 404</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">No encontramos esa página</h1>
          <p className="text-white/70 mb-8 max-w-xl">
            Puede que el link esté mal escrito o que la página ya no exista. Desde el inicio llegás a todo.
          </p>
          <Link to="/" className="inline-block bg-[#D32F2F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#B71C1C] transition-colors duration-200">
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
