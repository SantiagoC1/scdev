# Rediseño del sitio: Trabajos, Nosotros, Servicios, prerender y SEO

Rama `feat/rediseno` → `main`. **PR en borrador:** falta verificar el Deploy Preview (checklist al final) y cerrar los `TODO(santi)`.

## Resumen

El sitio pasa de una SPA vacía para los crawlers, con LCP de 10 a 11 s en celular, a páginas prerenderizadas con LCP de 1 a 1,4 s, accesibilidad 97 a 98 y SEO 100. Además se rediseñan las secciones (hero con selector de rubro, servicios en escalera de precios, Trabajos unificado, Nosotros corto) y se agregan meta por ruta y datos estructurados.

## Qué cambió

**Peso y performance (C1, C2)**
- Imágenes a WebP con `width` y `height`; se borraron los PNG reemplazados (fotos del equipo de 5 a 7,6 MB, logos de clientes de ~1 MB). Ninguna imagen de contenido supera 60 KB.
- OG image real de 1200×630 y favicons 32/180/512 (antes: un PNG de 862 KB declarado como 1200×630).
- Partículas fuera del `<head>`: se cargan en idle, solo en pantallas de 768 px o más y sin `prefers-reduced-motion`.
- `LazyMotion` + `m.*`, `MotionConfig reducedMotion="user"`, preload de Syne 700 y DM Sans 400 (CLS 0,039 → 0,006).
- Todo lo que está bajo el hero carga con `lazy()`: el chunk inicial baja de 130,8 KB a **116,2 KB** gzip (−11 %).

**Accesibilidad (C1, C2)**
- Contraste (`--color-accent-text`), foco rojo visible, skip link, región con scroll enfocable.
- `ContactModal`: labels con `htmlFor`/`id`, trampa de foco, retorno del foco, radiogroup con flechas, sin datos personales en la consola.
- axe (WCAG 2 A/AA) a 375 y 1440 en las 7 rutas y en la 404: **0 violaciones**. Sin scroll horizontal a 320 px. Navegación completa solo con teclado.

**Diseño (C2 a C4)**
- Rojo solo en botones, precios y foco; radios 8/16; sin sombras ni fade-up por sección.
- Hero con selector de rubro (precios de la config, teclado y eventos GTM) que entra en 375×667 sin scroll.
- Servicios en escalera de precios sobre superficie clara, con tabla de mantenimiento.
- Trabajos fusiona Clientes y Proyectos (tipo cliente/demo, `visible`, franja "Confían en SCdev").
- Nosotros corto: equipo antes de la historia, sin cifras, stack de 6 íconos por persona.
- "Cómo trabajamos" y preguntas frecuentes con datos compartidos y JSON-LD `FAQPage`.

**SEO y GEO (C5, C6)**
- Prerender estático de `/`, `/nosotros` y las 5 `/servicios/*`, con hidratación. El build falla si una ruta válida queda sin HTML o sin `<h1>`. La lista sale de una sola tabla (`PAGINAS` en `src/App.tsx`).
- `<title>`, descripción, canonical y Open Graph propios por ruta. JSON-LD: `LocalBusiness` y `WebSite` en la home (sin `SearchAction`), `Service` + `Offer`, `FAQPage` y `BreadcrumbList` por servicio.
- `sitemap.xml` generado en cada build, `llms.txt`, 404 real con `noindex` (`/* → /404.html 404`; se eliminó `public/_redirects`).
- Los precios del HTML y del JSON-LD se leen del Sheet durante el build (timeout de 8 s, con respaldo y aviso en el log). Rebuild automático con un build hook (ver README).
- Evento `cta_whatsapp_click` con `location` en todos los links a `wa.me`.

## Métricas, antes y después

Lighthouse sobre el build servido como lo hace Netlify. Antes: 1 corrida (`docs/lighthouse/antes/`). Después: 4 corridas por combinación, se descarta la primera y se informa la mediana de las otras 3 (`docs/lighthouse/despues/`).

| Ruta | Modo | | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|---|
| `/` | móvil | antes | 41 | 94 | 100 | 100 | 11,0 s | 0,009 | 1.992 ms |
| | | **después** | **70** | **98** | 100 | 100 | **1,4 s** | **0** | 2.431 ms |
| `/` | escritorio | antes | 84 | 91 | 100 | 100 | 1,9 s | 0,039 | 208 ms |
| | | **después** | **85** | **98** | 100 | 100 | **0,4 s** | **0** | 344 ms |
| `/servicios/landing-page-profesional` | móvil | antes | 46 | 93 | 100 | 100 | 10,1 s | 0,001 | 2.208 ms |
| | | **después** | **71** | **98** | 100 | 100 | **1,1 s** | **0** | 2.317 ms |
| `/servicios/landing-page-profesional` | escritorio | antes | 91 | 91 | 100 | 100 | 1,2 s | 0 | 206 ms |
| | | **después** | 84 | **97** | 100 | 100 | **0,3 s** | **0** | 377 ms |

