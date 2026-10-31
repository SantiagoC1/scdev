import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // El bundle de prerender incluye sus dependencias: así corre con node solo, sin resolver ESM/CJS de node_modules.
  ssr: { noExternal: true },
})
