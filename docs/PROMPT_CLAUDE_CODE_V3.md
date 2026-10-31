# SCdev v3: rediseño y estructura, Punto y clientes

Repo `SantiagoC1/scdev` (React 19 + Vite + TS + Tailwind v4 + Framer Motion, deploy en Netlify). Leé `CLAUDE.md` antes de arrancar y respetá sus convenciones.

## Cómo trabajar

- El archivo tiene tres partes independientes. Hacé **una sola parte por vez**, en este orden: **C (rediseño) → A (Punto) → B (clientes)**. Al terminar una parte, pará y avisame. La B depende de datos que te paso yo.
- Una rama por parte (`feat/rediseno`, `feat/punto`, `feat/clientes`), un commit por paso, resultado como PR o patch. **No mergees a `main`.** Yo reviso y mergeo; la parte siguiente arranca desde `main` actualizado.
- Donde diga **PARAR**, dejá capturas (Playwright, 375×812 y 1440×900) en `docs/capturas/<parte>-<paso>/` y esperá mi respuesta.
- No inventes clientes, métricas, testimonios ni plazos. Si falta un dato, anotalo en `docs/pendientes.md` como `TODO(santi)` y seguí.
- Textos del sitio en español rioplatense (vos), con oraciones normales. Evitá el guión largo (—) como muletilla en los textos; usá conectores.
- Dependencias de runtime: no agregues ninguna que no esté listada en la parte. En particular **no sumes GSAP, Lenis, Three.js ni tsparticles**: el bundle y la RAM ya fueron un problema con las partículas. Herramientas de build y prueba (`sharp`, `playwright`, `@axe-core/playwright`, `lighthouse`) sí, pero solo como `devDependencies`.
- Framer Motion ya está instalado. Pasá a `LazyMotion` con `domAnimation` y componentes `m.*`, y envolvé la app en `<MotionConfig reducedMotion="user">`.

---

# PARTE C · Rediseño, estructura y rendimiento (rama `feat/rediseno`)

Criterio de diseño: el público son dueños de negocios locales (oficios, consultorios, comercios, estudios) y startups chicas. Lo que quieren saber es qué hacemos, cuánto sale y cuánto tarda. La web tiene que contestar eso rápido, con una sola pieza memorable (el hero) y el resto sobrio. Marca fija: negro + rojo `#D32F2F`, tipografías Syne (títulos) y DM Sans (texto). No cambies la identidad, sacá lo que suena a plantilla.

## C0 · Línea base (no cambies nada todavía)

1. `npm run build && npm run preview`. Corré Lighthouse móvil y escritorio sobre `/` y `/servicios/landing-page-profesional`. Guardá los JSON en `docs/lighthouse/antes/`.
2. Capturas de cada sección en 375, 768 y 1440 en `docs/capturas/c0/`.
3. Tamaño del chunk inicial de JS (gzip) y de cada ruta lazy.
4. Confirmá qué ve un crawler sin JavaScript (`curl -s` de la home y de una página de servicio). La lectura externa de la web en producción solo devuelve los meta del `index.html`, nada del contenido.
5. Escribí `docs/auditoria-c0.md` con los 10 problemas más graves, ordenados por impacto. **PARAR** y mostrámelo.

## C1 · Bugs y peso (sin cambios visuales)

