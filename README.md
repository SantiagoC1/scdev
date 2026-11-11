# SCdev, sitio de la agencia

Sitio de SCdev (agencia de desarrollo web de La Plata): https://scdev.com.ar

**Stack:** React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion y React Router. Deploy en Netlify desde `main`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (sin prerender). |
| `npm run build` | `tsc`, build del cliente, build SSR y prerender. Genera `dist/`. |
| `node scripts/servir.mjs` | Sirve `dist/` como lo hace Netlify (carpeta con `index.html`, 404 real). `vite preview` no sirve para probar el prerender: siempre devuelve la home. |
| `node scripts/medir.mjs <carpeta>` | Lighthouse (móvil y escritorio) sobre `localhost:4173`. Variables: `MEDIR_RUTAS`, `MEDIR_MODOS`, `MEDIR_REPS`. |
| `node scripts/axe.mjs` | axe sobre las rutas principales. |

## Cómo se arma el HTML

`npm run build` renderiza cada ruta en el servidor (`react-dom/static`, sin navegador) y guarda un HTML completo por página:
`/`, `/nosotros` y las cinco `/servicios/*`. La lista sale de `src/App.tsx` (`PAGINAS`): si se agrega una página ahí, entra sola al prerender, al sitemap y a la verificación del build.

- `dist/404.html`: página de error real, con `noindex`. `netlify.toml` la sirve con estado 404 para cualquier ruta desconocida.
- `dist/sitemap.xml`: se genera en cada build con la fecha del build en `lastmod`.
- En el navegador, React hidrata ese HTML (`src/main.tsx`).

## Precios: salen del Google Sheet

Los precios viven en el Sheet que publica el Apps Script (`VITE_APPS_SCRIPT_URL`). Se leen en dos momentos:

1. **En el build**: el prerender pide la config con un timeout de 8 s y genera el HTML y el JSON-LD (`Offer`) con esos valores. Si el Sheet no responde, usa `CONFIG_FALLBACK` (`src/hooks/useSheetConfig.ts`) y deja una advertencia en el log. La config queda embebida en el HTML (`window.__SCDEV_CONFIG__`) para que el navegador hidrate con los mismos números.
2. **En el navegador**: al cargar, la página vuelve a pedir la config y actualiza lo que haya cambiado.

Un buscador o un crawler ve el HTML del último build, así que **cuando cambian los precios hay que disparar un rebuild** para que el HTML y el JSON-LD queden al día.

### Variable de entorno

En Netlify: *Site configuration → Environment variables → `VITE_APPS_SCRIPT_URL`* (la misma URL que está en `.env`). Sin ella, el build usa el fallback.

### Rebuild automático con un build hook

1. En Netlify: *Site configuration → Build & deploy → Build hooks → Add build hook* (rama `main`). Copiar la URL (`https://api.netlify.com/build_hooks/...`).
2. En el Apps Script del Sheet, crear la función y un **activador instalable** (*Activadores → Añadir → `avisarNetlify` → De hoja de cálculo → Al editar*). Un `onEdit` simple no puede llamar a servicios externos, tiene que ser instalable.

```js
function avisarNetlify() {
  UrlFetchApp.fetch('https://api.netlify.com/build_hooks/TU_ID', { method: 'post' });
}
```

3. También se puede disparar a mano: `curl -X POST -d '{}' https://api.netlify.com/build_hooks/TU_ID`.

El build tarda un par de minutos; si se editan muchas celdas seguidas conviene editar todo y disparar una sola vez.

## Google Tag Manager

`src/gtm.config.ts` tiene `GTM_DIFERIDO`. En `false` (por defecto) el snippet inline de `index.html` carga GTM como siempre. En `true` el snippet se saca del HTML y GTM se carga después del evento `load` y de `requestIdleCallback` (máximo 3 s). El resultado de medirlo está en `docs/auditoria-c6.md`.

## Eventos (dataLayer)

`form_submission`, `hero_selector` y `cta_whatsapp_click` con `location` (`hero`, `navbar`, `servicio`, `mantenimiento`, `cta_final`, `footer`, `nosotros`, `modal`). Helper: `src/utils/track.ts`.

## Documentación del rediseño

`docs/`: auditorías por etapa (`auditoria-c0.md` a `auditoria-c6.md`), capturas, JSON de Lighthouse y `pendientes.md` con lo que falta confirmar.

## Contacto

scdev.ok@gmail.com · https://www.instagram.com/scdev.ar/
