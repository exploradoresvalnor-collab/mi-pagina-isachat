window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Espera un poco para que la animación de carga se vea al menos un instante
        // y dure 4 segundos como solicitado.
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 4000);
    }
});

document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA PARA EL MENÚ DE HAMBURGUESA ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const allNavLinks = document.querySelectorAll('.nav-list .nav-link');

    const toggleMenu = () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        // Actualizar el estado de aria-expanded para accesibilidad
        const isExpanded = navMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
    };

    if (navToggle) {
        navToggle.addEventListener('click', toggleMenu);
    }

    const closeMenu = () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
    };

    allNavLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                event.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (!targetSection) return;

                const headerOffset = document.querySelector('.header').offsetHeight;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }

            // Lógica para cambiar de pestaña desde la navegación
            const tabTarget = link.dataset.tabTarget;
            if (tabTarget) {
                const tabButtonToClick = document.querySelector(`.tab-btn[data-tab="${tabTarget}"]`);
                if (tabButtonToClick) {
                    tabButtonToClick.click();
                }
            }

            if (navMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    });

    // --- RESALTAR ENLACE ACTIVO EN EL MENÚ AL HACER SCROLL ---
    const header = document.querySelector('.header');
    const navLinksForScroll = document.querySelectorAll('.nav-menu .nav-link');
    const sections = Array.from(navLinksForScroll).map(link => {
        const id = link.getAttribute('href');
        if (id && id.startsWith('#')) {
            return document.querySelector(id);
        }
        return null;
    }).filter(section => section !== null);
    
    const onScroll = () => {
        const scrollY = window.scrollY;

        // Efecto de header al hacer scroll
        if (header) {
            header.classList.toggle('scrolled', scrollY > 50);
        }

        // Resaltar enlace activo
        const headerHeight = header ? header.offsetHeight : 90;
        let activeSectionId = null;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 1; // 1px de offset
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                activeSectionId = `#${section.getAttribute('id')}`;
            }
        });

        navLinksForScroll.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === activeSectionId);
        });
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });

    // --- ANIMACIONES AL HACER SCROLL ---
    const sectionsToAnimate = document.querySelectorAll('.section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sectionsToAnimate.forEach(section => {
        observer.observe(section);
    });

    // --- LÓGICA PARA COPIAR PROMPT ---
    const copyPromptBtn = document.getElementById('copy-prompt-btn');
    const promptTextEl = document.getElementById('prompt-text');

    if (copyPromptBtn && promptTextEl) {
        copyPromptBtn.addEventListener('click', () => {
            const textToCopy = promptTextEl.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Feedback visual usando una clase
                copyPromptBtn.textContent = '¡Copiado!';
                copyPromptBtn.classList.add('copied');

                setTimeout(() => {
                    copyPromptBtn.textContent = 'Copiar Prompt';
                    copyPromptBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Error al copiar el texto: ', err);
                copyPromptBtn.textContent = 'Error al copiar';
                setTimeout(() => { copyPromptBtn.textContent = 'Copiar Prompt'; }, 2000);
            });
        });
    }

    // --- LÓGICA PARA TABS EN SECCIÓN DE RECURSOS ---
    const tabsContainer = document.querySelector('.tabs-nav');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const tabBtns = document.querySelectorAll('.tab-btn');

    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            const clickedBtn = e.target.closest('.tab-btn');
            if (!clickedBtn) return;

            const tabId = clickedBtn.dataset.tab;

            // Actualizar botones
            tabBtns.forEach(btn => btn.classList.remove('active'));
            clickedBtn.classList.add('active');

            // Actualizar paneles
            tabPanes.forEach(pane => {
                pane.classList.toggle('active', pane.id === tabId);
            });
        });
    }

    // --- LÓGICA PARA EFECTO 3D EN MASCOTA DEL HERO ---
    // Cambiamos el objetivo al contenedor de la imagen para un efecto más directo y notorio
    const mascotContainer = document.querySelector('.hero-image');
    const mascotImage = document.querySelector('.hero-image img');

    if (mascotContainer && mascotImage) {
        const maxRotate = 15; // Aumentamos la rotación para que sea más evidente

        mascotContainer.addEventListener('mousemove', (e) => {
            const rect = mascotContainer.getBoundingClientRect();
            const x = e.clientX - rect.left; // Posición X del cursor dentro del elemento
            const y = e.clientY - rect.top;  // Posición Y del cursor dentro del elemento

            const { width, height } = rect;

            // Calcular la posición del cursor de -0.5 a 0.5
            const xPercent = (x / width) - 0.5;
            const yPercent = (y / height) - 0.5;

            // Calcular rotación. Invertimos 'y' para un movimiento natural.
            const rotateY = xPercent * maxRotate * 2;
            const rotateX = yPercent * -maxRotate * 2;

            mascotImage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
            mascotImage.style.animationPlayState = 'paused';
        });

        mascotContainer.addEventListener('mouseleave', () => {
            mascotImage.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
            mascotImage.style.animationPlayState = 'running';
        });
    }

    // --- LÓGICA PARA MASCOTA STICKY Y BURBUJAS DE CHAT ---
    const stickyMascot = document.getElementById('sticky-mascot');
    const heroSectionForMascot = document.getElementById('hero');
    const bubbleContainer = document.getElementById('chat-bubble-container');
    let isJiggling = false; // Para evitar múltiples animaciones a la vez
    let bubbleTimeout; // Para limpiar timeouts anteriores

    if (stickyMascot && heroSectionForMascot && bubbleContainer) {
        
        // --- Visibilidad al hacer scroll ---
        const mascotScrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Muestra la mascota cuando la sección 'hero' ya no está en la pantalla
                const isVisible = !entry.isIntersecting && window.scrollY > 200;
                stickyMascot.classList.toggle('visible', isVisible);
            });
        }, { threshold: 0.01 }); // Se activa cuando casi toda la sección ha salido

        mascotScrollObserver.observe(heroSectionForMascot);

        // --- Lógica de clic para mostrar burbujas ---
        const messages = [
            "¡Soy Isa! Y haré que tu negocio llegue a otro nivel. 🚀",
            "¿Sabías que puedo trabajar 24/7 en tu WhatsApp para automatizar ventas?",
            "Puedo gestionar hasta 50 productos con el plan Elite. ¡Imagina las posibilidades!",
            "Conéctame a tu WhatsApp escaneando un QR. ¡Es así de simple!",
            "Si un cliente pregunta si soy un robot, le diré que soy tu asesora profesional. 😉"
        ];
        let messageIndex = 0;

        stickyMascot.addEventListener('click', () => {
            // 1. Añadir efecto de "jiggle" al hacer clic
            if (!isJiggling) {
                isJiggling = true;
                stickyMascot.classList.add('jiggle');
                
                // Limpiar la clase después de que termine la animación
                setTimeout(() => {
                    stickyMascot.classList.remove('jiggle');
                    isJiggling = false;
                }, 500); // Debe coincidir con la duración de la animación en CSS
            }

            // 2. Lógica de la burbuja de chat (sin cambios)
            clearTimeout(bubbleTimeout);
            bubbleContainer.innerHTML = '';

            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble';
            bubble.textContent = messages[messageIndex];
            bubbleContainer.appendChild(bubble);

            messageIndex = (messageIndex + 1) % messages.length;

            bubbleTimeout = setTimeout(() => {
                bubbleContainer.innerHTML = '';
            }, 6000); // La burbuja desaparece después de 6 segundos
        });
    }
});