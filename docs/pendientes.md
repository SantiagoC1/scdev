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

Viven en variables de entorno (`GROQ_MODEL`, `GEMINI_MODEL`, `CLOUDFLARE_MODEL`; también en Netlify → Site settings → Environment variables). Orden de la cadena: Groq → Gemini → Cloudflare.

| Proveedor | Id | Cómo se verificó |
|---|---|---|
| Groq | `llama-3.3-70b-versatile` | Solo con la doc pública (modelo de producción): `GET /models` devolvió 401 con la clave del `.env` |
| Gemini | `gemini-3.5-flash-lite` | `GET /v1beta/openai/models` + stream de prueba OK |
| Cloudflare | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Lista de modelos de la cuenta + stream de prueba OK (`/ai/v1/chat/completions`) |

- TODO(santi): la `GROQ_API_KEY` del `.env` empieza con `sk_` y Groq responde "Invalid API Key" (las de Groq empiezan con `gsk_`). Generar una nueva en console.groq.com, cargarla en `.env` y en Netlify, y volver a verificar el id con `GET /models`. Mientras tanto la cadena responde por Gemini.
- Los modelos de razonamiento (p. ej. `openai/gpt-oss-*`) funcionan, pero la función solo reenvía `delta.content`.
- Revisar los ids en cada despliegue importante: los modelos de Gemini cambian seguido.

## Perfil de Empresa de Google (`index.html`)

TODO(santi): URL del Perfil de Empresa ("SCdev|Desarrollo Web Profesional") para sumarla a `sameAs` del `LocalBusiness`.

## Condiciones y textos nuevos a confirmar

- "50% para arrancar y 50% al entregar" (Cómo trabajamos y preguntas frecuentes): no estaba escrito en ninguna FAQ del repo.
- "¿Trabajan con clientes de todo el país?": respuesta nueva, basada en lo que ya dice el sitio.

## Valor del Sheet

`price_esencial_min` en el Sheet publicado devuelve 80000 (el fallback también). Si ya se cambió a 90000, falta publicar una versión nueva del despliegue del Apps Script.

## Para cuando existan

- `/privacidad`: sumarla al prerender (`src/entry-server.tsx`, `RUTAS`) y al sitemap (se genera solo desde `RUTAS`).
- Botón flotante de WhatsApp y panel de Punto: usar `track({ event: 'cta_whatsapp_click', location: 'flotante' | 'punto' })`.
