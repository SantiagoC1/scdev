# CLAUDE.md — scdev Portfolio (Santiago Cáceres)

Este archivo guía a Claude Code en las mejoras del sitio `scdev.com.ar`.
El sitio es **HTML + CSS + JS puro** (estático, one-page). No hay framework ni build step.

---

## Contexto del proyecto

- **Dueño:** Santiago Cáceres — Desarrollador Full Stack, estudiante UNLP, fundador de SCdev
- **URL producción:** https://scdev.com.ar
- **Repo:** https://github.com/SantiagoC1/scdev
- **Archivos clave:** `index.html`, `style.css`, `script.js`
- **Imágenes:** `/images/` — JPG/PNG, ya referenciadas en el HTML
- **Deploy:** directo desde el repo (Netlify o similar). Cualquier cambio en `main` se refleja en producción.

---

## Tareas a ejecutar (en orden)

### TAREA 1 — Mejora de diseño y profesionalismo

El sitio ya tiene una base sólida (dark theme, partículas, scroll reveal). El objetivo es llevarlo a un nivel claramente **profesional y premium**, sin cambiar la identidad visual existente (dark mode, acento rojo `#D32F2F`).

**Cambios específicos a aplicar en `style.css` e `index.html`:**

#### Tipografía
- Reemplazar la fuente actual por el par: **`Syne`** (display/headings) + **`DM Sans`** (body)
- Agregar en el `<head>`: `https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap`
- Aplicar `font-family: 'Syne', sans-serif` a `h1, h2, h3, h4`
- Aplicar `font-family: 'DM Sans', sans-serif` a `body, p, li, span, a`

#### Cards de proyectos (sección `#portfolio`)
Actualmente son imagen + título solamente. Mejorar cada card para que muestre:
- Imagen con overlay oscuro en hover con efecto `scale(1.05)` y `transition: 0.4s ease`
- Título del proyecto (ya existe)
- **Tags de tecnologías** visibles debajo del título (badges pequeños con border y sin fondo sólido)
- Botón "Ver Detalles" más prominente con efecto hover (el botón ya existe, mejorar su estilo)
- Agregar sombra `box-shadow` a las cards: `0 8px 32px rgba(0,0,0,0.4)`
- Border radius: `12px` en las cards

#### Skills/Tecnologías (sección `#skills`)
- Convertir los textos planos de tecnologías en **badges visuales** con:
  - `border: 1px solid rgba(211, 47, 47, 0.4)`
  - `background: rgba(211, 47, 47, 0.08)`
  - `border-radius: 6px`, `padding: 6px 14px`
  - Hover: `background: rgba(211, 47, 47, 0.18)`, `transform: translateY(-2px)`

#### Hero section
- Agregar un **gradiente sutil** de fondo en el hero (además de las partículas):
  `background: radial-gradient(ellipse at 20% 50%, rgba(211,47,47,0.08) 0%, transparent 60%)`
- El `h1` del hero debe tener `font-size` escalado: `clamp(2.5rem, 6vw, 5rem)`
- Aumentar el `letter-spacing` del nombre a `-0.02em`

#### Navegación
- Agregar `backdrop-filter: blur(12px)` al navbar cuando tiene la clase `.scrolled` (ya existe en JS)
- Borde inferior sutil al navbar en scroll: `border-bottom: 1px solid rgba(255,255,255,0.06)`

#### Efectos generales
- Agregar `::selection` global: `background: rgba(211,47,47,0.3); color: #fff`
- Scrollbar personalizada:
  ```css
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #121212; }
  ::-webkit-scrollbar-thumb { background: #D32F2F; border-radius: 3px; }
  ```
- Separadores entre secciones: agregar `border-top: 1px solid rgba(255,255,255,0.05)` a cada `section`

#### Botones CTA
- El botón primario debe tener:
  ```css
  background: #D32F2F;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px rgba(211,47,47,0.35);
  ```
- Hover: `transform: translateY(-2px); box-shadow: 0 8px 28px rgba(211,47,47,0.5)`

---

### TAREA 2 — Agregar proyecto "Balance" al portfolio

**Proyecto a agregar:**
- **Nombre:** Balance — Agencia de Marketing
- **Cliente:** Agencia Balance (Pili & Pachi — Comunicación y Marketing para marcas y líderes)
- **Stack:** React 19 + Vite + TypeScript + Tailwind CSS v4 + Framer Motion + Google Sheets (backend de leads)
- **Repo cliente:** https://github.com/SantiagoC1/BalanceAgenciaDeMarketing
- **Descripción:** Landing page institucional moderna para agencia de marketing. Incluye integración con Google Apps Script para captura de leads en Google Sheets, animaciones con Framer Motion, y configuración dinámica.
- **Imagen:** Usar `images/balance.png` — **DEBES CREAR ESTE PLACEHOLDER**: si no existe la imagen en el repo, agregar en el HTML un comentario `<!-- TODO: agregar images/balance.png con screenshot del proyecto -->` y usar `images/Scdev.png` como fallback temporal.

