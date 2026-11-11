# feat: Punto (asistente con IA), clientes nuevos, SEO/prerender y mobile de Trabajos y mantenimiento

Rama `feat/mobile-mantenimiento` → `main`. Son ~100 commits; este resumen los agrupa por tema.

## Resumen por tema

### Punto, el asistente del sitio
- Widget (botón flotante + panel) que habla con `/api/punto` (`netlify/functions/punto.mts`). Las claves nunca llegan al navegador.
- Cadena de proveedores Groq → Gemini → Cloudflare, con stream normalizado, 5 s por proveedor hasta el primer fragmento y paso al siguiente ante HTTP, vacío, timeout o stream cortado. Cloudflare se pide sin streaming (su stream perdía los montos).
- Modelos, claves y `reasoning_effort` por variable de entorno: cambiar de modelo no requiere código.
- Conocimiento armado desde `src/data/servicios.ts` y los precios en vivo del Sheet (con respaldo). Precios y plazos no se escriben en el prompt. Los hechos sin confirmar no entran (ver pendientes).
- Prompt con reglas para emitir `[WHATSAPP]`, temas ajenos rechazados y sin pedir datos de contacto. Batería de 20 preguntas en `scripts/probar-punto.mjs`.
- Protecciones contra abuso: interruptor `PUNTO_ACTIVO`, tope global diario, tope por IP, intervalo mínimo de 3 s en el servidor y verificación de origen. La IP nunca se guarda (hash con sal, IPv6 por /64). Contadores en Netlify Blobs.
- Página `/privacidad` con las citas textuales de cada proveedor, enlazada desde el footer y el panel.
- Eventos de medición: `punto_open`, `punto_whatsapp`, `cta_whatsapp_click` (`location: 'punto'`).
- Responsive real: hoja desde abajo en celular, panel anclado desde 640 px, pantallas bajas, teclado en pantalla (visual viewport), foco atrapado, 16 px en el campo. Banco de 11 tamaños con zoom 200% y axe en `scripts/probar-punto-responsive.mjs`.

### Clientes y Trabajos
- Trabajos fusiona Clientes y Proyectos; franja "Confían en SCdev" (marquee CSS) solo con `tipo === 'cliente'` y `visible !== false`.
- Nuevos: Tábano, Florencia Inveninato (reemplaza a Padejimas), Unidos Construimos, Deca Electromecánica y Diputados Bonaerenses. Con captura, logo blanco en la franja y chips de tipo de proyecto. Diputados: SCdev hace el mantenimiento mensual y el soporte técnico de su portal (no lo desarrolló), y la captura lleva pixeladas las fotos de personas y de prensa. Tábano, Florencia, Deca y Diputados van primeros en el carrusel.

### Mobile
- **Carrusel de Trabajos**: scroll nativo en touch y teclado (`snap proximity`), arrastre con mouse por `rAF` con inercia nativa, hover barato (sin `transition-all` ni `scale` permanente), imágenes con `srcset` de 480 y 960 px. Diagnóstico con números antes y después en `docs/auditoria-carrusel.md`.
- **Mantenimiento mensual** (menos de 768 px): pestañas accesibles (patrón WAI-ARIA) y una tarjeta por plan, con los mismos datos que la tabla de escritorio. El Estándar muestra "Recomendado" como etiqueta y una descripción propia (`descripcion` en `src/data/mantenimiento.ts`; la tabla de escritorio no cambia).

### SEO, performance y accesibilidad (C0–C6)
- Prerender estático de home, `/nosotros`, `/servicios/*`, `/privacidad` y 404 real con `noindex`; sitemap generado en el build; `llms.txt`.
- Meta por ruta, JSON-LD Service/Offer, FAQPage y BreadcrumbList por servicio.
- Imágenes a WebP con width/height, OG image 1200×630, favicons, preload de fuentes, partículas diferidas, LazyMotion.
- Contrastes, foco visible, skip link, modal de contacto accesible, axe sin violaciones.
- Evento `cta_whatsapp_click` con `location` en todos los links a `wa.me`. GTM detrás de la constante `GTM_DIFERIDO` (apagada).

## Checklist para el Deploy Preview

**Punto en celular**
- [ ] Abrir el panel en un teléfono real (iPhone y Android): hoja de ancho completo, botón flotante oculto con el panel abierto, fondo bloqueado.
- [ ] Con el teclado abierto el panel se achica y sube; el campo no provoca zoom en iOS.
- [ ] En horizontal el panel ocupa el alto disponible y se puede escribir y enviar.
- [ ] Mandar un mensaje: si da **403**, definir `PUNTO_NETLIFY_SITE` (el `<sitio>` de `<sitio>.netlify.app`) y redeployar.
- [ ] Preguntar por un servicio y comprobar que aparece "Seguir por WhatsApp" con el servicio correcto.
- [ ] Los precios y plazos que dice Punto coinciden con el sitio.

