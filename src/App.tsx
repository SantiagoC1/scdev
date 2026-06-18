import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import { useSheetConfig } from './hooks/useSheetConfig'

const PresenciaWebEsencial = lazy(() => import('./pages/servicios/PresenciaWebEsencial'))
const LandingPageProfesional = lazy(() => import('./pages/servicios/LandingPageProfesional'))
const SitioWebCorporativo = lazy(() => import('./pages/servicios/SitioWebCorporativo'))
const SistemaAMedida = lazy(() => import('./pages/servicios/SistemaAMedida'))
const AutomatizacionWhatsApp = lazy(() => import('./pages/servicios/AutomatizacionWhatsApp'))

const PageLoader = () => (
  <div className="min-h-screen bg-[#080808] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-[#D32F2F] border-t-transparent rounded-full animate-spin" />
  </div>
)
import { ConfigContext } from './context/ConfigContext'
import { ModalProvider, useModal } from './context/ModalContext'
import ContactModal from './components/ui/ContactModal'

function AppContent() {
  const { config } = useSheetConfig()
  const { isOpen, closeContact, servicioPreseleccionado } = useModal()

  return (
    <ConfigContext.Provider value={config}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/servicios/presencia-web-esencial" element={<PresenciaWebEsencial />} />
            <Route path="/servicios/landing-page-profesional" element={<LandingPageProfesional />} />
            <Route path="/servicios/sitio-web-corporativo" element={<SitioWebCorporativo />} />
            <Route path="/servicios/sistema-a-medida" element={<SistemaAMedida />} />
            <Route path="/servicios/automatizacion-whatsapp" element={<AutomatizacionWhatsApp />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ContactModal
        isOpen={isOpen}
        onClose={closeContact}
        servicioPreseleccionado={servicioPreseleccionado}
      />
    </ConfigContext.Provider>
  )
}

export default function App() {
  return (
    <ModalProvider>
      <AppContent />
    </ModalProvider>
  )
}
