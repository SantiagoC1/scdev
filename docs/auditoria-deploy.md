# Auditoría de preparación para deploy

Rama `feat/mobile-mantenimiento` (commit `3a0b5bf`), PR #2. Auditoría del 2026-11-17, solo análisis: no se cambió código ni se hizo push. Se borraron `node_modules`, `dist` y `dist-ssr` y se reconstruyeron (esos tres están en `.gitignore`).

**Qué no pude comprobar:** el log de build de Netlify. Las tres checks de GitHub (Header rules, Pages changed, Redirect rules) y el Deploy Preview fallaron a los 36–37 s con "Deploy failed" y sin detalle. Esas tres checks fallan siempre que falla el build, así que no aportan causa. Los dos bloqueantes de abajo son los candidatos, pero **la causa exacta solo la confirma el log**: abrir el deploy `6af3da8157881ffb68c835e4` y pegar las últimas ~30 líneas.

**Entorno de la prueba:** Windows 11, Node v24.12.0, npm 11.6.2. No tuve Node 22 para repetir la prueba con la versión que probablemente use Netlify.

---

## BLOQUEANTE

### B1. El valor de `APPS_SCRIPT_URL` está dentro del JS publicado (secrets scanning de Netlify)

- **Qué pasa:** `APPS_SCRIPT_URL` y `VITE_APPS_SCRIPT_URL` tienen el mismo valor (comprobado comparando valores, sin imprimirlos). `VITE_APPS_SCRIPT_URL` se embebe en el bundle del cliente por diseño (`src/constants.ts:2`). Netlify escanea el build buscando los valores de las variables marcadas como secretas. Si `APPS_SCRIPT_URL` está marcada "contains secret value", encuentra el valor en el bundle y corta el deploy.
- **Evidencia:** el valor aparece en `dist/assets/index-zYLrZwHm.js` y en `dist-ssr/entry-server.js` (dist-ssr no se publica, pero está en el directorio de build). No aparece en ningún otro archivo de `dist/` ni en el repo versionado. Ninguna otra variable (claves de IA, `PUNTO_SALT`, token de Cloudflare) aparece en `dist/` ni en `dist-ssr/`.
- **Impacto:** si es la causa, el deploy falla siempre, en preview y en producción. El momento del fallo (~37 s) es compatible, pero no lo demuestra.
- **Arreglo:** en `netlify.toml`:
  ```toml
  [build.environment]
    SECRETS_SCAN_OMIT_KEYS = "APPS_SCRIPT_URL,VITE_APPS_SCRIPT_URL"
  ```
  Alternativa: destildar "secret" en esas dos variables en el panel de Netlify. La URL ya viaja al navegador, así que no gana nada siendo secreta. Opcional: borrar `APPS_SCRIPT_URL` de Netlify, porque `netlify/functions/punto/config.ts:17` usa `VITE_APPS_SCRIPT_URL` si falta.
- **Esfuerzo:** 5 min.
- **Cuidado:** los ids de modelo (`GROQ_MODEL`, `GEMINI_MODEL`, `CLOUDFLARE_MODEL`) aparecen en `CLAUDE.md` y en `docs/*.md`. Si alguna de esas variables también está marcada como secreta, el scan las encontraría en el repo. Solo las claves y tokens deberían estar marcados como secretos.

### B2. Node sin fijar: el proyecto necesita Node 22 y Netlify puede estar usando otro

- **Qué pasa:** `netlify.toml` no define `NODE_VERSION`, no hay `.nvmrc` ni `.node-version`, y `package.json` no tiene `engines`. El sitio `scdev-portfolio` es el proyecto viejo (hoy sirve el sitio anterior), así que puede tener un Node por defecto antiguo.
- **Evidencia (`package-lock.json`):**
  - `@netlify/blobs` 11.1.7 pide Node `>=22.12.0` y está en `dependencies`, así que lo usa la función.
  - `lighthouse` 13.6.0 pide `>=22.19`, pero es devDependency y no corre en el build.
  - `sharp` 0.35.4 pide `>=20.9`, `@tailwindcss/oxide` `>=20`, `playwright` `>=20`.
  - `scripts/prerender.mjs:20` usa `process.loadEnvFile` (Node ≥ 20.12) y `:11` `import.meta.dirname` (≥ 20.11).
- **Impacto:** con Node 18 o 20.x viejo, el build o la función pueden fallar. Es el candidato más probable junto con B1.
- **Arreglo:** en `netlify.toml`, `[build.environment]` con `NODE_VERSION = "22"`. Además `"engines": { "node": ">=22.12" }` en `package.json` y un `.nvmrc` con `22`.
- **Esfuerzo:** 5 min. Después probar el build local con Node 22 (`nvm use 22` o `npx -p node@22 npm run build`), porque yo solo probé con 24.12.