- **Logos de clientes rotos en producción.** En las cards de Clientes se ve el texto alternativo cortado ("Cons Dr", "Adsu Pater", "Balan Agen") en vez del logo. Diagnosticá en la pestaña Network: puede ser un 404 por nombre o mayúsculas (Netlify distingue mayúsculas, y `DrPadegimas.png` existe en `/images` de la raíz pero no en `public/images`) o `loading="lazy"` dentro del marquee. Arreglá la causa, no el síntoma.
- **Imágenes.** `SantaigoCaceres.png` pesa 5,2 MB, `AdsumPater.png` 2,1 MB y cada logo ronda 1 MB. Escribí `scripts/optimizar-imagenes.mjs` (con `sharp`, uso único): máximo 1600 px de ancho en fotos y capturas, 512 px en logos, salida WebP. Objetivo: la foto de Santi menor a 250 KB y ninguna imagen de contenido mayor a 300 KB. Actualizá referencias, poné `width` y `height` en cada `<img>`, `fetchpriority="high"` solo en la imagen del hero (si la hay) y `loading="lazy"` en el resto. Favicon y OG quedan como PNG/JPG.
- **Partículas.** `index.html` carga `particles.min.js` en el `<head>` sin `defer`, así que bloquea el render. Sacalo de ahí y cargalo desde `ParticlesBackground` con inyección de script después de `requestIdleCallback`, solo si `innerWidth >= 768` y no hay `prefers-reduced-motion`. Máximo 40 partículas. Pausalas con `IntersectionObserver` cuando el hero sale de pantalla y destruí la instancia al desmontar.
- **`index.html`.** Poné `<meta charset>` y el viewport antes del snippet de GTM. Sacá el `preconnect` a `fonts.googleapis.com` si las fuentes salen de `@fontsource` (no se usa).
- **OG image real.** `LogoChicoFN.png` está declarada como 1200×630 y no lo es. Generá `public/images/og-scdev.jpg` de 1200×630 (menor a 200 KB) renderizando un HTML chico con Playwright: fondo negro, `LogoCompletoFN`, y el texto "Webs y sistemas para negocios de La Plata. Precios publicados." Usala en `og:image` y `twitter:image` (index y `PageMeta`). El favicon sigue siendo `LogoChicoFN`, pero exportado a 32, 180 y 512 px (hoy se sirve el PNG de 862 KB).
- **Contraste.** `#D32F2F` queda para fondos y botones (texto blanco encima cumple). Para texto rojo sobre fondo oscuro (links, tags, etiquetas) definí `--color-accent-text: #FF6B6B` y reemplazá. Ningún texto menor a 12 px. Verificá con axe que no queden fallas de contraste.
- **`ContactModal.tsx`.**
  - La opción "Presencia Web Esencial ($80k–$100k)" tiene el precio hardcodeado y el Sheet ya dice 90.000. Sacá el precio del texto de las opciones (o armalo desde `useConfig`).
  - Accesibilidad: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apuntando al `<h2>`, cada `<label>` asociado con `htmlFor` e `id`, foco inicial en el primer campo, trampa de foco mientras está abierto y vuelta del foco al botón que lo abrió. Sacá el `<div>` vacío con salto de línea que quedó arriba del título.
  - Botones "Sí / No / No sé": `role="radiogroup"` con `aria-checked` y `aria-label`.
  - Confirmá que después del `fetch` exista `window.dataLayer.push({ event: 'form_submission', form_name: 'contacto_scdev', servicio: form.servicio })`. Si no está, agregalo: el activador de GTM ya lo espera para la conversión de Google Ads.
  - Sacá los `console.log` del payload en producción (tiene datos personales).

## C2 · Sacar lo que suena a plantilla

- Eliminá todas las etiquetas con forma de código: `About.load() → Ready`, `Services.load() → Completed`, `Portfolio.load() → Deployed`, `Clients.load() → Ready`, `— Hablemos`, `SCdev.init() → La Plata, Argentina`. El público no lee código y las de las cards ya te molestaban.
- Nada de `→` pegado a todos los botones. Solo en el CTA principal y en links que llevan a otra página.
- Titulares enteros en blanco, sin una palabra pintada de rojo. El rojo vive en botones, precios y foco.
- Sacá el fade-up de entrada de cada sección. Un solo momento orquestado: la entrada del hero (C3). Después, animación solo como respuesta a una acción: hover y foco de botones, abrir el modal, abrir una pregunta del FAQ.
- No todo es card. Dos radios: 8 px para controles y 16 px para contenedores principales. Sin sombras, salvo modal y panel de Punto.
- Foco visible en todo lo interactivo: anillo de 2 px con `--color-accent-text` y offset de 2 px. Agregá un link "Saltar al contenido" al principio de la página.

## C3 · Hero con selector de rubro (la pieza memorable)

Idea: el visitante se pregunta qué le conviene y cuánto sale. El hero se lo responde en dos clics usando los precios reales de la config (Sheet).

