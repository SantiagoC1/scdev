# CLAUDE-sheets-form.md — Formulario de contacto → Google Sheets + Email

## Contexto
El sitio scdev.com.ar tiene un formulario de contacto que actualmente usa Formsubmit.
El objetivo es reemplazarlo por un Google Apps Script Web App que:
1. Guarda cada lead en una hoja "leads" del Google Sheet existente
2. Envía un email de notificación a Santiago por cada nuevo contacto
3. Lee la config dinámica desde la hoja "config" (ya existente)

---

## PASO 1 — Código del Apps Script (NO tocar el repo todavía)

Este código va en el Apps Script vinculado al Google Sheet de Santiago.
Abrir: Extensions > Apps Script en el Sheet, reemplazar el `Código.gs` vacío con esto:

```javascript
// ============================================================
// SCdev — Web App: recibe leads del formulario de contacto
// ============================================================

const SHEET_NAME_LEADS  = "leads";   // nombre de la hoja donde se guardan contactos
const SHEET_NAME_CONFIG = "config";  // nombre de la hoja de configuración
const NOTIFY_EMAIL      = "santiagocaceres.dev@gmail.com"; // REEMPLAZAR con el email real de Santiago

// ── GET: permite fetch de config como JSON (alternativa al CSV) ──────────────
function doGet(e) {
  try {
    const ss     = SpreadsheetApp.getActiveSpreadsheet();
    const sheet  = ss.getSheetByName(SHEET_NAME_CONFIG);
    const data   = sheet.getDataRange().getValues();
    const config = {};

    // Saltar fila de header (fila 0: key, value)
    for (let i = 1; i < data.length; i++) {
      const key = String(data[i][0]).trim();
      const val = String(data[i][1]).trim();
      if (key) config[key] = val;
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, config }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── POST: recibe datos del formulario, guarda lead y notifica ─────────────────
function doPost(e) {
  try {
    // Parsear body (JSON o form-encoded)
    let data = {};
    if (e.postData && e.postData.type === "application/json") {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    const nombre  = sanitize(data.nombre  || data.name    || "");
    const email   = sanitize(data.email                   || "");
    const telefono= sanitize(data.telefono|| data.phone   || "");
    const servicio= sanitize(data.servicio|| data.service || "");
    const mensaje = sanitize(data.mensaje || data.message || "");

    // Validación mínima
    if (!nombre || !email) {
      return jsonResponse({ ok: false, error: "Nombre y email son requeridos" });
    }

    // Guardar en hoja "leads"
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let sheet   = ss.getSheetByName(SHEET_NAME_LEADS);

    // Crear hoja "leads" si no existe, con headers
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME_LEADS);
      sheet.appendRow(["Fecha", "Nombre", "Email", "Teléfono", "Servicio de interés", "Mensaje", "Origen"]);
      // Formatear header
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#D32F2F");
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    // Agregar fila con los datos del lead
    const timestamp = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
    sheet.appendRow([timestamp, nombre, email, telefono, servicio, mensaje, "scdev.com.ar"]);

    // Autoajustar columnas
    sheet.autoResizeColumns(1, 7);

    // Enviar email de notificación
    sendNotificationEmail(nombre, email, telefono, servicio, mensaje);

    return jsonResponse({ ok: true, message: "Mensaje recibido. ¡Te contactamos pronto!" });

  } catch (err) {
    console.error("doPost error:", err);
    return jsonResponse({ ok: false, error: "Error interno. Intentá de nuevo." });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sendNotificationEmail(nombre, email, telefono, servicio, mensaje) {
  const subject = `🔔 Nuevo lead SCdev — ${nombre}`;
  const body = `
Nuevo contacto desde scdev.com.ar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Nombre:    ${nombre}
📧 Email:     ${email}
📱 Teléfono:  ${telefono || "No proporcionado"}
🛠 Servicio:  ${servicio || "No especificado"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Mensaje:
${mensaje}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Respondé directamente a este email para contactar al lead.
Ver todos los leads: https://docs.google.com/spreadsheets/d/1RER1O8Ub5QKpizoOpdjd3XRvTJY1XZD2ArsCBGvK11o/edit
  `.trim();

  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
  <div style="background: #D32F2F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0;">🔔 Nuevo lead — SCdev</h2>
  </div>
  <div style="background: #f9f9f9; padding: 24px; border: 1px solid #eee; border-radius: 0 0 8px 8px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #666; width: 120px;">Nombre</td><td style="padding: 8px 0; font-weight: bold;">${nombre}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Teléfono</td><td style="padding: 8px 0;">${telefono || "No proporcionado"}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Servicio</td><td style="padding: 8px 0;">${servicio || "No especificado"}</td></tr>
    </table>
    <div style="margin-top: 16px; padding: 16px; background: white; border-left: 3px solid #D32F2F; border-radius: 4px;">
      <p style="margin: 0; color: #333;">${mensaje.replace(/\n/g, "<br>")}</p>
    </div>
    <div style="margin-top: 20px; text-align: center;">
      <a href="https://docs.google.com/spreadsheets/d/1RER1O8Ub5QKpizoOpdjd3XRvTJY1XZD2ArsCBGvK11o/edit" 
         style="background: #D32F2F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        Ver todos los leads →
      </a>
    </div>
  </div>
</div>
  `;

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: email,
    subject: subject,
    body: body,
    htmlBody: htmlBody
  });
}