**Ráfaga simultánea (6 `curl` en paralelo)**
- [ ] Lanzar 6 pedidos a `/api/punto` a la vez desde Git Bash, WSL o Mac/Linux. El Deploy Preview debería dejar pasar **a lo sumo 1 (200) por ventana de 3 s** y responder **429 `intervalo`** al resto. El emulador local no respeta la atomicidad de las escrituras condicionales de Blobs, por eso esto solo se confirma en Netlify.
  - Reemplazar `<URL-DEL-PREVIEW>` por la URL del Deploy Preview **con `https://` y sin barra final** (por ejemplo `https://deploy-preview-12--<sitio>.netlify.app`). Se usa también como `Origin`, que es lo que la función exige (acepta `scdev.com.ar`, `www.scdev.com.ar` y los Deploy Previews del sitio). Si da 403, definir `PUNTO_NETLIFY_SITE`.
  - El cuerpo es el formato real de la función: `{"mensajes":[{"role":"user","content":"..."}]}` (clave `mensajes`, con `role` `user` o `assistant`; el último mensaje tiene que ser del usuario).
  - Un solo bloque, para pegar tal cual:
  ```bash
  URL_PREVIEW="<URL-DEL-PREVIEW>"
  D=$(mktemp -d)
  for i in 1 2 3 4 5 6; do
    curl -s -m 30 -o "$D/$i.cuerpo" -w "%{http_code}\n" -X POST "$URL_PREVIEW/api/punto" \
      -H "Origin: $URL_PREVIEW" -H "Content-Type: application/json" \
      -d '{"mensajes":[{"role":"user","content":"hola"}]}' > "$D/$i.codigo" &
  done
  wait
  echo "--- códigos (cantidad  código) ---"
  cat "$D"/*.codigo | sort | uniq -c
  echo "pasaron (200): $(cat "$D"/*.codigo | grep -c '^200$')"
  echo "429: $(cat "$D"/*.codigo | grep -c '^429$')"
  echo "--- motivo de cada 429 ---"
  for i in 1 2 3 4 5 6; do [ "$(cat "$D/$i.codigo")" = "429" ] && cat "$D/$i.cuerpo" && echo; done | sort | uniq -c
  rm -rf "$D"
  ```
  - Resultado esperado: `pasaron (200): 1` (o 0), `429: 5` (o 6) y todos los motivos `{"error":"intervalo"}`. Si pasan 2 o más, anotar cuántas y avisar: el intervalo no es atómico en producción (los topes de 30 por IP y 600 globales siguen acotando el uso). Otros motivos: `limite` (tope de esa IP), `tope` (tope global del día). Cualquier otro código (`403` origen, `503` desactivado o `sin_servicio`) se ve en la lista de códigos.
  - Esperar unos 4 segundos entre una corrida y otra, y recordar que cada 200 cuenta contra el límite diario de esa IP.
- [ ] Un pedido con `Origin` ajeno devuelve 403 `origen`.
- [ ] Probar el interruptor: `PUNTO_ACTIVO=false` + deploy, el panel muestra solo el aviso y "Hablar con el equipo". Volver a dejarlo activo.

**PageSpeed / Lighthouse**
- [ ] PageSpeed de la home en móvil, **3 corridas** (usar la mediana) y una en escritorio. Referencia local (mediana de 5, móvil): rendimiento 74, LCP 1,4 s, CLS 0, TBT ~1,3 s; comparar con `docs/lighthouse/`.
- [ ] Revisar LCP, CLS y que Punto no entre en el bundle inicial (va en un chunk aparte).

**Rich Results**
- [ ] Rich Results Test en la home (LocalBusiness), en cada `/servicios/*` (Service/Offer, FAQPage, BreadcrumbList) y comprobar que no hay errores.
- [ ] `sitemap.xml` con 8 rutas y `robots.txt`; una ruta inexistente devuelve la 404 real.

**Carrusel en teléfono real (iPhone y Android)**
- [ ] Deslizar con el dedo en iPhone y Android: inercia natural, el snap no frena de más, sin trabas.
- [ ] Las cards cargan imagen a la medida (480/960) y no hay saltos de layout.
- [ ] Cards de Deca y Diputados: la de Diputados muestra las fotos pixeladas y se ve bien; comprobar con las dos cards incluidas que el arrastre sigue fluido.
- [ ] Decidir si las flechas deben verse también en celular (hoy desde 768 px).

**Mantenimiento mensual (teléfono real)**
- [ ] En 320–767 px: pestañas Básico / Estándar / Pro, el Estándar viene preseleccionado con la etiqueta "Recomendado" y su descripción, la altura no salta al cambiar.
- [ ] Desde 768 px sigue la tabla.