- Escritorio: dos columnas, texto alineado a la izquierda y selector a la derecha. Móvil: apilado, selector debajo del texto.
- H1: "Webs para negocios de La Plata, con el precio a la vista". Sub: "Elegí tu rubro y mirá qué te conviene, cuánto sale y cuánto tarda." Línea chica: "Respondemos en menos de 24 horas hábiles." Dos botones: "Cotizar por WhatsApp" y "Ver servicios".
- `src/data/rubros.ts` (lo edito yo después): `id`, `label`, `servicioId`, `nota`. Mapeo inicial: Oficios (gas, electricidad, plomería) → Presencia web esencial; Salud y consultorios → Landing page profesional, con nota "Sumá turnos por WhatsApp" que enlaza a Automatización; Comercio y gastronomía → Landing page profesional; Estudio o empresa → Sitio web corporativo; Startup o sistema → Sistema a medida.
- `HeroSelector.tsx`: grupo de chips accesible (`role="radiogroup"`, flechas del teclado). Panel de resultado con `aria-live="polite"`: nombre del servicio, "Desde $X" (mínimo de la config con `useConfig` y `formatPrice`, nunca hardcodeado), plazo, tres ítems de `incluye` de `servicios.ts`, botón "Pedir esta web por WhatsApp" (`buildWALink` con texto armado: "Hola, soy de [rubro] y me interesa [servicio]") y link "Ver qué incluye" a la página del servicio. Arrancá con el primer rubro preseleccionado para que el panel nunca esté vacío ni cambie de alto (sin CLS).
- Movimiento: la entrada de H1, sub y panel con **keyframes de CSS** (translateY 12 px, 450 ms, escalonado de 80 ms, `animation-fill-mode: backwards`), no con `initial={{ opacity: 0 }}` de Framer. Así el HTML prerenderizado (C5) se ve sin JS y el LCP no se retrasa. Al cambiar de rubro, crossfade de 200 ms en el panel. Con `prefers-reduced-motion`, sin movimiento.
- Eventos GTM con el patrón de `ContactModal.tsx`: `hero_selector` (`rubro`, `servicio`) y `cta_whatsapp_click` (`location: 'hero'`).
- Las partículas quedan detrás, con opacidad baja para no competir con el texto.

**PARAR** con capturas del hero en 375 y 1440, con dos rubros distintos seleccionados.

## C4 · Estructura de la home

Orden nuevo: Hero → Servicios → Cómo trabajamos → Trabajos → Nosotros → Preguntas frecuentes → CTA final → Footer.

Navbar: Servicios · Trabajos · Nosotros · Preguntas · Contacto (Contacto lleva a `#cta`), más los botones actuales. Todos los links de ancla con scroll programático y compensación de la altura del navbar. Sacá "Clientes" y "Proyectos" como entradas separadas.

**Servicios (escalera de precios).** Dejá de usar cinco cards iguales.
- Presencia web esencial y Landing page profesional van como dos tarjetas grandes lado a lado (las dos puertas de entrada).
- Sitio corporativo, Sistema a medida y Automatización van como filas debajo: nombre, para quién, plazo, "Desde $X" y un chevron. La fila entera es un link a la página del servicio. En móvil, filas apiladas.
- Precios siempre desde la config, con "proyecto cerrado" o "por sprint" como texto chico.
- Mantenimiento: una tabla comparativa de tres columnas (Básico, Estándar, Pro) con el precio mensual arriba y filas de beneficios con tilde o vacío. Estándar resaltado con borde de acento. En móvil, tabs o scroll horizontal accesible. Los beneficios salen de lo que ya está escrito en `Servicios.tsx`.
- Probá la sección sobre superficie clara (`#F3F4F6`, texto `#0a0a0a`, tokens por CSS variables para poder alternar) para separar lo comercial del resto. Dejá capturas de la variante clara y de la oscura y yo elijo. Existen `LogoCompletoHorizontalFB.png` y las otras variantes FB (fondo blanco) por si hace falta.

**Cómo trabajamos.** Cuatro pasos en versión corta (reunión inicial, diseño y propuesta, desarrollo, entrega y deploy), tomados de los textos que ya existen en las páginas de servicio. Acá la numeración sí corresponde, porque es una secuencia. Debajo, las condiciones visibles que ya figuran en las FAQ: 50% para arrancar y 50% al entregar.

**Trabajos (fusión de Clientes y Proyectos).** Los mismos proyectos aparecen hoy en dos secciones. Dejá una sola.
- Eliminá el marquee de clientes.
- Mantené el carrusel actual de proyectos con cards del mismo tamaño y quitá cualquier rastro de "ver código".
- Debajo, una franja estática "También confían en SCdev" con logo (en escala de grises, color en hover) o iniciales, nombre y rubro, sin descripciones y sin movimiento, para los clientes sin captura (Padejimas, Espacio Joven y los que sume la Parte B).

