# Pendientes

Cosas que dependen de datos que solo tiene Santi. Cada una tiene un `TODO(santi)` en el código o en este archivo.

## Stack por persona (`src/data/equipo.ts`)

Los íconos de cada tarjeta de /nosotros (máximo 6, una fila) son una propuesta a partir de lo que había cargado. Hay que confirmar cuáles son verdad para cada uno:

| Persona | Íconos actuales |
|---|---|
| Santiago | React, TypeScript, Python, FastAPI, PostgreSQL, Supabase |
| Agustín | Python, FastAPI, Java, JavaScript, PostgreSQL, Supabase |
| Lucas | Python, FastAPI, Java, JavaScript, Supabase, Git |
| Ezequiel | Python, FastAPI, Java, JavaScript, PostgreSQL, Supabase |

TODO(santi): confirmar o corregir cada lista.

## Trabajos (Parte B)

Datos en `src/data/portfolio.ts` (carrusel) y `src/data/clientes.ts` (franja "Confían en SCdev"). Los demos nunca cuentan como clientes (Florencia Inveninato pasó a `tipo: 'cliente'`: aparece en la franja con su logo y la card no lleva link ni cartel): la franja solo toma `tipo === 'cliente'` y `visible !== false`.

- TODO(santi): **Florencia Inveninato como `tipo: 'cliente'`** (franja "Confían en SCdev" y card sin cartel Demo) queda así solo hasta que lo confirmes: si no es cliente, volver a `tipo: 'demo'` en `src/data/clientes.ts` y `src/data/portfolio.ts`.
- Deca y Diputados Bonaerenses ya son `tipo: 'cliente'` y `visible` (captura, logo blanco en la franja y card). Originales en `scripts/fuentes/` (`deca-captura.png`, `diputados-captura.png`, logos y `deca-emblema.png`, que es el favicon de Deca y no se usa en el sitio). TODO(santi): la captura de Diputados incluye las fotos de la portada (una de ellas con una persona identificable): si no querés mostrarlas, pasame una captura recortada o la pixelo. TODO(santi): la card de Deca no enlaza al demo, porque tiene datos de ejemplo.
- Tábano y Florencia tienen captura (`tabano-captura.webp`, `flor-captura.webp`, 1600×1000) y aparecen primero en el carrusel.
- Los PNG originales de los logos de Tábano y Florencia están en `scripts/fuentes/` (fuera de `public/`). En el sitio se usa `tabano-logo-blanco.webp` (franja "Confían en SCdev"); `flor-logo-blanco.webp` y `flor-logo-oscuro.webp` están guardados en `public/images/` sin usar (Florencia es un demo y la franja es solo para `tipo === 'cliente'`). Las variantes de color y los emblemas de Tábano quedan como fuentes, sin publicar.
- TODO(santi): pedir los logos originales (PNG o SVG) a Tábano y a la Dra. Inveninato para reemplazar los recortes de pantalla que hay hoy.
- TODO(santi): cargar más pacientes de ejemplo en el sistema de Florencia (`https://demo-flor.vercel.app/pacientes`) y volver a capturarlo para `flor-captura.webp`. La card ya no enlaza al sistema ni lleva el cartel "Demo".
- Tábano: sitio verificado online. Descripción tal como la definiste (sin nombres de personas ni tarifa).

## Punto (Parte A)

Hechos de la sección 4 de `docs/punto/punto-asistente-web.md` que **no** van al prompt de Punto hasta que se confirmen. Mientras tanto Punto dice "las condiciones de pago y de hosting las confirma el equipo" y manda a WhatsApp:

- TODO(santi): "el hosting va incluido en el valor del proyecto" (hoy el sitio dice que el dominio es costo aparte).
- TODO(santi): "se arranca con 50% de anticipo y el resto a la entrega" (ya figura en Cómo trabajamos y en el FAQ de pago, pero no estaba escrito en ningún texto previo del repo).
- TODO(santi): "los presupuestos tienen validez de 30 días".
- TODO(santi): "SCdev no gestiona redes sociales de clientes".
- Servicios que el documento lista y el sitio no muestra (no se incluyen en Punto): "Bot de WhatsApp $500.000" y "Diagnóstico digital $150.000".

### Modelos de `/api/punto` (verificados el 2026-11-04)

Viven en variables de entorno (`GROQ_MODEL`, `GEMINI_MODEL`, `CLOUDFLARE_MODEL`, más `<P>_REASONING_EFFORT` opcional; también en Netlify → Site settings → Environment variables). Orden de la cadena: Groq → Gemini → Cloudflare.

| Proveedor | Id | Cómo se verificó |
|---|---|---|
| Groq | `openai/gpt-oss-120b` con `GROQ_REASONING_EFFORT=low` | `GET /models` con la clave corregida + stream real por la función. `llama-3.3-70b-versatile` **no** figura en `/models` de la cuenta |
| Gemini | `gemini-3.5-flash-lite` con `GEMINI_REASONING_EFFORT=minimal` | `GET /v1beta/openai/models` + stream de prueba |
| Cloudflare | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Lista de modelos de la cuenta + stream de prueba (`/ai/v1/chat/completions`) |

