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

});