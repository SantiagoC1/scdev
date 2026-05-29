document.addEventListener('DOMContentLoaded', () => {

  // ==============================
  // 0) HELPERS UI (WhatsApp Float)
  // ==============================
  function setWaFloatVisible(isVisible) {
    const wa = document.getElementById('waFloat');
    if (!wa) return;
    wa.classList.toggle('hidden', !isVisible);
  }

  // ==================================
  // 1) GOOGLE SHEETS CONFIG (CSV)
  // ==================================
  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSe21mBG9BnOIEktHHV47_nyirWIiJXTfTqpZ2bDqSHV9hKU5vXlNFKXAvEU7bnlwZgfnB7xtvXhMRE/pub?gid=0&single=true&output=csv";

  // URL del Apps Script Web App (formulario de contacto + config JSON)
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwyKDvZD-ci0BEHoCcWeFG4NxkalKO8NEGGpAidSKQ_RSyev5IpQiz0v_QN0H4wtSBe/exec";

  async function loadConfigFromSheet() {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 6000);

    try {
      // Intentar primero el endpoint JSON del Apps Script
      if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("PEGAR_URL")) {
        const res = await fetch(APPS_SCRIPT_URL, { cache: "no-store", signal: controller.signal });
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
      const res = await fetch(SHEET_CSV_URL, { cache: "no-store", signal: controller2.signal });
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

  function parseSimpleKeyValueCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);

    // Espera header "key,value" (igual funciona si tiene otro header mientras haya 2 cols)
    const out = {};
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Split básico; soporta value con comas uniendo el resto.
      const [rawKey, ...rest] = line.split(",");
      const rawValue = rest.join(",");

      const key = (rawKey || "").trim();
      const value = (rawValue || "").trim();

      if (key) out[key] = value;
    }
    return out;
  }

  function formatARS(value) {
    const n = Number(String(value).replace(/[^\d.-]/g, ""));
    if (Number.isNaN(n)) return value;
    return n.toLocaleString("es-AR");
  }

  function buildWhatsAppLink(number, text) {
    const clean = String(number || "").replace(/[^\d]/g, "");
    const msg = encodeURIComponent(text || "");
    return `https://wa.me/${clean}?text=${msg}`;
  }

  // Aplica config a la UI
  function applyConfig(cfg) {
    // 1) data-bind -> texto (precios y otros)
    document.querySelectorAll("[data-bind]").forEach(el => {
      const key = el.getAttribute("data-bind");
      const val = cfg[key];
      if (val == null) return;

      if (key.startsWith("price_")) el.textContent = formatARS(val);
      else el.textContent = val;
    });

    // 2) data-bind-href -> href (linkedin, github, etc.) — ocultar si el valor está vacío
    document.querySelectorAll("[data-bind-href]").forEach(el => {
      const key = el.getAttribute("data-bind-href");
      const val = cfg[key];
      if (!val) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.setAttribute("href", val);
    });

    // 3) WhatsApp unificado
    const waNumber = cfg.whatsapp_number || "";
    const defaultText = cfg.whatsapp_default_text || "Hola! Quiero consultar por una web.";
    const defaultLink = buildWhatsAppLink(waNumber, defaultText);

    // a) Todos los links con data-wa-link
    document.querySelectorAll("[data-wa-link]").forEach(a => {
      // Si tiene data-wa-text, usa ese texto
      const customText = a.getAttribute("data-wa-text");
      // Si tiene data-wa-text-key, busca texto en cfg
      const textKey = a.getAttribute("data-wa-text-key");
      const keyTextValue = textKey ? (cfg[textKey] || "") : "";

      const text = customText || keyTextValue || defaultText;
      a.setAttribute("href", buildWhatsAppLink(waNumber, text));
    });
  }

  // Carga config y aplica
  (async () => {
    try {
      console.log("[SCdev] Cargando config desde Google Sheets...");
      const cfg = await loadConfigFromSheet();
      console.log("[SCdev] Config cargada:", cfg);
      applyConfig(cfg);
      console.log("[SCdev] Config aplicada correctamente.");
    } catch (err) {
      console.error("[SCdev] Config dinámica no disponible:", err.message, err);
      // Fallback: aplicar links críticos hardcodeados
      const fallbackCfg = {
        github_url: "https://github.com/SantiagoC1",
      };
      document.querySelectorAll("[data-bind-href]").forEach(el => {
        const key = el.getAttribute("data-bind-href");
        if (fallbackCfg[key]) el.setAttribute("href", fallbackCfg[key]);
      });
    }
  })();

  // ==================================
  // 2) PARTICLES.JS
  // ==================================
  const isMobile = window.innerWidth <= 768;

  if (document.getElementById('particles-js')) {
    particlesJS("particles-js", {
      "particles": {
        "number": { "value": isMobile ? 30 : 60, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#ffffff" },
        "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" } },
        "opacity": { "value": 0.3, "random": false },
        "size": { "value": 3, "random": true },
        "line_linked": { "enable": true, "distance": 150, "color": "#D32F2F", "opacity": 0.4, "width": 1 },
        "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "out_mode": "out" }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": { "enable": true, "mode": "grab" },
          "onclick": { "enable": true, "mode": "push" },
          "resize": true
        },
        "modes": {
          "grab": { "distance": 140, "line_linked": { "opacity": 1 } },
          "push": { "particles_nb": 4 }
        }
      },
      "retina_detect": true
    });
  }

  // ==================================
  // 3) TYPEWRITER (orientado a negocio)
  // ==================================
  const typewriterElement = document.querySelector(".typewriter");
  const phrases = [
    "webs para negocios",
    "landing pages que generan consultas",
    "soluciones .NET escalables",
    "sitios rápidos y claros"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    if (!typewriterElement) return;
    const currentText = phrases[phraseIndex];

    if (isDeleting) {
      typewriterElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typewriterElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = 90;
    if (isDeleting) speed = 45;

    if (!isDeleting && charIndex === currentText.length) {
      speed = 1400;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      speed = 350;
    }
    setTimeout(typeEffect, speed);
  }
  typeEffect();

  // ==================================
  // 4) MODAL CONTACTO
  // ==================================
  window.openModal = function (e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('contactModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setWaFloatVisible(false);
  }

  window.closeModal = function () {
    const modal = document.getElementById('contactModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    setWaFloatVisible(true);
  }

  const contactModalEl = document.getElementById('contactModal');
  if (contactModalEl) {
    contactModalEl.addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
  }

  // ==================================
  // 5) FORMULARIO → Apps Script + Sheets
  // ==================================
  function initContactForm() {
    const ALLOWED_SERVICIOS = ["", "Landing Page", "Sitio Web Profesional", "Mantenimiento Web", "Sistema a medida", "Otro"];

    function showFieldError(fieldEl, msg) {
      fieldEl.classList.add('invalid');
      let errEl = fieldEl.parentElement.querySelector('.field-error');
      if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'field-error';
        fieldEl.parentElement.appendChild(errEl);
      }
      errEl.textContent = msg;
    }

    function clearFieldError(fieldEl) {
      fieldEl.classList.remove('invalid');
      const errEl = fieldEl.parentElement.querySelector('.field-error');
      if (errEl) errEl.textContent = '';
    }

    document.querySelectorAll('.contact-form, .modal-form').forEach(form => {
      // Limpiar error al hacer focus
      form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('focus', () => clearFieldError(field));
      });

      form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn  = this.querySelector('[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        const formData = new FormData(this);
        const payload  = Object.fromEntries(formData.entries());

        // Honeypot silencioso
        if (payload._honey) return;

        const body = {
          nombre:   (payload.nombre   || payload.name    || "").trim(),
          email:    (payload.email                       || "").trim(),
          telefono: (payload.telefono || payload.phone   || "").trim(),
          servicio: (payload.servicio || payload.service || "").trim(),
          mensaje:  (payload.mensaje  || payload.message || "").trim(),
        };

        // ── Validaciones inline ──────────────────────────────────────
        let hasError = false;
        const nombreEl  = this.querySelector('[name="nombre"]');
        const emailEl   = this.querySelector('[name="email"]');
        const telEl     = this.querySelector('[name="telefono"]');
        const servEl    = this.querySelector('[name="servicio"]');
        const mensajeEl = this.querySelector('[name="mensaje"]');

        if (nombreEl) {
          if (!body.nombre || body.nombre.length < 2)
            { showFieldError(nombreEl, 'Ingresá tu nombre (mínimo 2 caracteres).'); hasError = true; }
          else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]{2,60}$/.test(body.nombre))
            { showFieldError(nombreEl, 'Solo letras, espacios y guiones (máx. 60).'); hasError = true; }
          else clearFieldError(nombreEl);
        }

        if (emailEl) {
          if (!body.email)
            { showFieldError(emailEl, 'Ingresá tu email.'); hasError = true; }
          else if (body.email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
            { showFieldError(emailEl, 'Email inválido.'); hasError = true; }
          else clearFieldError(emailEl);
        }

        if (telEl) {
          if (body.telefono && !/^[\d\s\+\-\(\)]{6,20}$/.test(body.telefono))
            { showFieldError(telEl, 'Formato inválido. Ej: +54 9 221 XXX-XXXX'); hasError = true; }
          else clearFieldError(telEl);
        }

        if (servEl) {
          if (!ALLOWED_SERVICIOS.includes(body.servicio))
            { showFieldError(servEl, 'Seleccioná una opción válida.'); hasError = true; }
          else clearFieldError(servEl);
        }

        if (mensajeEl) {
          if (!body.mensaje || body.mensaje.length < 10)
            { showFieldError(mensajeEl, 'El mensaje debe tener al menos 10 caracteres.'); hasError = true; }
          else if (body.mensaje.length > 1000)
            { showFieldError(mensajeEl, `Mensaje demasiado largo (${body.mensaje.length}/1000 caracteres).`); hasError = true; }
          else clearFieldError(mensajeEl);
        }

        if (hasError) return;

        // ── Rate limiting (30 s entre envíos) ────────────────────────
        const lastSent = sessionStorage.getItem('scdev_last_sent');
        if (lastSent && Date.now() - parseInt(lastSent) < 30000) {
          if (mensajeEl) showFieldError(mensajeEl, 'Esperá unos segundos antes de volver a enviar.');
          return;
        }

        // ── Envío ────────────────────────────────────────────────────
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled  = true;

        try {
          const params = new URLSearchParams();
          Object.entries(body).forEach(([k, v]) => params.append(k, v));

          await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode:   "no-cors",
            body:   params,
          });

          sessionStorage.setItem('scdev_last_sent', Date.now().toString());

          // no-cors no devuelve respuesta legible, asumir éxito si no lanza excepción
          submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
          submitBtn.style.background = "#2e7d32";
          this.reset();

          if (typeof Swal !== "undefined") {
            Swal.fire({
              icon: "success",
              title: "¡Mensaje enviado!",
              text: "Te respondo a la brevedad 🚀",
              confirmButtonColor: "#D32F2F",
              background: "#1a1a1a",
              color: "#fff",
            });
          }

          if (this.closest('#contactModal')) {
            setTimeout(() => closeModal(), 1500);
          }

        } catch (err) {
          console.error("[SCdev] Error enviando formulario:", err);
          submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error, reintentá';
          submitBtn.style.background = "#c62828";

          if (typeof Swal !== "undefined") {
            Swal.fire({
              icon: "error",
              title: "Error al enviar",
              text: "Intentá de nuevo o escribime directo por WhatsApp.",
              confirmButtonColor: "#D32F2F",
              background: "#1a1a1a",
              color: "#fff",
            });
          }
        } finally {
          setTimeout(() => {
            submitBtn.innerHTML  = originalHTML;
            submitBtn.disabled   = false;
            submitBtn.style.background = "";
          }, 3000);
        }
      });
    });
  }

  // ==================================
  // 6) SCROLL REVEAL
  // ==================================
  const reveals = document.querySelectorAll('.reveal');
  function revealOnScroll() {
    const windowHeight = window.innerHeight;
    const elementVisible = 150;

    reveals.forEach((reveal) => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) reveal.classList.add('active');
      else reveal.classList.remove('active');
    });
  }
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();

  // ==================================
  // 7) AÑO DINÁMICO
  // ==================================
  const yearElements = document.querySelectorAll('.current-year');
  const yearNow = new Date().getFullYear();
  yearElements.forEach(el => el.textContent = yearNow);

  // ==================================
  // 8) NAVBAR SCROLL CLASS
  // ==================================
  const navbarEl = document.querySelector('.navbar');
  function handleNavScroll() {
    if (!navbarEl) return;
    navbarEl.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ==================================
  // 8b) SPY SCROLL MENU
  // ==================================
  const navLinks = document.querySelectorAll('.nav-links a');
  function activeMenu() {
    let scrollPosition = window.scrollY + 200;

    navLinks.forEach(link => {
      const sectionId = link.getAttribute('href');
      if (sectionId && sectionId.startsWith('#') && sectionId.length > 1) {
        const section = document.querySelector(sectionId);
        if (section) {
          const sectionTop = section.getBoundingClientRect().top + window.scrollY;
          const sectionHeight = section.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(l => l.classList.remove('active-link'));
            link.classList.add('active-link');
          }
        }
      }
    });
  }
  window.addEventListener('scroll', activeMenu);
  activeMenu();

  // ==================================
  // 8c) HAMBURGER MENU
  // ==================================
  const hamburgerBtn  = document.querySelector('.hamburger');
  const navLinksMenu  = document.querySelector('.nav-links');
  const navOverlayEl  = document.querySelector('.nav-overlay');

  function openHamburger() {
    navLinksMenu.classList.add('open');
    hamburgerBtn.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    if (navOverlayEl) navOverlayEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeHamburger() {
    if (!navLinksMenu.classList.contains('open')) return;
    navLinksMenu.classList.remove('open');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    if (navOverlayEl) navOverlayEl.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      navLinksMenu.classList.contains('open') ? closeHamburger() : openHamburger();
    });
  }
  if (navOverlayEl) navOverlayEl.addEventListener('click', closeHamburger);

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeHamburger);
  });

  // ==================================
  // 9) MODAL PROYECTOS
  // ==================================
  window.openProjectModal = function (card) {
    const modal = document.getElementById('projectModal');

    const title = card.getAttribute('data-title');
    const result = card.getAttribute('data-result') || '';
    const desc = card.getAttribute('data-desc');
    const tags = card.getAttribute('data-tags');
    const repoLink = card.getAttribute('data-repo');
    const demoLink = card.getAttribute('data-demo');
    const imageSrc = card.getAttribute('data-image');

    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-desc');
    const imgEl = document.getElementById('modal-img');
    const repoBtn = document.getElementById('modal-repo-btn');
    const demoBtn = document.getElementById('modal-demo-btn');
    const resultEl = document.getElementById('modal-result');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (imgEl) imgEl.src = imageSrc;
    if (repoBtn) repoBtn.href = repoLink;
    if (demoBtn) demoBtn.href = demoLink;
    if (resultEl) resultEl.textContent = result;

    const tagsContainer = document.getElementById('modal-tags');
    if (tagsContainer) {
      tagsContainer.innerHTML = '';
      if (tags) {
        tags.split(',').forEach(tag => {
          const span = document.createElement('span');
          span.className = 'skill-badge';
          span.textContent = tag.trim();
          tagsContainer.appendChild(span);
        });
      }
    }

    if (demoBtn) demoBtn.style.display = (demoLink === '#' || demoLink === '') ? 'none' : 'flex';

    // Reiniciar animación de entrada en cada apertura
    const modalContent = modal.querySelector('.project-modal-content');
    if (modalContent) {
      modalContent.style.animation = 'none';
      void modalContent.offsetWidth;
      modalContent.style.animation = '';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setWaFloatVisible(false);
  }

  window.closeProjectModal = function () {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    setWaFloatVisible(true);
  }

  const projectModalEl = document.getElementById('projectModal');
  if (projectModalEl) {
    projectModalEl.addEventListener('click', function (e) {
      if (e.target === this) closeProjectModal();
    });
  }

  // ==================================
  // 10) INICIALIZAR FORMULARIO
  // ==================================
  initContactForm();
});
