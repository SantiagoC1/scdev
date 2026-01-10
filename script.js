/* scdev | Interactive Script
    Contiene: Configuración de Partículas, Efecto de Escritura, Modal, Formulario AJAX y Menú Inteligente
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURACIÓN DE PARTICLES.JS ---
    if (document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ffffff" },
                "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" } },
                "opacity": { "value": 0.3, "random": false },
                "size": { "value": 3, "random": true },
                "line_linked": {
                    "enable": true, "distance": 150, "color": "#D32F2F", "opacity": 0.4, "width": 1
                },
                "move": {
                    "enable": true, "speed": 2, "direction": "none", "random": false, "out_mode": "out"
                }
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

    // --- 2. EFECTO TYPEWRITER (Escritura) ---
    const textToType = "Full Stack Junior";
    const typewriterElement = document.querySelector(".typewriter");
    let typeIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        if (!typewriterElement) return;

        const currentFullText = textToType;
        
        if (isDeleting) {
            typewriterElement.textContent = currentFullText.substring(0, typeIndex - 1);
            typeIndex--;
        } else {
            typewriterElement.textContent = currentFullText.substring(0, typeIndex + 1);
            typeIndex++;
        }

        let typeSpeed = 100;
        if (isDeleting) typeSpeed /= 2; 

        if (!isDeleting && typeIndex === currentFullText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && typeIndex === 0) {
            isDeleting = false;
            typeSpeed = 500;
        }

        setTimeout(typeEffect, typeSpeed);
    }
    typeEffect();


    // --- 3. MANEJO DEL MODAL (POP-UP) ---
    window.openModal = function(e) {
        if(e) e.preventDefault(); 
        const modal = document.getElementById('contactModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }

    window.closeModal = function() {
        const modal = document.getElementById('contactModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; 
    }

    const modalElement = document.getElementById('contactModal');
    if (modalElement) {
        modalElement.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }


    // --- 4. ENVÍO DE FORMULARIOS PRO (AJAX) ---
    const forms = document.querySelectorAll('.contact-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
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
            .catch(error => {
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

    // --- 5. ANIMACIÓN AL HACER SCROLL (Reveal Infinito) ---
    const reveals = document.querySelectorAll('.reveal');

    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        const elementVisible = 150; 

        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active'); 
            } else {
                reveal.classList.remove('active'); 
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // --- 6. AÑO DINÁMICO ---
    const yearElements = document.querySelectorAll('.current-year');
    const yearNow = new Date().getFullYear();
    yearElements.forEach(el => {
        el.textContent = yearNow;
    });

    // --- 7. MENÚ ACTIVO INTELIGENTE (Spy Scroll) ---
    const navLinks = document.querySelectorAll('.nav-links a');

    function activeMenu() {
        let scrollPosition = window.scrollY + 200; 

        // Iteramos sobre los links
        navLinks.forEach(link => {
            const sectionId = link.getAttribute('href');
            if (sectionId && sectionId.startsWith('#') && sectionId.length > 1) {
                const section = document.querySelector(sectionId);
                
                if (section) {
                    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
                    const sectionHeight = section.offsetHeight;

                    // Si estamos dentro del área de la sección
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        // Quitamos la clase a todos
                        navLinks.forEach(l => l.classList.remove('active-link'));
                        // Se la agregamos solo al actual
                        link.classList.add('active-link');
                    }
                }
            }
        });
    }
    
    window.addEventListener('scroll', activeMenu);
    activeMenu();
});