- Groq en el plan gratis da 429 ante ráfagas (varias consultas seguidas); la cadena pasa a Gemini sola. Si en producción se ve mucho, mirar el límite de tokens por minuto de `gpt-oss-120b`.
- Los precios del prompt salen de la config en vivo (Apps Script, caché de 10 min por instancia, respaldo `src/data/configFallback.ts`). La variable del servidor es `APPS_SCRIPT_URL` (en `.env` estaba como `PPS_SCRIPT_URL`; renombrada). Cargarla también en Netlify (si falta, usa `VITE_APPS_SCRIPT_URL`).
- Límite diario (Blobs, store `punto-uso`): 30 por IP por día (`PUNTO_LIMITE_DIA` para cambiarlo), con hash de IP + sal `PUNTO_SALT`. Las claves de días anteriores no se borran solas (son hashes de pocos bytes); si molesta, limpiar el prefijo `AAAA-MM-DD/` desde la consola de Netlify.
- Los modelos de razonamiento funcionan, pero la función solo reenvía `delta.content`.
- TODO(santi): el prompt a veces pide nombre y número de teléfono ("¿Podés pasarme tu nombre y número para que el equipo te contacte?") aunque Punto no puede pasarle esos datos al equipo. Ver la propuesta de ajuste del prompt en el informe de A4.
- Revisar los ids en cada despliegue importante: los modelos cambian seguido.

### Protecciones contra abuso: verificar en el Deploy Preview

Probadas en local (`node scripts/probar-limites.mjs` y `netlify dev`), con dos cosas que solo se pueden confirmar en Netlify:

- TODO(santi): **ráfaga simultánea.** El emulador local de Blobs no respeta la atomicidad de las escrituras condicionales (pasaban entre 1 y 4 de 6 pedidos simultáneos). En el Deploy Preview: 6 `curl` en paralelo con `Origin` válido; debería pasar a lo sumo 1 por ventana de 3 s. Si pasan varios, los topes diarios (30 por IP, 600 global) siguen acotando el uso.
- TODO(santi): **Deploy Previews y origen.** Abrir el panel de Punto en el Deploy Preview y mandar un mensaje. Si da 403, definir `PUNTO_NETLIFY_SITE` (el `<sitio>` de `<sitio>.netlify.app`) en Netlify.
- Cargar en Netlify: `PUNTO_TOPE_DIARIO` (600), `PUNTO_LIMITE_DIA` (30) y, si se quiere apagar a Punto, `PUNTO_ACTIVO=false`.

## Perfil de Empresa de Google (`index.html`)

TODO(santi): URL del Perfil de Empresa ("SCdev|Desarrollo Web Profesional") para sumarla a `sameAs` del `LocalBusiness`.

## Condiciones y textos nuevos a confirmar

- "50% para arrancar y 50% al entregar" (Cómo trabajamos y preguntas frecuentes): no estaba escrito en ninguna FAQ del repo.
- "¿Trabajan con clientes de todo el país?": respuesta nueva, basada en lo que ya dice el sitio.

## Valor del Sheet

`price_esencial_min` en el Sheet publicado devuelve 80000 (el fallback también). Si ya se cambió a 90000, falta publicar una versión nueva del despliegue del Apps Script.

## Privacidad (`/privacidad`)

La página existe (prerenderizada, en sitemap con prioridad 0.3, link en el footer y en el panel de Punto). Las citas de Groq, Google y Cloudflare son textuales y se leyeron el 2026-11-04: releerlas cada tanto (están en `src/pages/PrivacidadPage.tsx`, constante `PROVEEDORES`).

- TODO(santi): plazo de conservación de los datos del formulario (hoy la página solo dice que se guardan en una planilla de Google Sheets y se usan para responder la consulta).
- TODO(santi): la web usa Google Tag Manager (`GTM-TW45W6NJ`). Si dispara analítica o cookies de Google, agregar una sección que diga cuáles; no lo escribí porque no sé qué hay configurado en el contenedor.
- TODO(santi): el texto de la Ley 25.326 es un resumen general (acceso, rectificación, actualización y supresión; órgano de control). Conviene que lo revise alguien con formación legal.
- Si la clave de Gemini pasa a plan pago, el texto de Google cambia ("Paid Services"): actualizar la cita.

## Mobile de mantenimiento y carrusel de Trabajos

- TODO(santi): probar el carrusel de Trabajos en un teléfono real. El emulador no genera inercia táctil, así que no se pudo medir si `scroll-snap` mandatory "frenaba" el deslizamiento (se pasó a `proximity` por la guía). Ver `docs/auditoria-carrusel.md`.
- TODO(santi): decidir si las flechas del carrusel (hoy desde 768 px) también deben verse en celular. Se dejaron ocultas porque el dedo alcanza y ahorran espacio.
- Estándar en celular: ahora muestra la etiqueta "Recomendado" y debajo una descripción propia (`descripcion` en `PLANES`, `src/data/mantenimiento.ts`), armada con los beneficios del plan. La tabla de escritorio sigue usando `para`. TODO(santi): confirmar o cambiar ese texto.
- El proyecto no tiene ESLint configurado (no existe un script `lint`). La verificación de código es `tsc` (dentro de `npm run build`) y los scripts de `scripts/probar-*.mjs`. Si se quiere lint, hay que decidir las reglas.

## Para cuando existan

- Botón flotante de WhatsApp: usar `track({ event: 'cta_whatsapp_click', location: 'flotante' })`.