## Variables de entorno a cargar en Netlify

*Site configuration → Environment variables.* Después hace falta **un deploy nuevo** para que las funciones las vean. Las `VITE_*` se embeben en el build.

| Variable | Obligatoria | Nota |
|---|---|---|
| `VITE_APPS_SCRIPT_URL` | Sí | URL pública del Apps Script (formulario y precios en vivo). |
| `APPS_SCRIPT_URL` | Sí | Mismo valor; la función de Punto lee los precios con esta. |
| `GROQ_API_KEY` | Sí | Primer proveedor de la cadena. |
| `GEMINI_API_KEY` | Sí | Segundo proveedor. |
| `CLOUDFLARE_ACCOUNT_ID` | Sí | Tercer proveedor. |
| `CLOUDFLARE_API_TOKEN` | Sí | Tercer proveedor. |
| `GROQ_MODEL` | Sí | `openai/gpt-oss-120b` |
| `GEMINI_MODEL` | Sí | `gemini-3.5-flash-lite` |
| `CLOUDFLARE_MODEL` | Sí | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| `GROQ_REASONING_EFFORT` | Sí | `low` |
| `GEMINI_REASONING_EFFORT` | Sí | `minimal` |
| `PUNTO_SALT` | Sí | Texto largo y secreto para el hash de la IP. Cambiarla reinicia los contadores. |
| `PUNTO_TOPE_DIARIO` | Recomendada | `600` (por defecto). |
| `PUNTO_LIMITE_DIA` | Opcional | `30` por IP (por defecto). |
| `PUNTO_ACTIVO` | Opcional | Solo `false` apaga a Punto. |
| `PUNTO_NETLIFY_SITE` | Solo si el Deploy Preview da 403 | El `<sitio>` de `<sitio>.netlify.app`. |
| `PUNTO_ORIGENES_EXTRA` | Opcional | Orígenes extra completos, separados por coma. |
| `PUNTO_INTERVALO_MS` | Opcional | `3000` por defecto. |

Sin clave o sin modelo, un proveedor se saltea. Los ids de modelo se verificaron el 2026-11-04 (ver `docs/pendientes.md`).

## Pendientes abiertos (`docs/pendientes.md`)

**Clientes y Trabajos**
- La card de Deca no enlaza al demo (datos de ejemplo).
- Pedir los logos originales (PNG/SVG) a Tábano y a la Dra. Inveninato.
- Cargar más pacientes de ejemplo en el sistema de Florencia y volver a capturar `flor-captura.webp`.

**Punto**
- Confirmar antes de que entren al conocimiento: hosting incluido, 50% de anticipo, validez de 30 días del presupuesto, "SCdev no gestiona redes sociales".
- Servicios que el documento lista y el sitio no muestra: "Bot de WhatsApp $500.000" y "Diagnóstico digital $150.000".
- El prompt a veces pide nombre y teléfono aunque Punto no puede pasar esos datos al equipo.
- Verificar en el Deploy Preview la ráfaga simultánea y el origen (checklist de arriba).

**Textos y datos**
- Confirmar los stacks por persona en `src/data/equipo.ts`.
- Confirmar "50% para arrancar y 50% al entregar" y la respuesta nueva de "¿Trabajan con clientes de todo el país?".
- `price_esencial_min` del Sheet devuelve 80000: si ya se cambió a 90000, publicar una versión nueva del despliegue del Apps Script.
- URL del Perfil de Empresa de Google para `sameAs` del `LocalBusiness`.

**Privacidad**
- Plazo de conservación de los datos del formulario.
- Qué dispara Google Tag Manager (`GTM-TW45W6NJ`) para documentarlo.
- Revisión legal del resumen de la Ley 25.326.
- Si Gemini pasa a plan pago, releer y actualizar la cita en `PrivacidadPage.tsx`.

**Mobile**
- Probar el carrusel en un teléfono real (inercia táctil).
- Decidir si las flechas del carrusel se ven en celular.
- Confirmar la descripción del Estándar en mantenimiento (celular).
- No hay ESLint configurado; la verificación es `tsc` (dentro de `npm run build`) y los scripts `scripts/probar-*.mjs`.

## Verificación hecha

- `npm run build` sin errores de TypeScript; 8 rutas válidas verificadas en el prerender.
- `scripts/probar-mantenimiento-mobile.mjs`: todo bien (pestañas, teclado, altura estable, evento de WhatsApp, axe, movimiento reducido, tabla desde 768 px).
- Punto: `scripts/probar-limites.mjs` y `scripts/probar-punto-responsive.mjs` en local; las 20 preguntas con `scripts/probar-punto.mjs`.
