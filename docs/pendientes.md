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