**Nosotros (corto).** Foto de Santiago (blanco y negro, color en hover, ya implementada), dos párrafos, tres datos (UNLP, La Plata y Ensenada, proyectos en producción), una sola fila de íconos de stack (máximo 8) y link "Conocer al equipo" a `/nosotros`. El detalle queda en la página `/nosotros`.

**Preguntas frecuentes.** Seis preguntas con `<details>` nativo: cuánto tarda, cómo es el pago, necesito dominio, puedo pedir cambios después, trabajan con clientes de todo el país, qué incluye el mantenimiento. Las respuestas salen de las FAQ ya escritas en `servicios.ts` y del plan de mantenimiento. No agregues promesas nuevas. Generá el JSON-LD `FAQPage` desde los mismos datos.

**PARAR** con capturas de la home completa en 375 y 1440.

## C5 · SEO técnico y GEO

- **Prerender estático.** Hoy es una SPA y un crawler sin JS ve solo `<div id="root">`. Prerenderizá `/`, `/nosotros` y las cinco rutas `/servicios/*` (más `/privacidad` cuando exista en la Parte A). Elegí la opción más simple de mantener: `vite-react-ssg` o un script `postbuild` con Playwright que guarde el HTML en `dist/<ruta>/index.html`. Tiene que hidratar sin errores ni parpadeo. Verificación: `curl -s localhost:4173/servicios/landing-page-profesional` devuelve un `<h1>` y el `<title>` de esa ruta. Revisá `netlify.toml` y `public/_redirects` para que los HTML prerenderizados tengan prioridad. Dejá el redirect solo en un lugar.
- **Meta por ruta** (`title`, `description`, `canonical`, `og:url`, `og:image`) presentes en el HTML prerenderizado.
- **JSON-LD.** Por página de servicio: `Service` con `Offer` (`priceCurrency: ARS`, precio mínimo de la config o del fallback, `areaServed`), `FAQPage` y `BreadcrumbList`. Mantené el `LocalBusiness`. Sacá el `SearchAction` del `WebSite`: el sitio no tiene buscador y el target (`/?s=`) no existe.
- `public/llms.txt`: descripción corta, lista de servicios con link a cada página y datos de contacto. Sin precios (se desactualizan).
- `sitemap.xml`: sumar `/nosotros` y `/privacidad`, con `lastmod` de la fecha del build.
- `TODO(santi)`: URL del Perfil de Empresa de Google ("SCdev|Desarrollo Web Profesional") para agregarla a `sameAs`.
- Evento `cta_whatsapp_click` con `location` (`hero`, `servicio`, `cta_final`, `flotante`, `punto`) en todos los links a `wa.me`.

## C6 · Cierre

- Lighthouse móvil sobre las mismas dos rutas, JSON en `docs/lighthouse/despues/` y tabla antes/después en `docs/auditoria-c6.md`. Objetivos: Performance 90+, Accesibilidad 95+, Buenas prácticas 95+, SEO 100, LCP menor a 2,5 s, CLS menor a 0,05, TBT menor a 200 ms. Si algo no se alcanza, explicá por qué en el archivo.
- axe sin violaciones serias ni críticas. Navegación completa solo con teclado. Sin scroll horizontal a 320 px.
- El chunk inicial de JS no debe superar el de C0.
- `npm run build` sin errores de TS.

---

# PARTE A · Punto, asistente con IA (rama `feat/punto`)

Insumos (los pongo en `docs/punto/`): `mascota-punto.md` (SVG, poses, expresiones) y `punto-asistente-web.md` (comportamiento, system prompt, estados). Si no están, **pará en A1** y pedímelos.

## Decisiones ya tomadas (no cambiar sin avisar)