| Otros | Antes | Después |
|---|---|---|
| Chunk inicial de JS (gzip) | 130,8 KB | 116,2 KB |
| CSS (gzip) | 8,2 KB | 9,9 KB |
| `curl` de una página de servicio | `<div id="root"></div>` y el `<title>` de la home | HTML completo, `<h1>` y meta propios |

### Lo que no se alcanza (a propósito, sin maquillar)

- **Performance 90+**: móvil 70 a 71, escritorio 84 a 85.
- **TBT menor a 200 ms**: móvil ~2,4 s, escritorio 344 a 377 ms.

El TBT es sobre todo de Google Tag Manager y Google Analytics: bloqueando solo GTM/GA, el TBT móvil bajó a unos 180 ms y Performance subió a unos 81. En escritorio el TBT subió respecto de la línea base (208 → 344 ms) porque el prerender sumó la hidratación del HTML completo; a cambio el LCP bajó de 1,9 a 0,4 s. El TBT varía entre sesiones (1,3 a 2,4 s para el mismo commit) según cuánto tarde GTM/GA, por eso las comparaciones se hicieron dentro de la misma sesión.

Se probó diferir GTM (`GTM_DIFERIDO` en `src/gtm.config.ts`): no mejora lo que mide Lighthouse y suma un riesgo mínimo sobre las conversiones. **Queda apagado por defecto.** Detalle en `docs/auditoria-c6.md`.

## Qué revisar con más atención

- **Rutas ya no son SPA.** Cada ruta válida es un archivo; las desconocidas devuelven 404 con la página de error. Probar un link directo a cada servicio.
- **Variable de entorno en Netlify.** El prerender lee el Sheet con `VITE_APPS_SCRIPT_URL`. Si no está definida en el contexto del Deploy Preview, el build usa los precios de respaldo y lo avisa en el log (el build no falla).
- **Tres PNG pesados sin uso siguen en `public/images`** (`LogoChicoFB.png` 1,2 MB, `LogoCompletoFB.png` 1,7 MB, `LogoCompletoHorizontalFB.png` 1,4 MB). Nada del sitio los referencia, pero Netlify los publica. Quedaron fuera del alcance; se pueden borrar en este PR o en uno aparte.
- **Cambio visual inevitable:** el texto rojo es ahora `#FF6B6B` y el texto secundario es más claro, por contraste.

## Pendientes que dependen de Santi

- **TODO(santi) Stack por persona** (`src/data/equipo.ts`): confirmar o corregir los íconos de cada tarjeta de `/nosotros`. Son una propuesta a partir de lo que había cargado.
- **TODO(santi) Logo de Consultorio Dr. Padejimas** (`src/data/clientes.ts`): el archivo `DrPadegimas.webp` es una textura azul, no un logo; la franja "Confían en SCdev" muestra el nombre en texto hasta que haya uno real (idealmente con fondo transparente).
- **TODO(santi) Perfil de Empresa de Google** (`index.html`): URL para sumarla a `sameAs` del `LocalBusiness`.
- **TODO(santi) Textos nuevos a confirmar:** "50 % para arrancar y 50 % al entregar" (Cómo trabajamos y FAQ; no estaba escrito en ninguna FAQ) y "¿Trabajan con clientes de todo el país?" (respuesta nueva, basada en lo que ya dice el sitio).
- **TODO(santi) Valor del Sheet:** `price_esencial_min` devuelve 80000. Si ya se cambió a 90000, falta publicar una versión nueva del despliegue del Apps Script.

Detalle en `docs/pendientes.md`.

## Checklist de verificación sobre el Deploy Preview

Reemplazar `PREVIEW` por la URL del Deploy Preview de este PR (`https://deploy-preview-<N>--<sitio>.netlify.app`).

### 1. Build correcto

- [ ] El check de Netlify del PR está en verde y el log del build termina con `✓ 7 rutas válidas verificadas en el prerender`.
- [ ] En el log aparecen `✓ sitemap.xml (7 rutas …)` y `✓ 404.html (… noindex)`.
- [ ] En el log aparece `✓ Config leída del Sheet (…)` y **no** `⚠ No pude leer el Sheet` ni `⚠ VITE_APPS_SCRIPT_URL no está definida`. Si aparece, cargar la variable en el contexto "Deploy Previews" y volver a desplegar.
- [ ] Localmente, `npm run build` y `npx tsc --noEmit` terminan sin errores.

### 2. `curl` por ruta

