import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import { useSheetConfig } from './hooks/useSheetConfig'
import type { SheetConfig } from './hooks/useSheetConfig'
import { ConfigContext } from './context/ConfigContext'
import { ModalProvider, useModal } from './context/ModalContext'
import ContactModal from './components/ui/ContactModal'

const NosotrosPage = lazy(() => import('./pages/NosotrosPage'))
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

export function Rutas() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/servicios/presencia-web-esencial" element={<PresenciaWebEsencial />} />
        <Route path="/servicios/landing-page-profesional" element={<LandingPageProfesional />} />
        <Route path="/servicios/sitio-web-corporativo" element={<SitioWebCorporativo />} />
        <Route path="/servicios/sistema-a-medida" element={<SistemaAMedida />} />
        <Route path="/servicios/automatizacion-whatsapp" element={<AutomatizacionWhatsApp />} />
      </Routes>
    </Suspense>
  )
}

function Cuerpo({ config, router }: { config: SheetConfig; router: ReactNode }) {
  const { isOpen, closeContact, servicioPreseleccionado } = useModal()
  return (
    <ConfigContext.Provider value={config}>
      {router}
      <ContactModal
        isOpen={isOpen}
        onClose={closeContact}
        servicioPreseleccionado={servicioPreseleccionado}
      />
    </ConfigContext.Provider>
  )
}

/** Árbol de providers compartido entre el navegador y el prerender (entry-server). */
export function AppShell({
  config,
  router,
  helmetContext,
}: {
  config: SheetConfig
  router: ReactNode
  helmetContext?: object
}) {
  return (
    <HelmetProvider context={helmetContext}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <ModalProvider>
            <Cuerpo config={config} router={router} />
          </ModalProvider>
        </MotionConfig>
      </LazyMotion>
    </HelmetProvider>
  )
}

export default function App() {
  const { config } = useSheetConfig()
  return (
    <AppShell
      config={config}
      router={
        <BrowserRouter>
          <Rutas />
        </BrowserRouter>
      }
    />
  )
}