1. **Backend en Netlify Functions.** `netlify/functions/punto.mts` con `export const config = { path: "/api/punto" }`. Devuelve el stream del proveedor tal cual (`new Response(r.body, { headers: { "Content-Type": "text/event-stream" } })`). Verificá con `netlify dev` que un POST a `/api/punto` llega a la función y no al `index.html`. Si no llega, agregá `/api/* /.netlify/functions/:splat 200` antes del catch-all en `netlify.toml` y en `public/_redirects`.
2. **Proveedores (CAMBIO respecto del doc original).** Cadena con respaldo automático, todos con endpoint compatible con OpenAI:

   | Orden | Proveedor | Modelo | Límite gratis (según itsfree.ai, verificado el 2/9/2026) |
   |---|---|---|---|
   | 1 | Groq | GPT-OSS 120B (`openai/gpt-oss-120b`, confirmar con `GET /openai/v1/models`) | 1.000 req/día, sin tarjeta |
   | 2 | Google AI Studio | `gemini-3.7-flash`, base `https://generativelanguage.googleapis.com/v1beta/openai` | 15 req/min y 1.500 req/día, sin tarjeta |
   | 3 | Cloudflare Workers AI | Llama 3.3 70B (id y URL a confirmar en la doc de Cloudflare) | 10.000 neurons/día, sin tarjeta |

   Motivo del cambio: `llama-3.3-70b-versatile` no figura entre los modelos gratis de Groq en ese listado (hoy son GPT-OSS 120B y 20B, Qwen 3.8 y 3.6 27B, y los Compound). Los límites gratis cambian sin aviso, así que **nada de ids ni límites va fijo en el código**: variables `PUNTO_PROVIDERS=groq,gemini,cloudflare`, `GROQ_MODEL`, `GEMINI_MODEL`, `CLOUDFLARE_MODEL`, más `GROQ_API_KEY`, `GEMINI_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`. Nunca con prefijo `VITE_`. Si un proveedor responde 429, 5xx, timeout (8 s) o contenido vacío, pasá al siguiente antes de devolver error. No uses OpenRouter como respaldo (50 req/día en cuentas nuevas).
   - GPT-OSS es un modelo de razonamiento: probá `reasoning_effort: "low"` y subí `max_tokens` a 500, porque los tokens de razonamiento pueden comerse el presupuesto y dejar la respuesta vacía. Al reenviar el stream, filtrá y mandá solo `delta.content`, nunca los campos de razonamiento.
3. **Límite de uso con Netlify Blobs** (sin Supabase): store `punto-uso`, clave `sha256(ip + PUNTO_SALT) + fecha`, máximo 30 mensajes por día por IP. Si lo pasa, 429 `{ error: "limite" }`. En el cliente, 1 mensaje cada 3 s.
4. **Precios desde la misma fuente que el sitio.** La función pide la config a `APPS_SCRIPT_URL` (variable de entorno sin `VITE_`), la cachea 10 minutos en memoria y usa el fallback si falla. Mové `CONFIG_FALLBACK` a `src/shared/config-fallback.ts` para que lo importen el front y la función. Punto solo conoce los servicios de `src/data/servicios.ts` (título, slug, precio mínimo de la config, plazo). No incluyas servicios que la web no muestra.
5. **Validación:** solo POST, body `{ mensajes: [{ role, content }] }`, últimos 8 mensajes, solo roles `user` y `assistant`, cada contenido cortado a 500 caracteres, `temperature: 0.6`. System prompt: el de la sección 5 de `punto-asistente-web.md`, en `netlify/functions/punto/prompt.ts`.

## Frontend

```
src/components/punto/
  PuntoWidget.tsx      botón flotante + panel, montado en App.tsx (todas las rutas)
  PuntoAvatar.tsx      SVG de la ficha: props estado, tamaño, conBrazos
  usePuntoChat.ts      fetch a /api/punto, lectura del stream SSE, estados
  respuestasRapidas.ts textos fijos de los 3 botones (fase 1)
```

