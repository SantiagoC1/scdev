# CLAUDE.md — SCdev Agency Website
## Guía maestra para Claude Code

---

## Stack y setup

**React 19 + Vite + TypeScript + Tailwind CSS v4 + Framer Motion**
Mismo stack que el proyecto Balance (github.com/SantiagoC1/BalanceAgenciaDeMarketing).
Deploy: **Netlify** desde rama `main`.
Dominio final: **scdev.com.ar**

---

## Inicializar el proyecto

```bash
npm create vite@latest scdev-web -- --template react-ts
cd scdev-web
npm install
npm install tailwindcss @tailwindcss/vite
npm install framer-motion
npm install react-router-dom
npm install react-icons
npm install @fontsource/syne @fontsource/dm-sans
```

Configurar Tailwind v4 en `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

En `src/index.css`:
```css
@import "tailwindcss";
@import "@fontsource/syne/400.css";
@import "@fontsource/syne/600.css";
@import "@fontsource/syne/700.css";
@import "@fontsource/syne/800.css";
@import "@fontsource/dm-sans/300.css";
@import "@fontsource/dm-sans/400.css";
@import "@fontsource/dm-sans/500.css";

@theme {
  --color-accent: #D32F2F;
  --color-accent-hover: #B71C1C;
  --color-accent-muted: rgba(211, 47, 47, 0.12);
  --color-accent-border: rgba(211, 47, 47, 0.3);
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #111111;
  --color-bg-card: rgba(255, 255, 255, 0.03);
  --color-border: rgba(255, 255, 255, 0.08);
  --color-text-muted: #9e9e9e;
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  background-color: #0a0a0a;
  color: #ffffff;
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 { font-family: var(--font-display); }

/* Scrollbar */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #0a0a0a; }
::-webkit-scrollbar-thumb { background: #D32F2F; border-radius: 3px; }

/* Selection */
::selection { background: rgba(211, 47, 47, 0.3); color: #fff; }
```

---

## Estructura de archivos

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Nosotros.tsx
│   │   ├── Servicios.tsx
│   │   ├── Clientes.tsx
│   │   ├── Portfolio.tsx
│   │   └── Contacto.tsx
│   └── ui/
│       ├── ServiceCard.tsx
│       ├── ClienteCard.tsx
│       ├── PortfolioCard.tsx
│       ├── MantenimientoTier.tsx
│       └── ParticlesBackground.tsx
├── pages/
│   ├── Home.tsx
│   └── servicios/
│       ├── PresenciaWebEsencial.tsx
│       ├── LandingPageProfesional.tsx
│       ├── SitioWebCorporativo.tsx
│       ├── SistemaAMedida.tsx
│       └── AutomatizacionWhatsApp.tsx
├── data/
│   ├── servicios.ts
│   ├── clientes.ts
│   └── portfolio.ts
├── hooks/
│   └── useScrollSpy.ts
├── App.tsx
├── main.tsx
└── index.css

public/
├── images/
│   ├── LogoCompletoHorizontalFN.png
│   ├── LogoChicoFN.png          ← favicon y og:image
│   ├── balance.png
│   ├── AdsumPater.png
│   ├── campusfit.png
│   └── Scdev.png
└── _redirects                   ← Netlify SPA routing
```

**`public/_redirects`** (necesario para Netlify + React Router):
```
/* /index.html 200
```

---

## Routing (App.tsx)

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PresenciaWebEsencial from './pages/servicios/PresenciaWebEsencial'
import LandingPageProfesional from './pages/servicios/LandingPageProfesional'
import SitioWebCorporativo from './pages/servicios/SitioWebCorporativo'
import SistemaAMedida from './pages/servicios/SistemaAMedida'
import AutomatizacionWhatsApp from './pages/servicios/AutomatizacionWhatsApp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios/presencia-web-esencial" element={<PresenciaWebEsencial />} />
        <Route path="/servicios/landing-page-profesional" element={<LandingPageProfesional />} />
        <Route path="/servicios/sitio-web-corporativo" element={<SitioWebCorporativo />} />
        <Route path="/servicios/sistema-a-medida" element={<SistemaAMedida />} />
        <Route path="/servicios/automatizacion-whatsapp" element={<AutomatizacionWhatsApp />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

## index.html (Vite root) — SEO y meta tags

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/images/LogoChicoFN.png" />
  <link rel="apple-touch-icon" href="/images/LogoChicoFN.png" />

  <!-- SEO -->
  <title>SCdev | Agencia de Desarrollo Web en La Plata, Argentina</title>
  <meta name="description" content="Agencia de desarrollo web en La Plata, Argentina. Sitios web profesionales, sistemas a medida y automatización con IA para profesionales, comercios y empresas argentinas." />
  <meta name="keywords" content="agencia desarrollo web La Plata, programador web Argentina, React developer La Plata, landing page Argentina, sistema a medida, automatización WhatsApp, SCdev" />
  <meta name="author" content="Santiago Cáceres — SCdev" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://scdev.com.ar/" />

  <!-- Open Graph (logo que aparece en Google, WhatsApp, LinkedIn) -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://scdev.com.ar/" />
  <meta property="og:title" content="SCdev | Agencia de Desarrollo Web en La Plata" />
  <meta property="og:description" content="Sitios web profesionales, sistemas a medida y automatización para negocios argentinos." />
  <meta property="og:image" content="https://scdev.com.ar/images/LogoChicoFN.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="es_AR" />
  <meta property="og:site_name" content="SCdev" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="SCdev | Agencia de Desarrollo Web en La Plata" />
  <meta name="twitter:description" content="Sitios web, sistemas a medida y automatización para negocios argentinos." />
  <meta name="twitter:image" content="https://scdev.com.ar/images/LogoChicoFN.png" />

  <!-- Geolocalización -->
  <meta name="geo.region" content="AR-B" />
  <meta name="geo.placename" content="La Plata, Buenos Aires, Argentina" />
  <meta name="geo.position" content="-34.9215;-57.9545" />
  <meta name="ICBM" content="-34.9215, -57.9545" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://scdev.com.ar/#business",
        "name": "SCdev — Agencia de Desarrollo Web",
        "url": "https://scdev.com.ar",
        "image": "https://scdev.com.ar/images/LogoChicoFN.png",
        "description": "Agencia de desarrollo web en La Plata, Argentina. Especializada en sitios web profesionales, sistemas a medida, automatización con IA y bots de WhatsApp para negocios argentinos.",
        "founder": { "@type": "Person", "name": "Santiago Cáceres" },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "La Plata",
          "addressRegion": "Buenos Aires",
          "addressCountry": "AR"
        },
        "geo": { "@type": "GeoCoordinates", "latitude": -34.9215, "longitude": -57.9545 },
        "areaServed": { "@type": "Country", "name": "Argentina" },
        "priceRange": "$$",
        "serviceType": [
          "Desarrollo de sitios web",
          "Landing Pages",
          "Sistemas a medida",
          "Automatización con WhatsApp",
          "Consultoría IT"
        ]
      }
    ]
  }
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