**En `index.html`, dentro de la sección `#portfolio`, agregar una nueva card con esta estructura** (respetar el patrón HTML existente de las otras cards):

```html
<div class="portfolio-item" data-project="balance">
  <img src="images/balance.png" alt="Balance Agencia de Marketing" onerror="this.src='images/Scdev.png'">
  <div class="portfolio-overlay">
    <button class="btn-details" onclick="openModal('balance')">Ver Detalles</button>
  </div>
  <div class="portfolio-info">
    <h3>Balance — Agencia de Marketing</h3>
    <div class="tech-tags">
      <span>React 19</span>
      <span>TypeScript</span>
      <span>Tailwind CSS</span>
      <span>Framer Motion</span>
      <span>Vite</span>
    </div>
  </div>
</div>
```

**En `script.js`, agregar los datos del modal de Balance** al objeto/array de proyectos que alimenta el modal existente:

```js
balance: {
  title: "Balance — Agencia de Marketing",
  result: "Landing page institucional moderna",
  description: "Sitio web para Balance, agencia de comunicación y marketing para marcas y líderes. Desarrollado con React 19 + TypeScript + Tailwind CSS v4 y Framer Motion para animaciones. Integración con Google Apps Script para captura y gestión de leads directamente en Google Sheets. Diseño elegante y adaptable a todos los dispositivos.",
  url: "https://github.com/SantiagoC1/BalanceAgenciaDeMarketing",
  code: "https://github.com/SantiagoC1/BalanceAgenciaDeMarketing"
}
```

> Si el modal usa un array en lugar de objeto, adaptar la estructura al patrón existente. Leer `script.js` antes de modificar.

**Posición en el portfolio:** Agregar como **primer item** (más reciente primero). Desplazar los existentes hacia abajo.

---

### TAREA 3 — SEO y GEO (Visibilidad en buscadores y en IAs)

#### 3.1 — Meta tags en `<head>` del `index.html`

Reemplazar/mejorar los meta tags existentes con:

```html
<!-- SEO Básico -->
<title>Santiago Cáceres | Desarrollador Web Full Stack — La Plata, Argentina</title>
<meta name="description" content="Desarrollador web full stack en La Plata, Argentina. Especialista en React, .NET, TypeScript y arquitecturas limpias. Creador de sitios web profesionales, landing pages y soluciones digitales a medida para negocios en Argentina.">
<meta name="keywords" content="desarrollador web La Plata, programador full stack Argentina, desarrollo web Argentina, React developer Argentina, .NET developer La Plata, landing page Argentina, sitio web profesional La Plata, SCdev">
<meta name="author" content="Santiago Cáceres">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://scdev.com.ar/">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://scdev.com.ar/">
<meta property="og:title" content="Santiago Cáceres — Desarrollador Web Full Stack en La Plata">
<meta property="og:description" content="Desarrollador web full stack en La Plata, Argentina. Especialista en React, .NET y TypeScript. Soluciones digitales a medida para negocios argentinos.">
<meta property="og:image" content="https://scdev.com.ar/images/Scdev.png">
<meta property="og:locale" content="es_AR">
<meta property="og:site_name" content="SCdev — Santiago Cáceres">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Santiago Cáceres — Desarrollador Web Full Stack">
<meta name="twitter:description" content="Desarrollador web full stack en La Plata, Argentina. React, .NET, TypeScript.">
<meta name="twitter:image" content="https://scdev.com.ar/images/Scdev.png">

<!-- Geolocalización -->
<meta name="geo.region" content="AR-B">
<meta name="geo.placename" content="La Plata, Buenos Aires, Argentina">
<meta name="geo.position" content="-34.9215;-57.9545">
<meta name="ICBM" content="-34.9215, -57.9545">
```