- **Carga diferida:** `PuntoWidget` con `lazy()`, montado después de `requestIdleCallback` (o 3 s), para no tocar el LCP.
- **Colores:** el SVG de Punto usa los de su ficha (`#E3242B` y degradé). El panel usa los tokens del sitio (acento `#D32F2F`, `--color-accent-text`, fondo `#0a0a0a`, Syne y DM Sans). Nada de Outfit ni Inter.
- **Botón flotante:** abajo a la derecha, 64 px, `aria-label="Abrir el asistente Punto"`. Flota 4 px cada 3 s y parpadea cada 4 s. Globito "¿Te ayudo con tu web?" una vez por sesión (`sessionStorage` con try/catch), a los 20 s o al 50% del scroll. Si ya existe un botón flotante de WhatsApp, Punto lo reemplaza (el panel trae su propio botón).
- **Panel:** 380×560 en escritorio, hoja desde abajo al 85% del alto en celular. No tapa el menú móvil del Navbar. Si el `ContactModal` está abierto, el widget se oculta (`useModal()`).
- **Estados:** reposo, saludo, escuchando, pensando, hablando, contento, preocupado (tabla de la sección 3 del doc). Con Framer Motion. Con `prefers-reduced-motion`, solo cambia la expresión.
- **WhatsApp:** si la respuesta trae `[WHATSAPP]`, sacá la etiqueta y mostrá "Seguir por WhatsApp" con `buildWALink(config.whatsapp_number, ...)` y un texto armado ("Hola, vengo de hablar con Punto en la web. Me interesa: ..."). "Hablar con el equipo" siempre visible.
- **Medición:** `dataLayer.push({ event: 'punto_open' })` al abrir y `{ event: 'punto_whatsapp', servicio }` en el click de WhatsApp (también `cta_whatsapp_click` con `location: 'punto'`).
- **Errores:** 429 o 503 → Punto preocupado, mensaje "Por hoy ya charlamos un montón. Escribile al equipo por WhatsApp y te responden ahí." y botón de WhatsApp.
- **Accesibilidad:** `role="dialog"`, `aria-modal="true"`, foco al abrir y vuelta al botón al cerrar, Escape cierra, mensajes nuevos con `aria-live="polite"`, SVG `aria-hidden`, botones de 44 px mínimo, contraste 4,5:1.
- **Aviso** debajo del input: "Punto es un asistente con IA. No compartas datos sensibles." con link a `/privacidad`.

## Página `/privacidad`

Crear `/privacidad` (lazy, con `PageMeta`, mismo layout que `NosotrosPage`, incluida en el prerender de C5). Contenido: qué datos junta el formulario de contacto (van a Google Sheets); que los mensajes a Punto se envían a un proveedor de IA (Groq, con Google Gemini y Cloudflare como respaldo) para generar la respuesta; que no guardamos las conversaciones; que guardamos un hash de la IP solo para limitar el uso diario; y que en el plan gratis de algunos proveedores los mensajes pueden usarse para mejorar modelos (Google lo indica de forma explícita para Gemini). **Antes de afirmar algo sobre Groq o Cloudflare, leé su política de datos vigente y reflejala tal cual.** Mencioná la Ley 25.326 y el mail de contacto. Sumala al footer y a `public/sitemap.xml`.

## Orden de trabajo (un commit por paso)

1. `PuntoAvatar` + `PuntoWidget` con respuestas fijas para los 3 botones rápidos, sin IA. **PARAR** con capturas de escritorio y celular.
2. Función `/api/punto` con la cadena de proveedores, prompt, base de conocimiento desde la config y streaming.
3. Límite con Blobs, estado preocupado y pruebas de fallback entre proveedores (forzá un 429 en el primero).
4. `[WHATSAPP]`, link armado y eventos de GTM.
5. Página `/privacidad` y aviso en el panel.
6. `.env.example` con todas las variables nuevas y sección "Punto" en `CLAUDE.md` (cómo cambiar de proveedor o de modelo sin tocar código).

## Verificación

- `npm run build` sin errores de TS.
- `netlify dev`: POST a `/api/punto` con curl y stream visible; probá que una respuesta de GPT-OSS nunca llegue vacía.
- En el navegador: abrir, 3 botones, mensaje libre, `[WHATSAPP]`, error forzado (sin claves) con Punto preocupado, `prefers-reduced-motion`, solo teclado, 375 px.
- El widget vive en un chunk aparte y el bundle inicial no crece.
- Ninguna clave aparece en `dist/`.

---

# PARTE B · Clientes y portfolio (rama `feat/clientes`)

## Correcciones

