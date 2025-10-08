"use strict";

// Helper: fetch con timeout
const fetchWithTimeout = (url, options = {}, timeout = 7000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(id));
};

document.addEventListener('DOMContentLoaded', () => {
    const PRELOADER_MIN_MS = 600; // tiempo mínimo que el preloader debe mostrarse (configurable)
    const PRELOADER_TRANSITION_MS = 900; // debe coincidir con la transición CSS
    const preloader = document.getElementById('preloader');
    const preloaderShownAt = preloader ? performance.now() : null;

    // --- UTILIDADES GENERALES ---
    const qs = (selector, ctx = document) => ctx.querySelector(selector);
    const qsa = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));
    const on = (el, event, handler, opts = {}) => { if (!el) return; el.addEventListener(event, handler, opts); };

    // --- LÓGICA PARA CARGAR CLASES DESDE JSON ---
    const loadClasses = async () => {
        try {
            const response = await fetchWithTimeout('iframes.json', {}, 6000);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const modules = await response.json();
            const accordionContainer = document.querySelector('#clases .accordion');

            if (accordionContainer && Array.isArray(modules)) {
                const fragment = document.createDocumentFragment();
                modules.forEach(module => {
                    const details = document.createElement('details');
                    details.className = 'accordion-item';

                    const summary = document.createElement('summary');
                    summary.innerHTML = `${module.module}<svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
                    details.appendChild(summary);

                    const ul = document.createElement('ul');
                    ul.className = 'accordion-content';
                    (module.classes || []).forEach(clase => {
                        const li = document.createElement('li');
                        if (clase.status === 'disabled') {
                            li.innerHTML = `<a href="#" class="disabled" onclick="return false;">${clase.title}</a>`;
                        } else {
                            li.innerHTML = `<a href="${clase.url}" target="_blank" rel="noopener noreferrer">${clase.title}</a>`;
                        }
                        ul.appendChild(li);
                    });

                    details.appendChild(ul);
                    fragment.appendChild(details);
                });
                accordionContainer.innerHTML = '';
                accordionContainer.appendChild(fragment);
            }
        } catch (error) {
            console.error('No se pudieron cargar las clases:', error);
            const accordionContainer = document.querySelector('#clases .accordion');
            if (accordionContainer) {
                accordionContainer.innerHTML = '<p style="color: var(--color-texto-dark);">No se pudieron cargar las clases en este momento. Por favor, intenta de nuevo más tarde.</p>';
            }
        }
    };

    // --- LÓGICA PARA CARGAR ACTUALIZACIONES DESDE JSON ---
    const loadUpdates = async () => {
        const iconMap = {
            "shopping-cart": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
            "trending-up": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
            "sliders": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>',
            "user-check": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>',
            "refresh-cw": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
            "link": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>',
            "briefcase": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>'
        };

        try {
            const response = await fetchWithTimeout('updates.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const updates = await response.json();
            const updatesGrid = document.querySelector('.updates-grid');

            if (updatesGrid && Array.isArray(updates)) {
                updatesGrid.innerHTML = '';
                updates.forEach(update => {
                    const card = document.createElement('div');
                    card.className = `card update-card ${update.status === 'soon' ? 'update-card--soon' : ''}`.trim();
                    card.innerHTML = `
                        <div class="update-icon">${iconMap[update.icon] || ''}</div>
                        <h3 class="update-title">${update.title}</h3>
                        <p class="update-description">${update.description}</p>
                    `;
                    updatesGrid.appendChild(card);
                });
            }
        } catch (error) {
            console.error('No se pudieron cargar las actualizaciones:', error);
            const updatesGrid = document.querySelector('.updates-grid');
            if (updatesGrid) updatesGrid.innerHTML = '<p>No se pudieron cargar las actualizaciones.</p>';
        }
    };

    const hidePreloader = () => {
        if (!preloader) return;
        const elapsed = preloaderShownAt ? (performance.now() - preloaderShownAt) : PRELOADER_MIN_MS;
        const remaining = Math.max(0, PRELOADER_MIN_MS - elapsed);
        setTimeout(() => {
            preloader.classList.add('loaded');
            setTimeout(() => preloader.remove(), PRELOADER_TRANSITION_MS);
        }, remaining);
    };

    if (document.readyState === 'complete') {
        hidePreloader();
    } else {
        on(window, 'load', hidePreloader, { once: true });
    }

    // ======= LÓGICA DE CARRUSEL GENÉRICA =======
    const initCarousel = (carouselId, options = {}) => {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;

        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const indicatorsWrap = carousel.querySelector('.carousel-indicators');
        if (!track || !slides.length) return;

        let current = 0;
        let autoplayId = null;
        const AUTOPLAY_INTERVAL = options.autoplayInterval || 3000;

        // Crear indicadores si el contenedor existe
        if (indicatorsWrap) {
            slides.forEach((s, i) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
                if (i === 0) btn.setAttribute('aria-current', 'true');
                indicatorsWrap.appendChild(btn);
                btn.addEventListener('click', () => goTo(i));
            });
        }

        const indicators = indicatorsWrap ? Array.from(indicatorsWrap.querySelectorAll('button')) : [];

        function update() {
            track.style.transform = `translateX(-${current * 100}%)`;
            if (indicators.length) {
                indicators.forEach((b, i) => b.setAttribute('aria-current', i === current ? 'true' : 'false'));
            }
        }

        function goTo(index) {
            current = (index + slides.length) % slides.length;
            update();
            if (options.autoplay) restartAutoplay();
        }

        function prev() { goTo(current - 1); }
        function next() { goTo(current + 1); }

        if (prevBtn) on(prevBtn, 'click', prev);
        if (nextBtn) on(nextBtn, 'click', next);

        // Teclado
        on(carousel, 'keydown', (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        });

        // Autoplay
        function startAutoplay() {
            if (!options.autoplay || autoplayId) return;
            autoplayId = setInterval(next, AUTOPLAY_INTERVAL);
        }

        function stopAutoplay() {
            if (autoplayId) {
                clearInterval(autoplayId);
                autoplayId = null;
            }
        }

        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        // Pausa en hover/focus
        on(carousel, 'mouseenter', stopAutoplay);
        on(carousel, 'mouseleave', startAutoplay);
        on(carousel, 'focusin', stopAutoplay);
        on(carousel, 'focusout', startAutoplay);

        // Inicializar
        update();
        startAutoplay();
    };

    // --- LÓGICA PARA EL MODAL DE LA GUÍA VISUAL ---
    const initGuiaVisualModal = () => {
        const images = qsa('#guia-visual .guia-imagen img');
        if (images.length === 0) return;

        // Crear y añadir el HTML del modal al body
        const modalHTML = `
            <div class="guia-modal-overlay" id="guia-modal-overlay">
                <div class="guia-modal-content">
                    <button class="guia-modal-close" aria-label="Cerrar">&times;</button>
                    <div class="guia-modal-nav">
                        <button class="modal-prev" aria-label="Anterior">&#10094;</button>
                        <button class="modal-next" aria-label="Siguiente">&#10095;</button>
                    </div>
                    <div class="guia-modal-body">
                        <img src="" alt="">
                        <div class="guia-modal-text">
                            <h3></h3>
                            <p></p>
                            <div class="modal-counter">1 de 8</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const overlay = qs('#guia-modal-overlay');
        const modalImage = qs('img', overlay);
        const modalTitle = qs('h3', overlay);
        const modalText = qs('p', overlay);
        const modalCounter = qs('.modal-counter', overlay);
        const closeBtn = qs('.guia-modal-close', overlay);
        const prevBtn = qs('.modal-prev', overlay);
        const nextBtn = qs('.modal-next', overlay);

        let currentIndex = 0;

        const updateModal = (index) => {
            const img = images[index];
            const item = img.closest('.guia-item');
            const title = qs('.guia-texto h3', item).textContent;
            const text = qs('.guia-texto p', item).innerHTML;

            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalTitle.textContent = title;
            modalText.innerHTML = text;
            modalCounter.textContent = `${index + 1} de ${images.length}`;

            // Actualizar estado de los botones de navegación
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index === images.length - 1;
        };

        const openModal = (index) => {
            currentIndex = index;
            updateModal(currentIndex);
            document.body.classList.add('modal-open');
            overlay.classList.add('visible');
        };

        const closeModal = () => {
            document.body.classList.remove('modal-open');
            overlay.classList.remove('visible');
        };

        const nextImage = () => {
            if (currentIndex < images.length - 1) {
                currentIndex++;
                updateModal(currentIndex);
            }
        };

        const prevImage = () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateModal(currentIndex);
            }
        };

        images.forEach((img, index) => {
            on(img, 'click', () => openModal(index));
        });

        on(closeBtn, 'click', closeModal);
        on(prevBtn, 'click', prevImage);
        on(nextBtn, 'click', nextImage);
        on(overlay, 'click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });

        // Soporte para teclado
        on(window, 'keydown', (e) => {
            if (!overlay.classList.contains('visible')) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
                case 'Escape':
                    closeModal();
                    break;
            }
        });
    };

    // --- LÓGICA PARA INYECTAR ICONOS EN LA GUÍA ---
    const initGuiaExpansion = () => {
        const guiaContainer = qs('#guia-pasos');
        const expandBtn = qs('#btn-expand-guia');
        if (!guiaContainer || !expandBtn) return;

        const items = qsa('.guia-item', guiaContainer);
        const visibleItemCount = 3;

        // Inicialmente muestra solo los primeros 3 pasos
        items.forEach((item, index) => {
            if (index < visibleItemCount) {
                item.classList.add('visible');
            } else {
                item.classList.remove('visible');
            }
        });

        on(expandBtn, 'click', () => {
            const isExpanded = expandBtn.classList.toggle('expanded');
            
            items.forEach((item, index) => {
                if (index >= visibleItemCount) {
                    if (isExpanded) {
                        // Mostrar el item con un pequeño delay para crear un efecto cascada
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, (index - visibleItemCount) * 100);
                    } else {
                        item.classList.remove('visible');
                    }
                }
            });

            // Si estamos colapsando, scrollear suavemente hacia arriba
            if (!isExpanded) {
                const firstItem = items[0];
                firstItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    };

    const initGuiaVisualIcons = () => {
        const GUIA_ICON_MAP = {
            "contact": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
            "welcome": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
            "training": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 22V12"/><path d="M12 12H2"/><path d="M12 12h10"/><path d="M12 12a2.5 2.5 0 0 1-5 0"/><path d="M12 12a2.5 2.5 0 0 0 5 0"/></svg>',
            "whatsapp": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
            "create-product": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
            "upload-image": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2.4-3-4.1-5.6-4.1-1.6 0-3.1.8-4.1 2.1-1.5-1.6-3.9-2.3-6.2-1.7-2.7.8-4.6 3.4-4.6 6.4 0 3.5 2.9 6.4 6.4 6.4h9.6c2.5 0 4.6-2 4.6-4.5 0-1.7-.9-3.2-2.3-4z"/><polyline points="16 16 12 12 8 16"/></svg>',
            "details-price": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
            "finish": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        };

        const items = qsa('#guia-visual .guia-item[data-icon]');
        items.forEach(item => {
            const iconName = item.dataset.icon;
            const iconContainer = qs('.guia-item-icon', item);
            if (iconName && iconContainer && GUIA_ICON_MAP[iconName]) {
                iconContainer.innerHTML = GUIA_ICON_MAP[iconName];
            }
        });
    };

    const handleSmartNotification = async () => {
        const UPDATE_KEY = 'lastSeenUpdateTitle';
        const CLASS_KEY = 'lastSeenClassTitle';

        try {
            const [updates, modules, config] = await Promise.all([
                fetchWithTimeout('updates.json').then(res => res.json()),
                fetchWithTimeout('iframes.json').then(res => res.json()),
                fetchWithTimeout('config.json').then(res => res.json())
            ]);

            const latestUpdateTitle = updates?.[0]?.title;
            const lastModule = modules?.[modules.length - 1];
            const latestClass = lastModule?.classes?.[lastModule.classes.length - 1];
            const latestClassTitle = latestClass?.status !== 'disabled' ? latestClass.title : null;

            const isNewUpdate = latestUpdateTitle && latestUpdateTitle !== localStorage.getItem(UPDATE_KEY);
            const isNewClass = latestClassTitle && latestClassTitle !== localStorage.getItem(CLASS_KEY);

            let badgeText, badgeLink, newContent = {};

            if (isNewUpdate && isNewClass) {
                badgeText = config.notifications.new_both_text;
                badgeLink = '#recursos';
                newContent = { class: latestClassTitle, update: latestUpdateTitle };
            } else if (isNewUpdate) {
                badgeText = config.notifications.new_update_text;
                badgeLink = '#actualizaciones';
                newContent = { update: latestUpdateTitle };
            } else if (isNewClass) {
                badgeText = config.notifications.new_class_text;
                badgeLink = '#recursos';
                newContent = { class: latestClassTitle };
            }

            if (badgeText && config?.notifications?.enable_nav_badge) {
                const container = qs('#nav-notification-container');
                if (!container) return;

                const badgeLinkEl = document.createElement('a');
                badgeLinkEl.href = badgeLink;
                badgeLinkEl.className = 'nav-notification-badge';
                badgeLinkEl.dataset.newUpdateTitle = newContent.update || '';
                badgeLinkEl.dataset.newClassTitle = newContent.class || '';
                badgeLinkEl.innerHTML = `<span class="badge-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L14.3 9.3L21 12L14.3 14.7L12 21L9.7 14.7L3 12L9.7 9.3L12 3z"/></svg></span><span>${badgeText}</span>`;
                
                container.innerHTML = '';
                container.appendChild(badgeLinkEl);

                on(badgeLinkEl, 'click', (e) => {
                    e.preventDefault();
                    if (isNewUpdate) localStorage.setItem(UPDATE_KEY, latestUpdateTitle);
                    if (isNewClass) localStorage.setItem(CLASS_KEY, latestClassTitle);

                    qs(badgeLink)?.scrollIntoView({ behavior: 'smooth' });

                    setTimeout(() => {
                        try {
                            const { newUpdateTitle, newClassTitle } = badgeLinkEl.dataset;
                            if (newUpdateTitle) {
                                const newCard = qsa('.update-card').find(c => c.querySelector('.update-title')?.textContent.trim() === newUpdateTitle.trim());
                                if (newCard) {
                                    newCard.classList.add('highlight-new');
                                    setTimeout(() => newCard.classList.remove('highlight-new'), 4000);
                                }
                            }
                            if (newClassTitle) {
                                const newLink = qsa('#clases a').find(a => a.textContent.trim() === newClassTitle.trim());
                                if (newLink) {
                                    const newLi = newLink.closest('li');
                                    const parentDetails = newLi.closest('details');
                                    if (parentDetails && !parentDetails.open) parentDetails.open = true;
                                    newLi.classList.add('highlight-new');
                                    setTimeout(() => newLi.classList.remove('highlight-new'), 4000);
                                }
                            }
                        } catch (err) { console.error("Error highlighting new item:", err); }
                    }, 700);

                    badgeLinkEl.style.transition = 'opacity 0.5s, transform 0.5s';
                    badgeLinkEl.style.opacity = '0';
                    badgeLinkEl.style.transform = 'scale(0.8)';
                    setTimeout(() => badgeLinkEl.remove(), 500);
                }, { once: true });
            }
        } catch (error) { console.error('Error handling smart notification:', error); }
    };

    const initInteractivePrompt = () => {
        const highlightCards = qsa('[data-highlight-target]');
        const promptText = qs('#prompt-text');
        if (!highlightCards.length || !promptText) return;

        highlightCards.forEach(card => {
            const target = card.dataset.highlightTarget;
            const elementsToHighlight = qsa(`[data-highlight="${target}"]`, promptText);
            const highlightOn = () => elementsToHighlight.forEach(el => el.classList.add('highlighted'));
            const highlightOff = () => elementsToHighlight.forEach(el => el.classList.remove('highlighted'));

            on(card, 'mouseenter', highlightOn);
            on(card, 'mouseleave', highlightOff);
            on(card, 'touchstart', (e) => { e.preventDefault(); highlightOn(); }, { passive: false });
            on(card, 'touchend', highlightOff);
        });

        const copyBtn = qs('#copy-prompt-btn');
        if (copyBtn) {
            on(copyBtn, 'click', () => {
                const textToCopy = promptText.textContent;
                const copySpan = copyBtn.querySelector('span');
                const originalText = 'Copiar Prompt';

                const fallbackCopy = (text) => {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    
                    // Avoid scrolling to bottom
                    textArea.style.top = "0";
                    textArea.style.left = "0";
                    textArea.style.position = "fixed";

                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();

                    try {
                        const successful = document.execCommand('copy');
                        if (successful) {
                            showSuccess();
                        } else {
                            showError();
                        }
                    } catch (err) {
                        showError();
                        console.error('Fallback: Oops, unable to copy', err);
                    }

                    document.body.removeChild(textArea);
                };

                const showSuccess = () => {
                    copyBtn.classList.add('copied');
                    copySpan.textContent = '¡Copiado!';
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        copySpan.textContent = originalText;
                    }, 2500);
                };
                
                const showError = () => {
                    copySpan.textContent = 'Error al copiar';
                    setTimeout(() => {
                        copySpan.textContent = originalText;
                    }, 2500);
                };

                if (!navigator.clipboard) {
                    fallbackCopy(textToCopy);
                    return;
                }
                navigator.clipboard.writeText(textToCopy).then(showSuccess, (err) => {
                    console.error('Async: could not copy text: ', err);
                    fallbackCopy(textToCopy); // Try fallback if modern API fails
                });
            });
        }
    };

    const initCollapsiblePrompt = () => {
        const container = qs('.prompt-container');
        if (!container) return;

        const collapsibleArea = qs('.collapsible-prompt', container);
        const button = qs('.btn-expand-prompt', container);

        if (!collapsibleArea || !button) return;

        on(button, 'click', () => {
            collapsibleArea.classList.toggle('is-expanded');
            const isExpanded = collapsibleArea.classList.contains('is-expanded');
            button.setAttribute('aria-expanded', isExpanded);
        });
    };

    const initNavMenu = () => {
        const navToggle = qs('#nav-toggle');
        const navMenu = qs('#nav-menu');
        const allNavLinks = qsa('.nav-list .nav-link');

        if (!navToggle || !navMenu) return;

        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', navMenu.id);

        const toggleMenu = () => {
            const isExpanded = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        };
        on(navToggle, 'click', toggleMenu);

        const closeMenu = () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        };

        allNavLinks.forEach(link => {
            on(link, 'click', (event) => {
                if (link.getAttribute('href').startsWith('#')) {
                    event.preventDefault();
                    qs(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
                }
                if (qs('.tab-btn[data-tab]', link)) qs('.tab-btn[data-tab]').click();
                if (navMenu.classList.contains('active')) closeMenu();
            });
        });
    };

    const initScrollBehaviors = () => {
        const header = qs('.header');
        const backToTopBtn = qs('#back-to-top');
        const navLinksForScroll = qsa('.nav-menu a[href^="#"]');
        const sections = navLinksForScroll.map(l => {
            try {
                return qs(l.getAttribute('href'));
            } catch (e) {
                return null;
            }
        }).filter(Boolean);
        const sectionsToAnimate = qsa('.section');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            sectionsToAnimate.forEach(section => observer.observe(section));
        } else {
            sectionsToAnimate.forEach(section => section.classList.add('visible'));
        }

        const mascot = qs('#sticky-mascot');
        const hero = qs('#hero');
        if (mascot && hero) {
            const mascotObs = new IntersectionObserver(e => e.forEach(entry => mascot.classList.toggle('visible', !entry.isIntersecting && window.scrollY > 200)), { threshold: 0.01 });
            mascotObs.observe(hero);
        }

        const onScroll = () => {
            const scrollY = window.scrollY;
            if (header) header.classList.toggle('scrolled', scrollY > 50);
            if (backToTopBtn) backToTopBtn.classList.toggle('visible', scrollY > 400);

            let activeSectionId = null;
            const headerHeight = header ? header.offsetHeight : 90;
            sections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight - 1;
                if (scrollY >= sectionTop) {
                    activeSectionId = `#${section.id}`;
                }
            });
            navLinksForScroll.forEach(link => link.classList.toggle('active', link.getAttribute('href') === activeSectionId));
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    };

    const initMisc = () => {
        const tabsContainer = qs('.tabs-nav');
        if (tabsContainer) {
            on(tabsContainer, 'click', (e) => {
                const clickedBtn = e.target.closest('.tab-btn');
                if (!clickedBtn) return;
                const tabId = clickedBtn.dataset.tab;
                qsa('.tab-btn').forEach(btn => btn.classList.remove('active'));
                clickedBtn.classList.add('active');
                qsa('.tab-pane').forEach(pane => pane.classList.toggle('active', pane.id === tabId));
            });
        }

        const mascotContainer = qs('.hero-image');
        const mascotImage = qs('.hero-image img');
        if (mascotContainer && mascotImage) {
            const maxRotate = 15;
            on(mascotContainer, 'mousemove', (e) => {
                const rect = mascotContainer.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                mascotImage.style.transform = `rotateX(${-y * maxRotate * 2}deg) rotateY(${x * maxRotate * 2}deg) scale(1.1)`;
                mascotImage.style.animationPlayState = 'paused';
            });
            on(mascotContainer, 'mouseleave', () => {
                mascotImage.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
                mascotImage.style.animationPlayState = 'running';
            });
        }

        const stickyMascot = qs('#sticky-mascot');
        const bubbleContainer = qs('#chat-bubble-container');
        if (stickyMascot && bubbleContainer) {
            const messages = [
                "¡Soy Isa! Y haré que tu negocio llegue a otro nivel. 🚀",
                "¿Sabías que puedo trabajar 24/7 en tu WhatsApp para automatizar ventas?",
                "Puedo gestionar hasta 50 productos con el plan Elite. ¡Imagina las posibilidades!",
            ];
            let messageIndex = 0, isJiggling = false, bubbleTimeout;
            on(stickyMascot, 'click', () => {
                if (!isJiggling) {
                    isJiggling = true;
                    stickyMascot.classList.add('jiggle');
                    setTimeout(() => { stickyMascot.classList.remove('jiggle'); isJiggling = false; }, 500);
                }
                clearTimeout(bubbleTimeout);
                bubbleContainer.innerHTML = `<div class="chat-bubble">${messages[messageIndex]}</div>`;
                messageIndex = (messageIndex + 1) % messages.length;
                bubbleTimeout = setTimeout(() => { bubbleContainer.innerHTML = ''; }, 6000);
            });
        }
    };

    // --- INICIALIZACIÓN --- 
    loadClasses();
    loadUpdates();
    handleSmartNotification();
    initCarousel('hero-carousel', { autoplay: true, autoplayInterval: 3000 });
    initGuiaVisualModal();
    initGuiaVisualIcons();
    initGuiaExpansion();
    initInteractivePrompt();
    initCollapsiblePrompt();
    initNavMenu();
    initScrollBehaviors();
    initMisc();
});