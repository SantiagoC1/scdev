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
- Tábano y Florencia ya tienen captura (`tabano-captura.webp`, `flor-captura.webp`, 1600×1000) y los dos aparecen primero en el carrusel. Siguen sin captura, y por eso sin imagen (la card muestra el nombre): `deca-sgi` y `diputados-bonaerenses`, ambos con `visible: false`. Cuando haya permiso, dejarlas en `docs/clientes-nuevos/`, pasarlas por `scripts/optimizar-imagenes.mjs` a WebP y poner la ruta en `imagen`.
- Los PNG originales de los logos de Tábano y Florencia están en `scripts/fuentes/` (fuera de `public/`). En el sitio se usa `tabano-logo-blanco.webp` (franja "Confían en SCdev"); `flor-logo-blanco.webp` y `flor-logo-oscuro.webp` están guardados en `public/images/` sin usar (Florencia es un demo y la franja es solo para `tipo === 'cliente'`). Las variantes de color y los emblemas de Tábano quedan como fuentes, sin publicar.
- TODO(santi): pedir los logos originales (PNG o SVG) a Tábano y a la Dra. Inveninato para reemplazar los recortes de pantalla que hay hoy.
- TODO(santi): cargar más pacientes de ejemplo en el demo de Florencia (`https://demo-flor.vercel.app/pacientes`) y volver a capturarlo para `flor-captura.webp`.
- Tábano: sitio verificado online. Descripción tal como la definiste (sin nombres de personas ni tarifa).
- Grafía de "Consultorio Dr. Padejimas": TODO(santi) confirmar la grafía correcta (el archivo del logo se llama `DrPadegimas`). Hasta entonces queda como está.

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