---

## IMPORTANTE

### I1. `/api/punto` frente a la regla `/* → /404.html 404`

- **Qué pasa:** `netlify.toml` tiene un único redirect `from="/*" to="/404.html" status=404`, sin `force`. La función declara `config = { path: '/api/punto' }` (`netlify/functions/punto.mts:7`) y el directorio está declarado (`[functions] directory`). No hay `_redirects` ni `_headers` en `public/`, así que no hay reglas duplicadas ni contradictorias. No pude comprobar en Netlify que la ruta de la función gane a esa regla.
- **Evidencia:** hoy `https://scdev.com.ar/api/punto` devuelve 200 con el sitio viejo (comprobado con curl). Sirve de referencia: esa respuesta es el fallback del sitio viejo, no la función.
- **Impacto:** si la regla gana, Punto devuelve 404 en producción.
- **Arreglo:** en el Deploy Preview, `curl -i -H "Origin: https://<preview>" https://<preview>/api/punto`. Debe responder JSON `{"activo":true}` y no el HTML de 404. Si no, agregar un `[[redirects]]` explícito `/api/punto → /.netlify/functions/punto` con status 200 antes de la regla `/*`.
- **Esfuerzo:** 10 min.

### I2. Definir `PUNTO_NETLIFY_SITE` en Netlify

- **Qué pasa:** el chequeo de origen (`netlify/functions/punto/origen.ts`) acepta `scdev.com.ar`, `www.scdev.com.ar`, `deploy-preview-N--<sitio>.netlify.app` y localhost solo con `NETLIFY_DEV=true`. Esa parte está bien. El `<sitio>` se deduce de `SITE_NAME` o de `DEPLOY_PRIME_URL`/`DEPLOY_URL`/`URL`, y no verifiqué que esas variables existan en tiempo de ejecución de la función. `docs/pendientes.md` ya lo marca como pendiente. Los Deploy Previews de Punto devolverían 403.
- **Arreglo:** cargar `PUNTO_NETLIFY_SITE=scdev-portfolio` (el nombre sale de la URL de los checks). No afecta a producción.
- **Esfuerzo:** 2 min.

### I3. Variables de entorno

Variables que usa el código (sin imprimir valores):

| Tipo | Variables |
|---|---|
| Build / cliente | `VITE_APPS_SCRIPT_URL` (también la lee `scripts/prerender.mjs`) |
| Función | `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_REASONING_EFFORT`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_REASONING_EFFORT`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_MODEL`, `PUNTO_SALT`, `PUNTO_TOPE_DIARIO`, `APPS_SCRIPT_URL` |
| Opcionales | `PUNTO_ACTIVO`, `PUNTO_LIMITE_DIA` (30), `PUNTO_INTERVALO_MS` (3000), `PUNTO_NETLIFY_SITE`, `PUNTO_ORIGENES_EXTRA`, `CLOUDFLARE_REASONING_EFFORT` |
| Las pone Netlify | `SITE_NAME`, `DEPLOY_PRIME_URL`, `DEPLOY_URL`, `URL`, `NETLIFY_DEV` |

- **Faltan frente a tu lista de Netlify:** ninguna obligatoria. Opcionales que no cargaste: `PUNTO_NETLIFY_SITE` (ver I2) y `PUNTO_LIMITE_DIA`.
- **Sobran:** ninguna. `APPS_SCRIPT_URL` es redundante, pero el código la admite (ver B1).
- **Sin valor por defecto:**
  - `VITE_APPS_SCRIPT_URL`: sin ella el formulario no tiene destino (`src/constants.ts:2`) y el prerender usa los precios de respaldo.
  - Cada clave y modelo de proveedor: sin uno de los dos, ese proveedor se saltea.
  - `PUNTO_SALT`: sin ella la función arranca, pero el hash de IP queda sin sal y escribe un `console.warn` (`limite.ts:105`).
- **`.env.example`:** está al día. Cubre todas las variables de la tabla y ningún secreto lleva prefijo `VITE_`. Lo único con `VITE_` es la URL pública.
- **Producción:** las variables de Netlify tienen que existir también en el contexto Production, no solo en Deploy Previews. Confirmarlo en *Environment variables → Scopes*.
- **Esfuerzo:** 10 min.

### I4. Textos publicados que dependen de datos sin confirmar (de `docs/pendientes.md`)

Los TODO del código son pocos. Está el de `index.html:66` (`sameAs` del Perfil de Empresa) y el resto son los de `docs/pendientes.md`. Los que conviene resolver antes de salir:

- **Afirmaciones publicadas que son tuyas:** el 50% de anticipo ("Cómo trabajamos" y FAQ de pago) y "¿Trabajan con clientes de todo el país?". Si no son ciertas, corregirlas antes de que las vea Google.
- **Valor del Sheet:** `price_esencial_min` devuelve 80000. Si ya lo cambiaste a 90000, falta publicar una versión nueva del Apps Script. El build lee el Sheet, así que los precios prerenderizados salen de ahí.
- **`/privacidad` (texto legal):** falta el plazo de conservación de los datos del formulario. Falta aclarar qué dispara Google Tag Manager (`GTM-TW45W6NJ`), porque si hay analítica o cookies la política debería decirlo. El resumen de la Ley 25.326 conviene que lo revise alguien con formación legal.
- **Logos de clientes:** `tabano-logo-blanco` y `flor-logo-*` son recortes de pantalla. Conviene pedirle los originales a cada cliente.
- **Esfuerzo:** depende de vos. Unos 30 min para decidir y editar los textos.

### I5. La URL del Apps Script quedó en el historial de un repo público

- **Qué pasa:** `gh repo view` dice que `SantiagoC1/scdev` es **PUBLIC**. El último commit (`3a0b5bf`) reemplazó las URLs de `CLAUDE.md` y de los reportes de Lighthouse por un placeholder, pero `git log -S` encuentra la URL en 5 commits anteriores (por ejemplo `c0bbab5`, `9faee19`). `git grep` sobre HEAD ya no la encuentra.
- **Impacto:** cualquiera puede llamar al endpoint (leer la config o escribir en el Sheet) con la URL del historial. El endpoint ya es público por diseño en el sitio, así que el riesgo es spam al formulario.
- **Arreglo:** crear una implementación nueva del Apps Script (nueva URL), actualizar `VITE_APPS_SCRIPT_URL` y `APPS_SCRIPT_URL` en Netlify y en `.env`, y dejar de usar la anterior. Reescribir el historial no sirve en un repo público.
- **Esfuerzo:** 15 min. Opcional: es una decisión tuya.

### I6. Imágenes sin usar en `public/`

- **Qué pasa:** `LogoChicoFB.png` (1,2 MB), `LogoCompletoFB.png` (1,7 MB) y `LogoCompletoHorizontalFB.png` (1,4 MB) están en `public/images/`, se copian a `dist/` y no se referencian desde `src/`, `index.html`, `scripts/` ni `llms.txt`. Son 4,3 MB servidos y sin uso.
- **Arreglo:** `git rm public/images/LogoChicoFB.png public/images/LogoCompletoFB.png public/images/LogoCompletoHorizontalFB.png`. Si los querés conservar, moverlos a `scripts/fuentes/`.
- **Esfuerzo:** 2 min.

### I7. `.gitignore` no cubre los reportes crudos de Lighthouse

- **Evidencia:** `docs/lighthouse/` tiene 36 MB con 64 JSON versionados. `docs/capturas` pesa 22 MB, `scripts/fuentes` 25 MB (tres PNG de 5–7 MB) y `.git` 93 MB. `.env`, `dist`, `dist-ssr` y `.netlify` sí están ignorados y `.env` no está versionado.
- **Impacto:** no afecta al build, pero engorda cada clon. Los más pesados de git, en orden: `EzequielWeber.png` 7,6 MB, `AgustinMazzoni.png` 6,1 MB, `SantaigoCaceres.png` 5,2 MB (todos en `scripts/fuentes/`), `UnidosConstruimos.png` 2,6 MB, `arrastre-escritorio-1440.webm` 2,2 MB y los tres `*FB.png` de I6.
- **Arreglo:** agregar `docs/lighthouse/` a `.gitignore` y `git rm -r --cached docs/lighthouse`. El historial no se achica sin reescribirlo.
- **Esfuerzo:** 5 min.

---

## PUEDE ESPERAR

### P1. Redirects desde el sitio viejo

- **Evidencia:** el sitemap viejo tiene 7 URLs y las 7 existen en el nuevo (`/`, `/nosotros` y los 5 `/servicios/*`). El nuevo agrega `/privacidad`. No se pierde ninguna ruta indexada.
- **Diferencia:** el sitio viejo responde 200 a cualquier ruta (soft 404), y el nuevo responde 404 real. `/servicios`, `/contacto`, `/index.html` y `/nosotros.html` darán 404.
- **Qué verificar:** en Search Console → Páginas, si alguna de esas URLs figura indexada. Si es así, agregar `[[redirects]]` 301 (`/index.html → /`, `/servicios → /#servicios`, `/contacto → /#contacto`).
- **Esfuerzo:** 10 min.

### P2. `npm audit`

