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

  async function loadConfigFromSheet() {
    const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar config del Sheet");
    const csvText = await res.text();
    return parseSimpleKeyValueCSV(csvText);
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

    // 2) data-bind-href -> href (linkedin, github, etc.)
    document.querySelectorAll("[data-bind-href]").forEach(el => {
      const key = el.getAttribute("data-bind-href");
      const val = cfg[key];
      if (!val) return;
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
      const cfg = await loadConfigFromSheet();
      applyConfig(cfg);
    } catch (err) {
      console.warn("Config dinámica no disponible:", err);
      // Si falla, la web igual funciona con tus links hardcodeados (si dejaste alguno)
    }
  })();

  // ==================================
  // 2) PARTICLES.JS
  // ==================================
  if (document.getElementById('particles-js')) {
    particlesJS("particles-js", {
      "particles": {
        "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
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
  // 5) FORM SUBMIT (AJAX)
  // ==================================
  const forms = document.querySelectorAll('.contact-form');
  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.7";

      fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(response => {
          if (response.ok) {
            closeModal();
            Swal.fire({
              title: '¡Mensaje Enviado!',
              text: 'Gracias por escribirme. Te responderé pronto.',
              icon: 'success',
              background: '#1E1E1E',
              color: '#F3EDED',
              confirmButtonColor: '#D32F2F',
              confirmButtonText: 'Genial'
            });
            form.reset();
          } else {
            throw new Error('Error en el servidor');
          }
        })
        .catch(() => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo enviar el mensaje. Intenta de nuevo.',
            icon: 'error',
            background: '#1E1E1E',
            color: '#F3EDED',
            confirmButtonColor: '#D32F2F'
          });
        })
        .finally(() => {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = "1";
        });
    });
  });

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
  // 8) SPY SCROLL MENU
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
});