function sanitize(str) {
  return String(str).trim().replace(/<[^>]*>/g, ""); // strip HTML tags
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Cómo desplegar el Apps Script como Web App:
1. Guardar el código (Ctrl+S)
2. Click en **"Implementar"** → **"Nueva implementación"**
3. Tipo: **"Aplicación web"**
4. Ejecutar como: **"Yo (tu cuenta Google)"**
5. Quién tiene acceso: **"Cualquier persona"**
6. Click **"Implementar"**
7. Copiar la **URL de la Web App** (formato: `https://script.google.com/macros/s/XXXXXXX/exec`)
8. Pegar esa URL en el `script.js` del sitio como `APPS_SCRIPT_URL`

> ⚠️ Cada vez que modifiques el código del Apps Script, debés crear una **nueva implementación** (no "Gestionar implementaciones existentes") para que los cambios tomen efecto.

---

## PASO 2 — Cambios en el repo (Claude Code hace esto)

### 2.1 — Actualizar `script.js`

#### A) Agregar la URL del Apps Script al inicio del archivo (junto a SHEET_CSV_URL):
```js
// URL del Apps Script Web App (para formulario de contacto)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwyKDvZD-ci0BEHoCcWeFG4NxkalKO8NEGGpAidSKQ_RSyev5IpQiz0v_QN0H4wtSBe/exec";
```

#### B) Actualizar `loadConfigFromSheet` para usar JSON en vez de CSV (más robusto):
Reemplazar la función existente con esta versión que intenta JSON primero y hace fallback a CSV:

```js
async function loadConfigFromSheet() {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 6000);

  try {
    // Intentar primero el endpoint JSON del Apps Script (más robusto)
    if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("PEGAR_URL")) {
      const res = await fetch(APPS_SCRIPT_URL, {
        cache: "no-store",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.config) {
          console.log("[SCdev] Config cargada via JSON (Apps Script)");
          return json.config;
        }
      }
    }
  } catch (e) {
    clearTimeout(timeoutId);
    console.warn("[SCdev] JSON fallback al CSV:", e.message);
  }

  // Fallback: CSV directo del Sheet publicado
  const controller2 = new AbortController();
  const timeoutId2  = setTimeout(() => controller2.abort(), 5000);
  try {
    const res = await fetch(SHEET_CSV_URL, {
      cache: "no-store",
      signal: controller2.signal
    });
    clearTimeout(timeoutId2);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    console.log("[SCdev] Config cargada via CSV");
    return parseSimpleKeyValueCSV(csvText);
  } catch (err) {
    clearTimeout(timeoutId2);
    throw err;
  }
}
```

#### C) Reemplazar el handler del formulario de contacto

Buscar en `script.js` el event listener del formulario (el que usa `fetch` a formsubmit.co, alrededor de línea 218).
Reemplazar **toda** la lógica de submit del formulario con esta:

```js
// ── FORMULARIO DE CONTACTO → Apps Script + Sheets ────────────────────────────
function initContactForm() {
  // Aplica a ambos formularios: el del modal y el de la sección contacto
  document.querySelectorAll('.contact-form, .modal-form').forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const submitBtn = this.querySelector('[type="submit"]');
      const originalHTML = submitBtn.innerHTML;

      // Estado: enviando
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      submitBtn.disabled  = true;

      // Recopilar datos del formulario
      const formData = new FormData(this);
      const payload  = Object.fromEntries(formData.entries());

      // Mapear nombres de campos al formato del Apps Script
      const body = {
        nombre:   payload.name    || payload.nombre   || "",
        email:    payload.email                       || "",
        telefono: payload.phone   || payload.telefono || "",
        servicio: payload.service || payload.servicio || "",
        mensaje:  payload.message || payload.mensaje  || "",
      };

      try {
        // Verificar que la URL está configurada
        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PEGAR_URL")) {
          throw new Error("URL del Apps Script no configurada");
        }

        const res = await fetch(APPS_SCRIPT_URL, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });

        const json = await res.json();

        if (json.ok) {
          // Éxito
          submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
          submitBtn.style.background = "#2e7d32";
          this.reset();

          // Mostrar SweetAlert si está disponible
          if (typeof Swal !== "undefined") {
            Swal.fire({
              icon:             "success",
              title:            "¡Mensaje enviado!",
              text:             "Te respondo a la brevedad 🚀",
              confirmButtonColor: "#D32F2F",
              background:       "#1a1a1a",
              color:            "#fff",
            });
          }

          // Si es el modal, cerrarlo después de 1.5s
          if (this.closest('#contactModal')) {
            setTimeout(() => closeModal(), 1500);
          }
        } else {
          throw new Error(json.error || "Error desconocido");
        }

      } catch (err) {
        console.error("[SCdev] Error enviando formulario:", err);

        submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error, reintentá';
        submitBtn.style.background = "#c62828";

        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon:             "error",
            title:            "Error al enviar",
            text:             "Intentá de nuevo o escribime directo por WhatsApp.",
            confirmButtonColor: "#D32F2F",
            background:       "#1a1a1a",
            color:            "#fff",
          });
        }
      } finally {
        // Restaurar botón después de 3 segundos
        setTimeout(() => {
          submitBtn.innerHTML  = originalHTML;
          submitBtn.disabled   = false;
          submitBtn.style.background = "";
        }, 3000);
      }
    });
  });
}
```

Al final del IIFE `(async () => { ... })()`, agregar la llamada:
```js
// Inicializar formulario después de cargar config
initContactForm();
```

### 2.2 — Mejorar el formulario en `index.html`

El formulario actual tiene solo: nombre, email, mensaje.
Agregar campos de **teléfono** y **servicio de interés** para capturar más info del lead.

Buscar el formulario de contacto principal (el que está en la sección `#contacto`, no el modal) y actualizar su estructura:

```html
<form class="contact-form" id="main-contact-form">
  <!-- Honeypot anti-spam (oculto) -->
  <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">

  <div class="form-row">
    <div class="form-group">
      <label for="contact-name">Nombre *</label>
      <input type="text" name="nombre" id="contact-name" required 
             placeholder="Tu nombre completo" autocomplete="name">
    </div>
    <div class="form-group">
      <label for="contact-email">Email *</label>
      <input type="email" name="email" id="contact-email" required 
             placeholder="tu@email.com" autocomplete="email">
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="contact-phone">Teléfono / WhatsApp</label>
      <input type="tel" name="telefono" id="contact-phone" 
             placeholder="+54 9 221 XXX-XXXX" autocomplete="tel">
    </div>
    <div class="form-group">
      <label for="contact-service">Servicio de interés</label>
      <select name="servicio" id="contact-service">
        <option value="">Seleccioná una opción...</option>
        <option value="Landing Page">Landing Page</option>
        <option value="Sitio Web Profesional">Sitio Web Profesional</option>
        <option value="Mantenimiento Web">Mantenimiento Web</option>
        <option value="Sistema a medida">Sistema a medida</option>
        <option value="Otro">Otro / Consulta general</option>
      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="contact-message">Mensaje *</label>
    <textarea name="mensaje" id="contact-message" rows="5" required 
              placeholder="Contame sobre tu proyecto..."></textarea>
  </div>

  <button type="submit" class="btn btn-primary btn-block">
    Enviar mensaje <i class="fas fa-paper-plane"></i>
  </button>
</form>
```

También actualizar el formulario del **modal de contacto** (`#contactModal`) para agregar los mismos campos teléfono y servicio.

### 2.3 — CSS para el formulario mejorado en `style.css`

```css
/* ── FORM ROW: 2 columnas en desktop ── */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* ── SELECT ── */
.form-group select {
  width: 100%;
  background: var(--input-bg, #1e1e1e);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  padding: 12px 16px;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  transition: border-color 0.2s ease;
}

.form-group select:focus {
  outline: none;
  border-color: #D32F2F;
}

.form-group select option {
  background: #1e1e1e;
  color: #fff;
}
```

---

## Resumen del flujo final

```
Usuario llena formulario en scdev.com.ar
        ↓
fetch POST → Apps Script Web App URL
        ↓
Apps Script:
  1. Guarda fila en hoja "leads" del Sheet (con timestamp)
  2. Envía email HTML a Santiago con los datos del lead
        ↓
Apps Script responde { ok: true }
        ↓
Sitio muestra SweetAlert de éxito
```

---

## Checklist final para Claude Code

- [ ] Agregar `APPS_SCRIPT_URL` al inicio de `script.js` con la URL real del Web App
- [ ] Reemplazar `loadConfigFromSheet` con versión JSON+CSV
- [ ] Reemplazar handler del formulario con `initContactForm()`
- [ ] Actualizar HTML del formulario principal con campos teléfono y servicio
- [ ] Actualizar HTML del modal de contacto con los mismos campos
- [ ] Agregar CSS `.form-row` y select styles
- [ ] Quitar el `action="https://formsubmit.co/..."` del form (ya no se usa)
- [ ] Verificar que `initContactForm()` se llama al final del IIFE
- [ ] Hacer commit: `feat: formulario de contacto → Google Sheets + email`

> ⚠️ La URL del Apps Script la tiene que proporcionar Santiago después de desplegar el Web App.
> Buscar `https://script.google.com/macros/s/AKfycbwyKDvZD-ci0BEHoCcWeFG4NxkalKO8NEGGpAidSKQ_RSyev5IpQiz0v_QN0H4wtSBe/exec` en el código y reemplazarla con la URL real.