---

## Componentes — Implementación completa

### Navbar.tsx

```tsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const WA_NUMBER = '5492XXXXXXXXXX' // COMPLETAR con número real
const WA_DEFAULT = `https://wa.me/${WA_NUMBER}?text=Hola%20Santi!%20Quiero%20cotizar%20una%20soluci%C3%B3n%20digital.`

const NAV_LINKS = [
  { label: 'Inicio', href: '/#hero' },
  { label: 'Nosotros', href: '/#nosotros' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Clientes', href: '/#clientes' },
  { label: 'Proyectos', href: '/#portfolio' },
  { label: 'Contacto', href: '/#contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src="/images/LogoCompletoHorizontalFN.png" alt="SCdev" className="h-8" />
        </Link>

        {/* Links desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              <a href={link.href}
                className="text-sm text-white/70 hover:text-white transition-colors duration-200">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-3">
          <a href={WA_DEFAULT} target="_blank" rel="noopener"
            className="flex items-center gap-2 text-sm text-[#D32F2F] border border-[#D32F2F]/30 
                       px-4 py-2 rounded-lg hover:bg-[#D32F2F]/10 transition-all duration-200">
            <span>WhatsApp</span>
          </a>
          <a href="/#contacto"
            className="text-sm bg-[#D32F2F] text-white px-4 py-2 rounded-lg
                       hover:bg-[#B71C1C] transition-all duration-200 shadow-[0_4px_20px_rgba(211,47,47,0.3)]">
            Contactar
          </a>
        </div>

        {/* Hamburger mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menú">
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#111111] border-t border-white/5"
          >
            <ul className="px-6 py-4 flex flex-col gap-4">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <a href={link.href} onClick={() => setMenuOpen(false)}
                    className="text-white/80 hover:text-white text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={WA_DEFAULT} target="_blank" rel="noopener"
                  className="block text-center text-sm bg-[#D32F2F] text-white px-4 py-3 rounded-lg mt-2">
                  Cotizar por WhatsApp
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
```

### data/servicios.ts

```ts
export interface Servicio {
  id: string
  slug: string
  terminalLabel: string
  icon: string
  nombre: string
  descripcion: string
  precio: string
  precioTipo: string
  pills: string[]
  tiempo: string
  para: string
  badge?: { texto: string; tipo: 'entrada' | 'popular' }
  waText: string
  // Para páginas individuales
  incluye: { icono: string; titulo: string; desc: string }[]
  paraQuien: string[]
  noIncluye: string[]
  proceso: { num: string; titulo: string; desc: string }[]
  stack: { nombre: string; icono: string }[]
  faq: { pregunta: string; respuesta: string }[]
}

export const SERVICIOS: Servicio[] = [
  {
    id: 'presencia-web-esencial',
    slug: '/servicios/presencia-web-esencial',
    terminalLabel: 'Web.Entry → Ready',
    icon: '🌐',
    nombre: 'Presencia Web Esencial',
    descripcion: 'Para gasistas, electricistas, dentistas, peluquerías — el primer paso online.',
    precio: '$80.000 – $100.000',
    precioTipo: 'proyecto cerrado',
    pills: ['1 página scroll', 'responsive', 'botón WhatsApp', 'deploy incluido'],
    tiempo: '3–5 días',
    para: 'profesionales de oficio, microemprendimientos',
    badge: { texto: 'ENTRADA', tipo: 'entrada' },
    waText: 'Hola Santi! Me interesa el servicio de Presencia Web Esencial.',
    incluye: [
      { icono: '🎨', titulo: 'Diseño personalizado', desc: 'No es un template. Lo diseñamos específico para tu rubro y estilo.' },
      { icono: '📱', titulo: 'Responsive (mobile)', desc: 'Se ve perfecto en celular, tablet y desktop.' },
      { icono: '💬', titulo: 'Botón WhatsApp', desc: 'Tus clientes te contactan con un solo click desde la web.' },
      { icono: '📝', titulo: 'Formulario de contacto', desc: 'Para recibir consultas directamente a tu email.' },
      { icono: '🚀', titulo: 'Deploy incluido', desc: 'Lo publicamos en internet. Vos no hacés nada técnico.' },
      { icono: '⚡', titulo: 'Entrega en 3–5 días', desc: 'Sin esperas de semanas. Rápido y funcional.' },
    ],
    paraQuien: [
      'Gasistas, plomeros, electricistas',
      'Dentistas y profesionales de la salud',
      'Peluquerías y barberías',
      'Kioscos y comercios pequeños',
      'Cualquier profesional de oficio que necesita ser encontrado online',
    ],
    noIncluye: [
      'Dominio propio (.com.ar — costo aparte ~$3.000 ARS/año)',
      'Logo (si no tenés, lo cotizamos aparte)',
      'Más de 1 ronda de revisiones',
      'Redacción de textos (el cliente provee contenido)',
    ],
    proceso: [
      { num: '01', titulo: 'Reunión inicial', desc: 'Entendemos tu negocio, rubro y qué querés comunicar.' },
      { num: '02', titulo: 'Diseño y propuesta', desc: 'Te mostramos el diseño antes de programar. Acordamos estilo.' },
      { num: '03', titulo: 'Desarrollo', desc: 'Programamos la página. La podés ver en un link de prueba.' },
      { num: '04', titulo: 'Entrega y deploy', desc: 'La publicamos, te explicamos cómo compartirla. Lista.' },
    ],
    stack: [
      { nombre: 'HTML5', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
      { nombre: 'CSS3', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
      { nombre: 'JavaScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { nombre: 'Git', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
    ],
    faq: [
      { pregunta: '¿Necesito dominio propio?', respuesta: 'No es obligatorio para empezar. Podemos publicar en un subdominio gratuito. Si querés tu propio .com.ar, cuesta ~$3.000 ARS/año y lo gestionamos nosotros.' },
      { pregunta: '¿Cuánto tarda realmente?', respuesta: '3 a 5 días hábiles desde que tenemos los textos y fotos de tu parte. El mayor cuello de botella suele ser esperar el contenido del cliente.' },
      { pregunta: '¿Me van a encontrar en Google?', respuesta: 'Incluimos SEO básico (meta tags, título, descripción). Para posicionarte en los primeros resultados de Google lleva tiempo y trabajo de contenido, pero el sitio queda correctamente indexado desde el día 1.' },
      { pregunta: '¿Qué pasa si quiero cambios después?', respuesta: 'El precio incluye 1 ronda de revisiones durante el proyecto. Cambios posteriores se cotizan aparte o podés contratar el plan de Mantenimiento Mensual.' },
    ],
  },
  {
    id: 'landing-page-profesional',
    slug: '/servicios/landing-page-profesional',
    terminalLabel: 'Web.Pro → Deployed',
    icon: '🚀',
    nombre: 'Landing Page Profesional',
    descripcion: 'Para comercios, profesionales y emprendimientos con identidad cuidada.',
    precio: '$400.000 – $700.000',
    precioTipo: 'proyecto cerrado',
    pills: ['React + Vite + Tailwind', 'animaciones', 'formulario', 'SEO básico', 'deploy'],
    tiempo: '1–2 semanas',
    para: 'profesionales, comercios, emprendimientos',
    badge: { texto: 'MÁS ELEGIDO', tipo: 'popular' },
    waText: 'Hola Santi! Me interesa una Landing Page Profesional.',
    incluye: [
      { icono: '🎨', titulo: 'Diseño a medida', desc: 'Identidad visual propia. No usamos templates genéricos.' },
      { icono: '✨', titulo: 'Animaciones profesionales', desc: 'Framer Motion para transiciones y efectos que impresionan.' },
      { icono: '📊', titulo: 'Formulario con Google Sheets', desc: 'Cada consulta llega a tu hoja de cálculo y a tu email.' },
      { icono: '🔍', titulo: 'SEO básico completo', desc: 'Meta tags, Open Graph, sitemap, robots.txt.' },
      { icono: '📈', titulo: 'Google Analytics', desc: 'Sabés cuánta gente visita tu web y desde dónde llegan.' },
      { icono: '🚀', titulo: 'Deploy en Vercel/Netlify', desc: 'Velocidad máxima. Gratis. Con SSL incluido.' },
    ],
    paraQuien: [
      'Agencias y estudios profesionales',
      'Consultorios y clínicas',
      'Estudios contables y jurídicos',
      'Startups buscando su primera web de impacto',
      'Emprendimientos que quieren diferenciarse',
    ],
    noIncluye: [
      'Múltiples idiomas',
      'E-commerce / tienda online',
      'Blog o CMS para actualizar contenido sin código',
      'Fotografía profesional',
    ],
    proceso: [
      { num: '01', titulo: 'Discovery', desc: 'Analizamos tu negocio, competencia y qué querés lograr con el sitio.' },
      { num: '02', titulo: 'Diseño UI', desc: 'Wireframe y maqueta visual en Figma para acordar antes de programar.' },
      { num: '03', titulo: 'Desarrollo', desc: 'React + Vite + Tailwind + Framer Motion. Podés ver el avance diario.' },
      { num: '04', titulo: 'Deploy y entrega', desc: 'Publicamos en Vercel, conectamos el dominio y te hacemos un handoff completo.' },
    ],
    stack: [
      { nombre: 'React', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { nombre: 'TypeScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
      { nombre: 'Tailwind', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
      { nombre: 'Figma', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
    ],
    faq: [
      { pregunta: '¿En qué se diferencia de la Presencia Web Esencial?', respuesta: 'La Landing Page Profesional usa React con animaciones Framer Motion, tiene integración real con Google Sheets para captura de leads, SEO más trabajado y un proceso de diseño previo en Figma. Es para quienes quieren impresionar y convertir visitas en clientes.' },
      { pregunta: '¿Puedo ver ejemplos?', respuesta: 'Sí. El sitio de Balance Agency (somosbalance.com.ar) fue desarrollado con este mismo stack y proceso.' },
      { pregunta: '¿Cuántas revisiones incluye?', respuesta: 'Hasta 2 rondas de revisión durante el desarrollo. Cambios mayores de alcance se cotizan aparte.' },
      { pregunta: '¿El precio varía según el proyecto?', respuesta: 'Sí, el rango depende de la complejidad visual, cantidad de secciones y integraciones. En la reunión inicial te damos un precio fijo antes de arrancar.' },
    ],
  },
  {
    id: 'sitio-web-corporativo',
    slug: '/servicios/sitio-web-corporativo',
    terminalLabel: 'Corporate.Build → Active',
    icon: '🏢',
    nombre: 'Sitio Web Corporativo',
    descripcion: 'Para empresas con múltiples servicios, equipo o blog.',
    precio: '$800.000 – $1.500.000',
    precioTipo: 'proyecto cerrado',
    pills: ['hasta 6 páginas', 'Framer Motion', 'CMS liviano', 'SEO avanzado', 'Analytics'],
    tiempo: '3–5 semanas',
    para: 'PyMEs, agencias, clínicas',
    waText: 'Hola Santi! Me interesa un Sitio Web Corporativo.',
    incluye: [
      { icono: '📄', titulo: 'Hasta 6 páginas', desc: 'Home, servicios, equipo, casos de estudio, blog, contacto.' },
      { icono: '📝', titulo: 'CMS liviano', desc: 'Google Sheets o Notion como backend para actualizar contenido sin código.' },
      { icono: '🔍', titulo: 'SEO avanzado', desc: 'Schema.org, sitemap dinámico, Open Graph, Core Web Vitals optimizados.' },
      { icono: '📈', titulo: 'Analytics completo', desc: 'Google Analytics 4 + Search Console configurados y conectados.' },
      { icono: '✨', titulo: 'Animaciones', desc: 'Framer Motion en cada sección. Experiencia premium.' },
      { icono: '📧', titulo: 'Leads a email', desc: 'Formulario conectado a Google Sheets + notificación instantánea.' },
    ],
    paraQuien: [
      'PyMEs con múltiples servicios que necesitan explicarlos bien',
      'Agencias y estudios creativos',
      'Clínicas con equipo de profesionales',
      'ONGs e instituciones',
      'Empresas que quieren un sitio que los represente seriamente',
    ],
    noIncluye: [
      'E-commerce / tienda con carrito de compras',
      'Más de 6 páginas (cotizar aparte)',
      'Contenido en múltiples idiomas',
      'Fotografía o videos de producción propia',
    ],
    proceso: [
      { num: '01', titulo: 'Discovery y arquitectura', desc: 'Mapeamos todas las páginas, flujos y contenido necesario.' },
      { num: '02', titulo: 'Diseño UI completo', desc: 'Diseño de todas las páginas en Figma antes de programar.' },
      { num: '03', titulo: 'Desarrollo por sprints', desc: 'Entregamos por secciones para que puedas dar feedback continuo.' },
      { num: '04', titulo: 'QA y deploy', desc: 'Testeo en mobile, SEO audit, deploy y handoff completo.' },
    ],
    stack: [
      { nombre: 'React', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { nombre: 'TypeScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
      { nombre: 'Tailwind', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
      { nombre: 'Figma', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
    ],
    faq: [
      { pregunta: '¿Puedo actualizar el contenido yo mismo?', respuesta: 'Sí. Configuramos un CMS liviano con Google Sheets o Notion. Cambiás texto o imágenes en una planilla y el sitio se actualiza automáticamente.' },
      { pregunta: '¿Cuánto tarda?', respuesta: '3 a 5 semanas dependiendo de la cantidad de páginas y la velocidad con que el cliente aprueba diseños y provee contenido.' },
      { pregunta: '¿Incluye dominio y hosting?', respuesta: 'El deploy es en Vercel (gratuito y con SSL incluido). El dominio es un costo aparte que gestionamos juntos.' },
    ],
  },
  {
    id: 'sistema-a-medida',
    slug: '/servicios/sistema-a-medida',
    terminalLabel: 'System.Build → Running',
    icon: '⚙️',
    nombre: 'Sistema / Plataforma a Medida',
    descripcion: 'Gestión de turnos, sistemas internos, plataformas con lógica de negocio real.',
    precio: '$1.500.000 – $4.000.000',
    precioTipo: 'por sprint o proyecto',
    pills: ['FastAPI / .NET', 'PostgreSQL / Supabase', 'auth + roles', 'Railway', 'documentación'],
    tiempo: '1–4 meses',
    para: 'startups, empresas medianas',
    waText: 'Hola Santi! Me interesa un Sistema o Plataforma a medida.',
    incluye: [
      { icono: '📋', titulo: 'Relevamiento detallado', desc: 'Documentamos cada requerimiento antes de escribir una línea de código.' },
      { icono: '🗄️', titulo: 'Arquitectura de base de datos', desc: 'Diseño del modelo de datos para que escale sin problemas.' },
      { icono: '⚙️', titulo: 'Backend robusto', desc: 'FastAPI (Python) o .NET 8 según el caso. Auth, roles, APIs REST.' },
      { icono: '🖥️', titulo: 'Frontend React', desc: 'Panel de administración o interfaz de usuario según lo que necesite el sistema.' },
      { icono: '🚀', titulo: 'Deploy en Railway', desc: 'Backend productivo, con CI/CD básico configurado.' },
      { icono: '📚', titulo: 'Documentación técnica', desc: 'El sistema queda documentado para que cualquier dev pueda continuarlo.' },
    ],
    paraQuien: [
      'Startups con flujos de negocio complejos',
      'Clínicas que necesitan gestión de turnos propia',
      'Municipios y organismos públicos',
      'Empresas que quieren reemplazar Excel por un sistema real',
      'Emprendimientos con procesos que no encajan en un SaaS genérico',
    ],
    noIncluye: [
      'Mantenimiento post-entrega (cotizar plan aparte)',
      'Integraciones con sistemas legados no documentados',
      'Soporte 24/7',
      'Features fuera del alcance acordado sin nueva cotización',
    ],
    proceso: [
      { num: '01', titulo: 'Discovery técnico', desc: 'Relevamiento de requerimientos, flujos de usuario y definición de alcance.' },
      { num: '02', titulo: 'Arquitectura y diseño', desc: 'Modelo de datos, arquitectura del sistema y wireframes del frontend.' },
      { num: '03', titulo: 'Desarrollo por sprints', desc: 'Entregas funcionales cada 1–2 semanas. Feedback continuo.' },
      { num: '04', titulo: 'Testing y deploy', desc: 'QA funcional, deploy productivo y handoff con documentación.' },
    ],
    stack: [
      { nombre: 'FastAPI', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' },
      { nombre: 'Python', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { nombre: 'PostgreSQL', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
      { nombre: 'React', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
    ],
    faq: [
      { pregunta: '¿Cómo cotizan si no saben cuánto va a llevar?', respuesta: 'Hacemos un relevamiento detallado antes de dar precio. Una vez que tenemos los requerimientos claros, cotizamos por funcionalidades o por sprints según prefiera el cliente.' },
      { pregunta: '¿Puedo ver el código?', respuesta: 'Sí. El código fuente es tuyo. Lo entregamos en un repo de GitHub privado al finalizar el proyecto.' },
      { pregunta: '¿Qué pasa si necesito agregar features después?', respuesta: 'Se cotizan como un nuevo proyecto o sprint. Al tener documentación, el costo de agregar funcionalidades es mucho menor que empezar desde cero.' },
    ],
  },
  {
    id: 'automatizacion-whatsapp',
    slug: '/servicios/automatizacion-whatsapp',
    terminalLabel: 'Automation.Active',
    icon: '🤖',
    nombre: 'Automatización e IA / WhatsApp',
    descripcion: 'Bots de WhatsApp, automatización de procesos, pipelines con Python.',
    precio: '$300.000 – $900.000',
    precioTipo: 'proyecto cerrado',
    pills: ['WATI / WhatsApp API', 'Python', 'Apps Script', 'integración email'],
    tiempo: '1–3 semanas',
    para: 'clínicas, comercios, PyMEs con procesos repetitivos',
    waText: 'Hola Santi! Me interesa automatizar procesos con IA o WhatsApp.',
    incluye: [
      { icono: '💬', titulo: 'Bot de WhatsApp', desc: 'Configuración de WATI con flujos de conversación personalizados para tu negocio.' },
      { icono: '🔄', titulo: 'Flujos automáticos', desc: 'Respuestas automáticas, gestión de turnos, recordatorios y seguimiento.' },
      { icono: '📊', titulo: 'Integración con Sheets', desc: 'Cada interacción queda registrada en tu Google Sheets automáticamente.' },
      { icono: '📧', titulo: 'Notificaciones email', desc: 'Recibís un email cuando alguien completa un flujo o hace una consulta.' },
      { icono: '🎓', titulo: 'Capacitación al equipo', desc: 'Te enseñamos a usar y administrar el sistema.' },
      { icono: '📋', titulo: '1 mes de soporte', desc: 'Soporte técnico post-entrega para ajustes y dudas.' },
    ],
    paraQuien: [
      'Consultorios que gestionan turnos por WhatsApp manualmente',
      'Comercios con preguntas repetitivas de clientes',
      'Empresas que quieren atender fuera del horario laboral',
      'Negocios con procesos de aprobación o seguimiento manuales',
      'Cualquier PyME que quiere ahorrar tiempo en tareas repetitivas',
    ],
    noIncluye: [
      'Licencia de WATI (costo mensual aparte, ~USD 40/mes)',
      'Número de WhatsApp Business nuevo (podemos migrar el tuyo)',
      'Integraciones con CRMs de terceros no estándar',
    ],
    proceso: [
      { num: '01', titulo: 'Mapeo de procesos', desc: 'Identificamos qué tareas se pueden automatizar y cuánto tiempo te van a ahorrar.' },
      { num: '02', titulo: 'Diseño de flujos', desc: 'Diseñamos los árboles de conversación y flujos de automatización.' },
      { num: '03', titulo: 'Configuración', desc: 'Implementamos en WATI, conectamos con Sheets y testeamos cada flujo.' },
      { num: '04', titulo: 'Capacitación y entrega', desc: 'Te enseñamos a administrarlo y lo dejamos funcionando.' },
    ],
    stack: [
      { nombre: 'Python', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { nombre: 'JavaScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { nombre: 'Git', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
      { nombre: 'Figma', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
    ],
    faq: [
      { pregunta: '¿Necesito tener WATI ya contratado?', respuesta: 'No. Te ayudamos a contratar y configurar WATI desde cero. El costo de la licencia de WATI (~USD 40/mes) va aparte de nuestro servicio.' },
      { pregunta: '¿Puedo conservar mi número de WhatsApp actual?', respuesta: 'En la mayoría de los casos sí. La migración a WhatsApp Business API suele funcionar con el número existente.' },
      { pregunta: '¿Qué tan complejo puede ser el bot?', respuesta: 'Desde respuestas automáticas simples hasta flujos de múltiples pasos con lógica condicional, integración con Google Sheets y notificaciones. El precio varía según la complejidad.' },
      { pregunta: '¿Qué pasa si el bot no responde bien?', respuesta: 'El primer mes de soporte está incluido para ajustes. Después podés contratar el plan de mantenimiento mensual.' },
    ],
  },
]
```

---

## data/clientes.ts

```ts
export const CLIENTES = [
  {
    id: 'balance',
    nombre: 'Balance Agency',
    rubro: 'Agencia de Marketing',
    logo: '/images/balance.png',
    url: 'https://somosbalance.com.ar',
    desc: 'Sitio web institucional con React, Vite y Framer Motion. Backend en Google Sheets para captura de leads.',
  },
  {
    id: 'padejimas',
    nombre: 'Consultorio Dr. Padejimas',
    rubro: 'Medicina Estética · La Plata',
    iniciales: 'DP',
    url: null,
    desc: 'Implementación de WhatsApp Business con WATI y automatización de atención al paciente.',
  },
  {
    id: 'espaciojoven',
    nombre: 'Espacio Joven',
    rubro: 'Organización Juvenil',
    iniciales: 'EJ',
    url: null,
    desc: 'Plataforma de predicciones del Mundial 2026 con Google OAuth y Google Sheets como backend.',
  },
  {
    id: 'adsumpater',
    nombre: 'Adsum Pater',
    rubro: 'Comunidad Universitaria',
    logo: '/images/AdsumPater.png',
    url: 'https://adsumpater.com.ar',
    desc: 'Web app con .NET 8, Blazor WebAssembly y Firebase. Muro de intenciones en tiempo real.',
  },
]
```

---

## data/portfolio.ts

```ts
export const PROYECTOS = [
  {
    id: 'balance',
    nombre: 'Balance — Agencia de Marketing',
    imagen: '/images/balance.png',
    tags: ['React 19', 'TypeScript', 'Tailwind', 'Framer Motion', 'Vite'],
    url: 'https://somosbalance.com.ar',
  },
  {
    id: 'scdev',
    nombre: 'Portfolio Personal (scdev)',
    imagen: '/images/Scdev.png',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    url: 'https://scdev.com.ar',
  },
  {
    id: 'adsumpater',
    nombre: 'Adsum Pater (Web App)',
    imagen: '/images/AdsumPater.png',
    tags: ['.NET 8', 'Blazor', 'Firebase', 'Clean Arch'],
    url: 'https://adsumpater.com.ar',
  },
  {
    id: 'centroEventos',
    nombre: 'CentroEventos (CampusFit)',
    imagen: '/images/campusfit.png',
    tags: ['.NET 8', 'Blazor', 'SQLite', 'EF Core'],
    url: null,
  },
]
```

---

## Secciones — Referencia de contenido

### Hero.tsx
- Headline: `Transformamos tu negocio en <span className="text-[#D32F2F]">presencia digital</span>`
- Typewriter loop: `["desarrollo web profesional", "automatización e IA", "sistemas a medida"]`
- Descripción: "Somos **SCdev**, agencia de desarrollo web en **La Plata**. Diseñamos y programamos soluciones digitales para profesionales, comercios y empresas en Argentina."
- Botones: "Cotizar por WhatsApp" (primario) · "Ver Servicios" (outline, href="#servicios") · "Ver Trabajos" (outline, href="#portfolio")
- Badge terminal sobre el headline: `SCdev.init() → La Plata, Argentina` con punto rojo pulsante
- Fondo: partículas animadas o gradiente radial `radial-gradient(ellipse at 20% 50%, rgba(211,47,47,0.08), transparent 60%)`

### Nosotros.tsx
- Grid 2 columnas: texto izquierda, devicons derecha
- Avatar iniciales "SC" (círculo rojo 72px, font Syne bold)
- Texto: ver CLAUDE-nuevo.md
- Badges: `UNLP — Lic. en Sistemas` · `La Plata / Ensenada` · `Proyectos en producción` · `Alianza con Balance Agency`
- Devicons: React, TypeScript, Python, FastAPI, C#/.NET, Java, PostgreSQL, JavaScript, Tailwind, Git, Figma, Supabase
- Grid de iconos: 4 cols desktop, 3 cols mobile, hover scale 1.15

### Servicios.tsx
- Mapear `SERVICIOS` del data file
- Grid 2×2 + servicio 5 centrado abajo (o grid 2 cols con el 5 ocupando ancho completo)
- Terminal label encima del grid: `Services.load() → Completed`
- Bloque mantenimiento debajo: 3 tiers (Básico / Estándar ★ / Pro)
- Cada card linkea a su página `/servicios/[slug]`
- **NO hay botón "Ver código"** en ninguna parte del sitio

### Portfolio.tsx
- Carrusel horizontal con snap scroll
- Drag-to-scroll en desktop
- Flechas prev/next
- Dots de paginación
- Cards de 340px fixed width
- Cada card: imagen full, nombre, tags, botón "Ver más →" que abre link externo si tiene URL, o no muestra botón si no tiene
- **NO hay botón "Ver código"** — es una web institucional, no un portfolio de developer

### Contacto.tsx
- Título: "Empecemos tu proyecto"
- Select de servicios actualizado con los 5 del catálogo + mantenimiento + otro
- Submit al Apps Script URL: `https://script.google.com/macros/s/AKfycbwyKDvZD-ci0BEHoCcWeFG4NxkalKO8NEGGpAidSKQ_RSyev5IpQiz0v_QN0H4wtSBe/exec`
- Feedback visual de éxito/error después del submit
- Honeypot anti-spam: `<input type="text" name="_honey" style={{display:'none'}} />`

---

## Páginas de servicio (template)

Cada página en `src/pages/servicios/` recibe los datos desde `SERVICIOS` y renderiza:

1. `<Navbar />` 
2. Hero de la página (headline + precio badge + CTA "Empezar este proyecto")
3. Sección "¿Qué incluye?" — grid de `incluye`
4. Sección "¿Para quién es?" — lista `paraQuien` + recuadro `noIncluye`
5. Sección "Cómo trabajamos" — 4 pasos `proceso` con línea conectora
6. Sección "Tecnologías" — devicons del `stack`
7. Sección "Preguntas frecuentes" — `<details>` accordion con `faq`
8. CTA final — "¿Listo para arrancar?" + botón WhatsApp directo + link al formulario
9. `<Footer />`

Crear un componente `ServicePage.tsx` que reciba un `Servicio` como prop y renderice todo esto, para no repetir código en los 5 archivos.

---

## Restricciones

- Los datos de cada servicio viven en `data/servicios.ts` — no hardcodear en los componentes
- **Nunca mostrar "Ver código"** — es una agencia, no un portfolio personal
- WhatsApp number en una constante global en `src/constants.ts`
- Animaciones con Framer Motion: `fadeInUp` en secciones, `staggerChildren` en grids
- Todas las imágenes en `public/images/` (no en `src/assets/`)
- `LogoChicoFN.png` es el favicon Y la og:image (ya configurado en `index.html`)
- Deploy Netlify: el archivo `public/_redirects` es obligatorio para que el routing funcione

---

## Orden de ejecución para Claude Code

1. `npm create vite@latest` + instalar dependencias
2. Configurar Tailwind v4 en vite.config.ts
3. Crear `src/index.css` con variables y estilos globales
4. Actualizar `index.html` con SEO, favicon LogoChicoFN y Schema.org
5. Crear archivos en `src/data/`
6. Crear `src/constants.ts` con WA_NUMBER y APPS_SCRIPT_URL
7. Crear componentes UI (ServiceCard, ClienteCard, PortfolioCard, MantenimientoTier)
8. Crear Navbar y Footer
9. Crear secciones (Hero, Nosotros, Servicios, Clientes, Portfolio, Contacto)
10. Crear Home.tsx ensamblando todas las secciones
11. Crear ServicePage.tsx (template reutilizable)
12. Crear las 5 páginas de servicio usando ServicePage.tsx
13. Configurar App.tsx con React Router
14. Crear `public/_redirects`
15. `npm run build` y verificar que no hay errores TypeScript
16. Verificar mobile en DevTools (375px)
