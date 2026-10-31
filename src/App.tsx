import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import { SERVICIOS } from './data/servicios'
import { useSheetConfig } from './hooks/useSheetConfig'
import type { SheetConfig } from './hooks/useSheetConfig'
import { ConfigContext } from './context/ConfigContext'
import { ModalProvider, useModal } from './context/ModalContext'
import ContactModal from './components/ui/ContactModal'
import PuntoMount from './components/punto/PuntoMount'

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

const NotFound = lazy(() => import('./pages/NotFound'))

const PAGINA_SERVICIO: Record<string, ReactNode> = {
  'presencia-web-esencial': <PresenciaWebEsencial />,
  'landing-page-profesional': <LandingPageProfesional />,
  'sitio-web-corporativo': <SitioWebCorporativo />,
  'sistema-a-medida': <SistemaAMedida />,
  'automatizacion-whatsapp': <AutomatizacionWhatsApp />,
}

/** Todas las páginas válidas. El prerender genera un HTML por cada una (RUTAS_VALIDAS). */
const PAGINAS: { path: string; element: ReactNode }[] = [
  { path: '/', element: <Home /> },
  { path: '/nosotros', element: <NosotrosPage /> },
  ...SERVICIOS.map((s) => ({ path: s.slug, element: PAGINA_SERVICIO[s.id] })),
]
export const RUTAS_VALIDAS = PAGINAS.map((p) => p.path)

export function Rutas() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {PAGINAS.map((p) => (
          <Route key={p.path} path={p.path} element={p.element} />
        ))}
        <Route path="*" element={<NotFound />} />
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
          <PuntoMount />
        </BrowserRouter>
      }
    />
  )
}
