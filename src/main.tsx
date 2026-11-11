import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GTM_DIFERIDO } from './gtm.config'
import { cargarGtmDiferido } from './utils/gtm'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// El prerender marca el root con la ruta que renderizó ('404' para la página de error). Si coincide
// con la URL se hidrata; si no, se monta desde cero.
if (GTM_DIFERIDO) cargarGtmDiferido()

const ruta = window.location.pathname.replace(/\/+$/, '') || '/'
if (root.hasChildNodes() && (root.dataset.ruta === ruta || root.dataset.ruta === '404')) {
  hydrateRoot(root, app)
} else {
  root.textContent = ''
  createRoot(root).render(app)
}
