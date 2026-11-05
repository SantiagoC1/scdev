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

## Logo real de Consultorio Dr. Padejimas (`src/data/clientes.ts`)

`public/images/DrPadegimas.webp` es una textura azul sin transparencia, no un logo (se veía como un cuadro vacío). Se sacó del dato y la franja "Confían en SCdev" muestra el nombre en texto.

TODO(santi): pasar el logo real (idealmente con fondo transparente y legible sobre fondo oscuro), generar el WebP liviano y volver a poner `logo` y `logoSize` en la entrada `padejimas`.

## Trabajos (Parte B)

Datos en `src/data/portfolio.ts` (carrusel) y `src/data/clientes.ts` (franja "Confían en SCdev"). Los demos nunca cuentan como clientes: la franja solo toma `tipo === 'cliente'` y `visible !== false`.

- TODO(santi): pedir permiso a Juan Sequeira para mostrar SGI (`deca-sgi`, `visible: false`). Cuando se publique: nombre "SGI · Sistema de gestión integral", chip "Demo con datos de ejemplo", sin logo ni nombre de Deca salvo que lo autorices.
- TODO(santi): confirmar con Juan Manuel Negri que podemos mostrar Diputados Bonaerenses (`diputados-bonaerenses`, `visible: false` en los dos archivos). La captura tiene que ser recortada del encabezado y la grilla de titulares, sin la nota principal con fotos de rostros.
- Capturas que faltan (las cards muestran el nombre hasta que estén): `tabano`, `deca-sgi`, `florencia-inveninato`, `diputados-bonaerenses`. Dejarlas en `docs/clientes-nuevos/` (`tabano.png`, `deca.png`, `flor.png`, `diputados.png`), pasarlas por `scripts/optimizar-imagenes.mjs` a WebP y poner la ruta en `imagen`. Se pueden mostrar en 16:10 (la card recorta).
- Tábano: sitio verificado online. Descripción tal como la definiste (sin nombres de personas ni tarifa).
- Grafía de "Consultorio Dr. Padejimas": TODO(santi) confirmar la grafía correcta (el archivo del logo se llama `DrPadegimas`). Hasta entonces queda como está.

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

## Para cuando existan

- Botón flotante de WhatsApp: usar `track({ event: 'cta_whatsapp_click', location: 'flotante' })`.
