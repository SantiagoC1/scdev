import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { GTM_DIFERIDO } from './src/gtm.config'

// Con GTM_DIFERIDO el snippet inline sale del HTML (queda solo el dataLayer vacío); src/main.tsx lo carga más tarde.
const gtmDiferido = {
  name: 'gtm-diferido',
  transformIndexHtml(html: string) {
    if (!GTM_DIFERIDO) return html.replace(/<!--gtm:(inicio|fin)-->\n?/g, '')
    return html.replace(/<!--gtm:inicio-->[\s\S]*?<!--gtm:fin-->/, '<script>window.dataLayer=window.dataLayer||[]</script>')
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), gtmDiferido],
  // El bundle de prerender incluye sus dependencias: así corre con node solo, sin resolver ESM/CJS de node_modules.
  ssr: { noExternal: true },
})
