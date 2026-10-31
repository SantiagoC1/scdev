import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// El prerender marca el root con la ruta que renderizó. Si coincide con la URL se hidrata;
// si no (por ejemplo una ruta desconocida servida por el fallback), se monta desde cero.
const ruta = window.location.pathname.replace(/\/+$/, '') || '/'
if (root.hasChildNodes() && root.dataset.ruta === ruta) {
  hydrateRoot(root, app)
} else {
  root.textContent = ''
  createRoot(root).render(app)
}
