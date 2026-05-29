# CLAUDE-fixes.md — Correcciones scdev.com.ar

Ejecutar estas 3 tareas en orden. Leer `index.html`, `style.css` y `script.js` completos antes de tocar cualquier archivo.

---

## TAREA 1 — Diagnosticar y reparar Google Sheets / CSV config

### Contexto
El sitio consume una Google Sheet publicada como CSV para configurar dinámicamente: precios, links de redes sociales, WhatsApp, etc. La lógica JS está intacta en `script.js` (líneas 13-102). El problema es que el fetch puede estar fallando silenciosamente.

### Paso 1 — Verificar si la URL del Sheet sigue activa
Abrir en el navegador esta URL y ver si devuelve CSV o da error:
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vSe21mBG9BnOIEktHHV47_nyirWIiJXTfTqpZ2bDqSHV9hKU5vXlNFKXAvEU7bnlwZgfnB7xtvXhMRE/pub?gid=0&single=true&output=csv
```

### Paso 2 — Agregar logging de diagnóstico temporal
En `script.js`, en el bloque `(async () => {` (línea 95), mejorar el catch para ver el error real en consola:

```js
(async () => {
  try {
    console.log("[SCdev] Cargando config desde Google Sheets...");
    const cfg = await loadConfigFromSheet();
    console.log("[SCdev] Config cargada:", cfg);
    applyConfig(cfg);
    console.log("[SCdev] Config aplicada correctamente.");
  } catch (err) {
    console.error("[SCdev] Error cargando config:", err.message, err);
    // fallback: la web funciona con valores hardcodeados
  }
})();
```

### Paso 3 — Agregar timeout al fetch para evitar cuelgues
Reemplazar la función `loadConfigFromSheet` con versión robusta con timeout:

```js
async function loadConfigFromSheet() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
  
  try {
    const res = await fetch(SHEET_CSV_URL, { 
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}: No se pudo cargar config del Sheet`);
    const csvText = await res.text();
    return parseSimpleKeyValueCSV(csvText);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
```

### Paso 4 — Agregar valores fallback hardcodeados
Después del catch del IIFE, si la config falla, aplicar valores por defecto para que el sitio no quede con campos vacíos. Agregar antes del cierre del catch:

```js
} catch (err) {
  console.error("[SCdev] Config dinámica no disponible:", err.message);
  
  // Fallback: aplicar valores por defecto si el Sheet no responde
  const fallbackCfg = {
    // Completar con los valores reales del Sheet de Santiago
    // Ejemplos típicos según el patrón data-bind del HTML:
    whatsapp_number: "COMPLETAR_CON_NUMERO_REAL",
    github_url: "https://github.com/SantiagoC1",
    linkedin_url: "COMPLETAR_SI_EXISTE",
  };
  // Solo aplicar fallback para data-bind-href (links críticos)
  document.querySelectorAll("[data-bind-href]").forEach(el => {
    const key = el.getAttribute("data-bind-href");
    if (fallbackCfg[key]) el.setAttribute("href", fallbackCfg[key]);
  });
}
```

> ⚠️ IMPORTANTE: Para completar el fallback correctamente, abrir la Google Sheet real y ver qué keys/valores tiene. Las keys son los nombres de la columna "key" del CSV.

### Paso 5 — Verificar data-bind en el HTML
Buscar todos los elementos con `data-bind` y `data-bind-href` en `index.html` y listarlos. Confirmar que las keys del Sheet coinciden con los atributos del HTML. Si hay discrepancia de nombres, corregirla.

---

## TAREA 2 — Rediseñar el modal de proyectos

### Contexto
El modal de proyectos existe (`#projectModal`) y funciona con `openProjectModal(this)`. El problema es visual: se ve básico. Hay que hacerlo más premium y profesional.

### Estructura actual del modal (no cambiar IDs ni lógica JS):
```html
<div id="projectModal" class="modal-overlay">
  <div class="modal-content project-modal-content">
    <button class="modal-close" onclick="closeProjectModal()">×</button>
    <div class="modal-img-container">
      <img id="modal-img" src="" alt="Proyecto Cover">
    </div>
    <div class="modal-body">
      <h2 id="modal-title">...</h2>
      <p id="modal-result" class="modal-result">...</p>
      <div id="modal-tags" class="project-tags">...</div>
      <p id="modal-desc">...</p>
      <div class="modal-buttons">
        <a id="modal-demo-btn">Ver Sitio Web</a>
        <a id="modal-repo-btn">Ver Código</a>
      </div>
    </div>
  </div>
</div>
```

### Cambios CSS a aplicar en `style.css`:

```css
/* ── MODAL OVERLAY ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  padding: 20px;
}

.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* ── MODAL CONTENT ── */
.project-modal-content {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  max-width: 680px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(211, 47, 47, 0.1);
  animation: modalSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  scrollbar-width: thin;
  scrollbar-color: #D32F2F #1a1a1a;
}

@keyframes modalSlideIn {
  from { 
    opacity: 0; 
    transform: translateY(30px) scale(0.96); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

/* ── IMAGEN DEL MODAL ── */
.modal-img-container {
  width: 100%;
  height: 260px;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  position: relative;
}

.modal-img-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, transparent, #1a1a1a);
}

.modal-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  transition: transform 0.4s ease;
}

/* ── MODAL BODY ── */
.modal-body {
  padding: 28px 32px 32px;
}

/* ── TÍTULO ── */
.project-modal-content #modal-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #fff;
  line-height: 1.2;
}

/* ── RESULTADO/BADGE ── */
.modal-result {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(211, 47, 47, 0.12);
  border: 1px solid rgba(211, 47, 47, 0.3);
  color: #ef5350;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.modal-result::before {
  content: '✦';
  font-size: 0.7rem;
}

/* ── TAGS DE TECNOLOGÍAS ── */
.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.project-tags span {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ccc;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.project-tags span:hover {
  border-color: rgba(211, 47, 47, 0.4);
  color: #ef5350;
  background: rgba(211, 47, 47, 0.08);
}

/* ── DESCRIPCIÓN ── */
#modal-desc {
  color: #9e9e9e;
  font-size: 0.93rem;
  line-height: 1.7;
  margin-bottom: 28px;
}

/* ── BOTONES DEL MODAL ── */
.modal-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.modal-buttons .btn {
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.25s ease;
  text-decoration: none;
}

.modal-buttons .btn-primary {
  background: #D32F2F;
  color: #fff;
  border: none;
  box-shadow: 0 4px 20px rgba(211, 47, 47, 0.35);
}

.modal-buttons .btn-primary:hover {
  background: #b71c1c;
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(211, 47, 47, 0.5);
}

.modal-buttons .btn-outline {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.modal-buttons .btn-outline:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

/* ── BOTÓN CERRAR ── */
.project-modal-content .modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.project-modal-content .modal-close:hover {
  background: rgba(211, 47, 47, 0.3);
  border-color: rgba(211, 47, 47, 0.5);
  transform: rotate(90deg);
}

/* ── MOBILE ── */
@media (max-width: 480px) {
  .project-modal-content {
    border-radius: 12px;
    max-height: 95vh;
  }
  .modal-img-container {
    height: 200px;
  }
  .modal-body {
    padding: 20px;
  }
  .project-modal-content #modal-title {
    font-size: 1.3rem;
  }
  .modal-buttons {
    flex-direction: column;
  }
  .modal-buttons .btn {
    flex: none;
    width: 100%;
  }
}
```

### Verificar la función openProjectModal en script.js
Buscar la función `openProjectModal` y confirmar que:
1. Agrega la clase `active` al overlay (o maneja `display: flex` — si usa display, migrar a clase `active`)
2. Setea `modal-img`, `modal-title`, `modal-result`, `modal-tags`, `modal-desc`
3. Para los tags: leer el atributo `data-tags` de la card y renderizar `<span>` por cada tag

Si `openProjectModal` usa `display: flex/block` en vez de clase `active`, cambiar a:
```js
document.getElementById('projectModal').classList.add('active');
// y para cerrar:
document.getElementById('projectModal').classList.remove('active');
```

---

## TAREA 3 — Hacer el sitio responsive / mobile-first

### Diagnóstico previo
Antes de cambiar CSS, abrir DevTools (F12) → modo mobile (375px) y documentar qué se rompe. Los problemas más comunes en este tipo de sitios son:

1. Navbar: el menú hamburguesa puede no funcionar o solaparse
2. Hero section: texto demasiado grande, partículas pesadas en mobile
3. Grid de proyectos: cards muy anchas o muy angostas
4. Sección de servicios/precios: columnas que no colapsan bien
5. Formulario de contacto: inputs que se salen del viewport

### Breakpoints a revisar y corregir en `style.css`

#### A) Navbar mobile
```css
@media (max-width: 768px) {
  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 75vw;
    max-width: 300px;
    height: 100vh;
    background: #121212;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    border-left: 1px solid rgba(255,255,255,0.06);
    z-index: 999;
  }
  
  .nav-links.open {
    right: 0;
  }
  
  .hamburger {
    display: flex;
    z-index: 1000;
  }
  
  /* Overlay oscuro detrás del menú */
  .nav-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 998;
  }
  
  .nav-overlay.active {
    display: block;
  }
}
```

> Verificar que en `script.js` el hamburger toggle agrega la clase `.open` al `.nav-links`. Si usa otro mecanismo, adaptarlo.

#### B) Hero section
```css
@media (max-width: 768px) {
  .hero {
    min-height: 100svh; /* usar svh en mobile para evitar el problema del address bar */
    padding: 80px 20px 40px;
    text-align: center;
  }
  
  .hero h1 {
    font-size: clamp(2rem, 8vw, 3rem);
  }
  
  .hero p, .hero .subtitle {
    font-size: 1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .hero-buttons .btn {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }
}
```

#### C) Grid de proyectos
```css
@media (max-width: 900px) {
  .projects-grid, .portfolio-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 560px) {
  .projects-grid, .portfolio-grid {
    grid-template-columns: 1fr;
  }
}
```

#### D) Sección de servicios/precios
```css
@media (max-width: 768px) {
  .services-grid, .pricing-grid, .plans-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  /* Destacar el plan del medio en mobile */
  .plan-card.featured, .service-card.featured {
    order: -1; /* Mostrar primero en mobile */
  }
}
```

#### E) Sección About/Skills
```css
@media (max-width: 768px) {
  .about-content, .about-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 400px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
}
```

#### F) Formulario de contacto
```css
@media (max-width: 768px) {
  .contact-form {
    padding: 0;
  }
  
  .form-group input,
  .form-group textarea,
  .modal-form input,
  .modal-form textarea {
    font-size: 16px; /* Evita zoom automático en iOS */
  }
}
```

#### G) Footer
```css
@media (max-width: 768px) {
  footer .footer-content, footer .footer-grid {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .social-links, .footer-links {
    justify-content: center;
  }
}
```

#### H) Tipografía global responsive
```css
@media (max-width: 768px) {
  .section-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  
  section {
    padding: 60px 20px;
  }
}

@media (max-width: 480px) {
  section {
    padding: 48px 16px;
  }
}
```

### Performance en mobile
En `script.js`, buscar la inicialización de Particles.js y reducir la cantidad de partículas en mobile:

```js
// Detectar mobile y ajustar config de partículas
const isMobile = window.innerWidth <= 768;

// En la config de particlesJS, cambiar number.value:
// Desktop: 80 (o el valor actual)
// Mobile: 30
```

Si la config de partículas es un objeto JS, envolver la propiedad `number.value` así:
```js
number: {
  value: isMobile ? 30 : 80,
  // ... resto de config
}
```

---

## Notas finales para Claude Code

- **Orden estricto**: Tarea 1 → Tarea 2 → Tarea 3
- **No tocar** la lógica del formulario de contacto (Formsubmit) — funciona bien
- **No tocar** las animaciones de scroll reveal ni las partículas (salvo la optimización mobile de partículas)
- **Después de cada tarea**, verificar que el sitio abre sin errores en consola
- **Commit por tarea**: `fix: google sheets config robustness`, `feat: rediseño modal proyectos`, `fix: responsive mobile`
- La clase que activa el modal puede ser `active`, `open`, o `show` — leer el JS existente antes de asumir