#### 3.2 — Schema.org (JSON-LD) — agregar antes de `</body>`

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://scdev.com.ar/#person",
      "name": "Santiago Cáceres",
      "alternateName": "SCdev",
      "url": "https://scdev.com.ar",
      "image": "https://scdev.com.ar/images/Scdev.png",
      "description": "Desarrollador web full stack especializado en React, .NET y TypeScript. Estudiante avanzado de la Licenciatura en Sistemas en UNLP. Fundador de SCdev.",
      "jobTitle": "Desarrollador Web Full Stack",
      "worksFor": {
        "@type": "Organization",
        "name": "SCdev",
        "url": "https://scdev.com.ar"
      },
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "Universidad Nacional de La Plata",
        "alternateName": "UNLP",
        "url": "https://unlp.edu.ar"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "La Plata",
        "addressRegion": "Buenos Aires",
        "addressCountry": "AR"
      },
      "knowsAbout": [
        "Desarrollo Web",
        "React",
        ".NET",
        "TypeScript",
        "Clean Architecture",
        "Landing Pages",
        "SEO",
        "Full Stack Development"
      ],
      "sameAs": [
        "https://github.com/SantiagoC1"
      ]
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://scdev.com.ar/#business",
      "name": "SCdev — Desarrollo Web Profesional",
      "url": "https://scdev.com.ar",
      "image": "https://scdev.com.ar/images/Scdev.png",
      "description": "Agencia de desarrollo web en La Plata, Argentina. Especializada en landing pages, sitios corporativos y soluciones .NET para negocios argentinos.",
      "founder": { "@id": "https://scdev.com.ar/#person" },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "La Plata",
        "addressRegion": "Buenos Aires",
        "addressCountry": "AR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -34.9215,
        "longitude": -57.9545
      },
      "areaServed": {
        "@type": "Country",
        "name": "Argentina"
      },
      "priceRange": "$$",
      "serviceType": [
        "Desarrollo de sitios web",
        "Landing Pages",
        "Desarrollo .NET",
        "Soluciones web a medida"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://scdev.com.ar/#website",
      "url": "https://scdev.com.ar",
      "name": "SCdev — Santiago Cáceres",
      "description": "Portfolio y servicios de Santiago Cáceres, desarrollador web full stack en La Plata, Argentina.",
      "publisher": { "@id": "https://scdev.com.ar/#person" },
      "inLanguage": "es-AR"
    }
  ]
}
</script>
```

#### 3.3 — Crear `sitemap.xml` en la raíz del repo

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://scdev.com.ar/</loc>
    <lastmod>2026-05-25</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

#### 3.4 — Crear `robots.txt` en la raíz del repo

```
User-agent: *
Allow: /

Sitemap: https://scdev.com.ar/sitemap.xml
```

#### 3.5 — GEO: texto en el body para visibilidad en IAs

En la sección `#about` (Sobre Mí), al final del párrafo existente, agregar **naturalmente** (sin que se vea forzado):

> Trabajando desde **La Plata y Ensenada, Buenos Aires**, ofrezco soluciones digitales para emprendedores, profesionales y empresas de **Argentina** que quieren crecer online.

En el footer, el texto actual dice "Ensenada / La Plata, Buenos Aires". Asegurarse que diga:
> Ensenada / La Plata, Buenos Aires, **Argentina**

#### 3.6 — Precios en los planes de servicio

Los precios actuales muestran solo `$`. Para mejorar el SEO de conversión y permitir rich snippets futuros, agregar texto descriptivo junto al símbolo. Ejemplo:
- Web Express: `Desde $80.000 ARS`
- Web Profesional: `Desde $150.000 ARS`
- Mantenimiento: `$25.000 ARS/mes`

> ⚠️ Consultar con Santiago antes de publicar precios reales. Si no están definidos, dejar como `Consultar precio` o mantener `$` + agregar `data-price` attribute para SEO futuro.

---

## Notas para Claude Code

- **No romper el JS existente**: el sitio tiene partículas, typewriter, scroll reveal y modal de proyectos. Leer `script.js` completo antes de modificarlo.
- **Respetar la paleta de colores**: `#121212` (fondo), `#D32F2F` (acento rojo), `#FFFFFF` (texto principal).
- **Mobile-first**: el sitio ya es responsive. Cualquier cambio CSS debe mantenerse responsive.
- **Sin dependencias nuevas**: no agregar librerías adicionales. Todo CSS/JS debe ser vanilla o usar lo ya importado (Particles.js, SweetAlert2, FontAwesome).
- **Imagen de Balance**: si `images/balance.png` no existe, usar `images/Scdev.png` como `src` con `onerror` fallback. Agregar comentario en el HTML indicando que se debe reemplazar con screenshot real.
- **Commit messages**: usar formato `feat: descripción` / `fix: descripción` / `seo: descripción`.

## Orden de ejecución recomendado

1. Leer `index.html`, `style.css` y `script.js` completos
2. Aplicar Tarea 3 (SEO/meta tags + schema.org + sitemap + robots.txt) — no rompe nada
3. Aplicar Tarea 1 (diseño) — solo CSS + pequeños cambios HTML
4. Aplicar Tarea 2 (agregar Balance) — requiere entender estructura del modal en JS
5. Verificar que el sitio se ve bien en mobile (revisar responsive breakpoints existentes)