- **Producción:** 0 altas o críticas. 2 moderadas, ambas de `react-router` 6.x (open redirect con backslash en `<Link>`/`useNavigate` y `deserializeErrors()` en hidratación SSR). El arreglo es `react-router-dom@7`, que es un salto de mayor.
- **Todo el árbol:** 16 vulnerabilidades (9 altas), en dependencias de desarrollo (cadena de Lighthouse y herramientas). No se publican.
- **Dependencias sin uso:** ninguna. Las de `devDependencies` las usan los scripts (`sharp`, `playwright`, `@axe-core/playwright`, `lighthouse`, `chrome-launcher`).
- **Esfuerzo:** 2 h por el salto a v7.

### P3. Detalles menores

- No hay `console.log` de depuración en el sitio publicado: el de `src/hooks/useSheetConfig.ts:59` está bajo `import.meta.env.DEV` y el de `netlify/functions/punto.mts:199` solo registra el nombre del proveedor.
- No quedan `localhost` ni URLs de preview en `dist/`.
- El campo de teléfono tiene un placeholder (`+54 9 221 XXX-XXXX`), que es un ejemplo y no un dato pendiente.
- No hay `manifest.webmanifest`. No es obligatorio.
- Falta `sameAs` del Perfil de Empresa en el JSON-LD (TODO de `index.html:66`).
- Mantener `GTM_DIFERIDO = false` hasta decidir lo de la privacidad.

---

## Lo que está bien (con evidencia)

- **Build limpio:** `npm ci` y `CI=true npm run build` terminaron con código 0: `tsc`, `vite build`, bundle SSR y prerender. `package-lock.json` está sincronizado, porque `npm ci` no se quejó.
- **Windows → Linux:** 0 imports relativos cuya mayúscula no coincida con el archivo real (revisé 372 archivos) y ningún par de archivos que difiera solo en mayúsculas. No hay `taskkill`, rutas absolutas ni backslash en los scripts de build. Los scripts `.mjs` no llevan shebang. El árbol de trabajo está en CRLF, pero el índice de git está en LF, que es lo que clona Netlify.
- **Función:** `@netlify/blobs` está en `dependencies`. Las importaciones desde `src/data/*.ts` son archivos que existen en el repo. Cuando falla la lectura del Sheet, la función usa los precios de respaldo.
- **SEO en `dist/`:**
  - `/`, `/nosotros`, `/privacidad` y los 5 `/servicios/*` tienen HTML prerenderizado con un solo `<title>`, `description`, `canonical` y `og:url` con `https://scdev.com.ar`, un `<h1>`, `og:image` (`og-scdev.jpg`, 41 KB) y JSON-LD que parsea.
  - Todas son `index, follow`. Solo `404.html` tiene `noindex`, como corresponde.
  - `sitemap.xml` lista las 8 URLs con dominio de producción y `robots.txt` apunta a él. `llms.txt` existe.
- **Headers:** no hay Content-Security-Policy, así que nada bloquea GTM, GA4, Apps Script, las fuentes ni la función. Solo hay X-Frame-Options, nosniff, Referrer-Policy y Permissions-Policy, y cache inmutable para `/images/*` y `/assets/*`.
- **Dominio:** hoy `http://scdev.com.ar` y `https://www.scdev.com.ar` ya redirigen con 301 a `https://scdev.com.ar/`, y HSTS está activo. Eso es configuración del dominio en Netlify, no del repo, y se mantiene si el dominio sigue en el mismo sitio.
- **Peso:** `dist/` pesa 6,7 MB. El chunk mayor es `index-*.js` con 359 KB (117 KB gzip) y el CSS 60 KB.

---

## Qué hacer en Netlify o en el DNS (no está en el repo)

1. Mantener el dominio `scdev.com.ar` y `www` en el sitio `scdev-portfolio`, que ya tiene certificado. Si este PR se mergea a `main` en ese mismo sitio, el dominio y el SSL no cambian.
2. Cargar las variables en el contexto **Production** (ver I3) y hacer un deploy nuevo después de cambiarlas.
3. Confirmar que GTM `GTM-TW45W6NJ` (`index.html`, `src/gtm.config.ts`) es el contenedor correcto y que GA4 está dentro de él. En el repo no hay ningún `G-` de GA4 suelto.
4. Después de salir: reenviar `sitemap.xml` en Search Console y pedir inspección de la home.
5. **Plan de vuelta atrás:** Netlify → *Deploys* → elegir el último deploy bueno del sitio viejo → *Publish deploy*. Es inmediato y no revierte el repo. Antes de mergear, conviene anotar cuál es ese deploy.

---

## Orden recomendado

1. B1 y B2 (10 min), y mirar el log para confirmar cuál de los dos era.
2. I1 y I2 en el Deploy Preview, con `curl` y probando Punto desde el panel.
3. I3 a I7 antes del merge a `main`.
4. P1 después, según lo que muestre Search Console.

## Veredicto

**No listo.** Con B1 y B2 resueltos (10 min) y verificado `/api/punto` en el Deploy Preview, queda "listo con estos ajustes": el resto son textos por confirmar (I4) y limpieza.