```bash
PREVIEW=https://deploy-preview-N--SITIO.netlify.app
for r in / /nosotros /servicios/presencia-web-esencial /servicios/landing-page-profesional \
         /servicios/sitio-web-corporativo /servicios/sistema-a-medida /servicios/automatizacion-whatsapp; do
  echo "== $r"
  curl -s -o /tmp/p.html -w "HTTP %{http_code}\n" "$PREVIEW$r"
  grep -o '<title>[^<]*</title>' /tmp/p.html
  grep -o '<link rel="canonical"[^>]*>' /tmp/p.html
  echo "h1: $(grep -o '<h1' /tmp/p.html | wc -l)"
done
curl -s -o /dev/null -w "404 esperado: HTTP %{http_code}\n" "$PREVIEW/ruta-que-no-existe"
curl -s "$PREVIEW/ruta-que-no-existe" | grep -c noindex            # 1 o más
curl -s "$PREVIEW/sitemap.xml" | grep -c "<loc>"                   # 7
curl -s -o /dev/null -w "llms.txt: HTTP %{http_code}\n" "$PREVIEW/llms.txt"
curl -s -o /dev/null -w "robots.txt: HTTP %{http_code}\n" "$PREVIEW/robots.txt"
```

- [ ] Las 7 rutas devuelven `HTTP 200`, con un `<title>` distinto en cada una y exactamente un `<h1>`.
- [ ] El canonical de cada ruta apunta a `https://scdev.com.ar/...` (es lo esperado, aunque se pruebe en el preview).
- [ ] Una ruta inexistente devuelve `HTTP 404` con `noindex`.
- [ ] `sitemap.xml` lista 7 URLs; `llms.txt` y `robots.txt` devuelven 200.
- [ ] Un link directo a un servicio (abrirlo pegando la URL, sin pasar por la home) carga bien.

### 3. PageSpeed

En <https://pagespeed.web.dev/> con la URL del preview, **`/` y `/servicios/landing-page-profesional`, en móvil y escritorio**. Correr cada una 3 veces: el TBT varía mucho entre corridas y sesiones.

- [ ] Móvil: Performance cerca de 70, LCP de 1,4 s o menos, CLS 0.
- [ ] Escritorio: Performance cerca de 85, LCP de 0,4 s o menos, CLS 0.
- [ ] Accesibilidad 97 o más, Prácticas recomendadas 100, SEO 100 en las cuatro combinaciones.
- [ ] El TBT puede dar peor que la tabla del PR (depende de GTM/GA); si LCP, CLS o los puntajes de accesibilidad y SEO empeoran, es una regresión real.

### 4. Prueba de resultados enriquecidos

En <https://search.google.com/test/rich-results> con la URL pública del preview (los Deploy Previews son públicos salvo que tengan contraseña). Además, <https://validator.schema.org/> para los tipos que la prueba de Google no muestra.

- [ ] `/`: `FAQPage` detectado y válido; `LocalBusiness` y `WebSite` sin errores en validator.schema.org; sin `SearchAction`.
- [ ] Cada una de las 5 `/servicios/*`: `FAQPage` y `BreadcrumbList` detectados y válidos; `Service` con `Offer` sin errores en validator.schema.org.
- [ ] El precio del `Offer` coincide con el que muestra la página (viene del Sheet).
- [ ] Sin errores. Las advertencias de campos opcionales se revisan caso por caso.

### 5. Prueba en celular

En un teléfono real (idealmente Android e iPhone), con datos móviles, abriendo la URL del preview.

- [ ] Home: el hero con el selector de rubro se ve completo sin scrollear; el menú del navbar abre y cierra; las anclas llevan a su sección.
- [ ] Servicios y tabla de mantenimiento legibles; Trabajos con el carrusel arrastrable; preguntas frecuentes abren y cierran.
- [ ] `/nosotros`: tarjetas del equipo en 2 columnas y el stack en una sola fila.
- [ ] Una página de servicio: precio, "Qué incluye", FAQ y botón de WhatsApp.
- [ ] **Formulario:** enviar una consulta de prueba, ver que aparece la fila en el Google Sheet y borrarla después.
- [ ] **WhatsApp:** los botones abren `wa.me` con el mensaje armado.
- [ ] Sin scroll horizontal en ninguna pantalla.
- [ ] Con GTM en modo Preview (Tag Assistant): se disparan `cta_whatsapp_click` (con `location`) y `form_submission`. Los eventos de prueba entran a la propiedad real de GA4 salvo que se filtren.

### Antes de dejar de ser borrador

- [ ] Checklist completo.
- [ ] `TODO(santi)` resueltos o aceptados explícitamente.
- [ ] Plan de vuelta atrás: en Netlify, *Deploys → deploy anterior → Publish deploy*.