- `src/data/clientes.ts`: el nombre dice "Consultorio Dr. Padejimas" y el logo es `DrPadegimas.png`. Corregir a la grafía correcta (`TODO(santi)`: te la confirmo; hasta entonces dejalo marcado en `docs/pendientes.md`).
- `src/data/portfolio.ts`: la tarjeta "Portfolio Personal (scdev)" dice HTML5, CSS3 y JavaScript, pero el sitio es React 19 + TS + Tailwind v4 + Framer Motion. Actualizá nombre ("Sitio de SCdev"), tags y captura (sacala del sitio ya rediseñado).
- `README.md` describe la versión vieja (HTML/CSS/JS, Particles.js, FormSubmit). Reescribilo con el stack actual, las variables de entorno y el deploy en Netlify.
- Borrá las imágenes que nada usa: `Bplay.png`, `EasyBet.png`, `UnidosConstruimosLogo.png`, `LogoCompletoFN.png`. Hacé grep antes y avisame si alguna se usa en otro lado.

## Clientes nuevos

Mismo formato que los actuales (`id`, `nombre`, `rubro`, `logo` o `iniciales`, `url`, `desc`). Agregá un campo `tipo: 'cliente' | 'demo'` y un campo `captura` (opcional). Las capturas las dejo yo en `docs/clientes-nuevos/` (`diputados.png`, `deca.png`, `flor.png`, `tabano.png`); pasalas por `scripts/optimizar-imagenes.mjs` a WebP (máximo 1600 px de ancho, menos de 300 KB) y ponelas en `public/images/`. Si falta alguna, anotalo en `docs/pendientes.md` y seguí.

Son cuatro proyectos. En el carrusel de Trabajos entran los cuatro, con captura. Las descripciones son cortas y solo dicen lo que se ve en la captura o lo que ya sé. No agregues métricas, resultados ni testimonios.

| id | nombre | url | tipo | rubro | desc (usar tal cual) |
|---|---|---|---|---|---|
| `diputados-bonaerenses` | Diputados Bonaerenses | https://diputadosbsas.com.ar/ | cliente | Medio de noticias | "Portal de noticias sobre la Legislatura bonaerense. Mantenimiento y corrección de errores." |
| `deca-sgi` | Deca Electromecánica · SGI | https://demo-deca.vercel.app/dashboard | demo | Sistema a medida | "Demo de un módulo de seguridad e higiene: dashboard de cumplimiento, capacitaciones, vencimientos e inspecciones de equipos." |
| `florencia-inveninato` | Florencia Inveninato | https://demo-flor.vercel.app/pacientes | demo | Salud, consultorio | "Demo de un sistema de gestión de pacientes y agenda para un consultorio de ortodoncia con dos sedes." |
| `tabano` | Tábano · Cultura y Vida Cristiana | https://tabanocultura.org/ | cliente | Institucional, educación | "Sitio institucional de un grupo de profesores y profesionales dedicado a la enseñanza de la tradición clásica y cristiana." |

Reglas para estos cuatro:

- **Los dos demos se marcan como demo.** En la card y en la franja aparece un chip "Demo" y el botón dice "Ver demo", no "Ver sitio". Los datos de esos demos son de ejemplo (por ejemplo el paciente "perez, juan"): no los copies a ningún texto del sitio ni uses nombres de personas en las descripciones. No los cuentes como clientes en ningún número ni frase ("clientes", "proyectos entregados"). Si el sitio muestra un contador, que diga solo "proyectos".
- **Los links a los dos demos y a Tábano** abren en pestaña nueva con `rel="noopener noreferrer"`.
- **Diputados Bonaerenses.** El cliente todavía no confirmó el contrato de mantenimiento. Antes de publicar, anotá en `docs/pendientes.md` `TODO(santi): confirmar con Juan Manuel Negri que podemos mostrar el sitio`, y dejá el item detrás de un flag `visible: false` en `clientes.ts` hasta que yo lo cambie a `true`. La captura se hizo desde la home, que muestra fotos de personas públicas de portadas de noticias: usá una captura recortada solo del encabezado y la grilla de titulares, sin la nota principal con fotos de rostros.
- **Tábano.** Antes de escribir nada más sobre este sitio, visitalo y confirmá que está online. La descripción de la tabla sale de su propio texto de portada. No agregues lo que hicimos nosotros (rediseño, desarrollo, hosting) hasta que yo te lo diga: `TODO(santi): ¿qué hiciste en Tábano (diseño, desarrollo, mantenimiento)?`.
- **Orden en el carrusel:** Tábano, Deca, Florencia, Diputados, y después los proyectos que ya estaban.
- Dejá los logos viejos (`DrPadegimas.png` y compañía) como están: esta parte no los toca salvo por la corrección de grafía de arriba.
