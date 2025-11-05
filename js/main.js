"use strict";

// --- UTILIDADES GENERALES ---
const fetchWithTimeout = (url, options = {}, timeout = 7000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(id));
};

const qs = (selector, ctx = document) => ctx.querySelector(selector);
const qsa = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));
const on = (el, event, handler, opts = {}) => { if (!el) return; el.addEventListener(event, handler, opts); };

document.addEventListener('DOMContentLoaded', () => {
    const PRELOADER_MIN_MS = 600; // tiempo mínimo que el preloader debe mostrarse (configurable)
    const PRELOADER_TRANSITION_MS = 900; // debe coincidir con la transición CSS
    const preloader = document.getElementById('preloader');
    const preloaderShownAt = preloader ? performance.now() : null;

    // Función para manejar la expansión de contenido
    const handleContentExpansion = () => {
        const expandButtons = document.querySelectorAll('.expand-toggle');
        expandButtons.forEach(button => {
            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', !isExpanded);
                
                const container = button.closest('.step-content');
                if (container) {
                    const expandedContent = container.querySelector('.step-info-expanded');
                    if (expandedContent) {
                        if (!isExpanded) {
                            expandedContent.style.maxHeight = expandedContent.scrollHeight + 'px';
                            expandedContent.style.opacity = '1';
                            expandedContent.style.visibility = 'visible';
                        } else {
                            expandedContent.style.maxHeight = '0px';
                            expandedContent.style.opacity = '0';
                            setTimeout(() => {
                                expandedContent.style.visibility = 'hidden';
                            }, 500);
                        }
                    }
                }
            });
        });
    };

    // Inicializar los botones de expansión
    const expandButtons = document.querySelectorAll('.expand-toggle');
    expandButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
            
            const container = button.closest('.step-content');
            if (container) {
                const expandedContent = container.querySelector('.step-info-expanded');
                if (expandedContent) {
                    if (!isExpanded) {
                        expandedContent.style.maxHeight = expandedContent.scrollHeight + 'px';
                        expandedContent.style.opacity = '1';
                        expandedContent.style.visibility = 'visible';
                    } else {
                        expandedContent.style.maxHeight = '0px';
                        expandedContent.style.opacity = '0';
                        setTimeout(() => {
                            expandedContent.style.visibility = 'hidden';
                        }, 500);
                    }
                }
            }
        });
    });
    
    // Función para expandir detalles del producto (Paso 5)
    window.toggleProductDetails = function() {
        const details = document.getElementById('productDetails');
        const btnText = document.getElementById('btnProductText');
        const btnIcon = document.getElementById('btnProductIcon');
        
        if (details.classList.contains('hidden')) {
            details.classList.remove('hidden');
            btnText.textContent = 'Ver menos detalles';
            btnIcon.style.transform = 'rotate(180deg)';
        } else {
            details.classList.add('hidden');
            btnText.textContent = 'Ver más detalles';
            btnIcon.style.transform = 'rotate(0deg)';
        }
    };
    
    // Función para mostrar/ocultar todos los pasos de configuración
    window.toggleAllSteps = function() {
        const hiddenSteps = document.getElementById('hiddenSteps');
        const btnText = document.getElementById('btnToggleStepsText');
        const btnIcon1 = document.getElementById('btnToggleIcon1');
        const btnIcon2 = document.getElementById('btnToggleIcon2');
        
        if (hiddenSteps.classList.contains('hidden')) {
            hiddenSteps.classList.remove('hidden');
            btnText.textContent = 'Ocultar pasos adicionales';
            btnIcon1.style.transform = 'rotate(180deg)';
            btnIcon2.style.transform = 'rotate(180deg)';
            // Scroll suave al inicio de los pasos ocultos
            setTimeout(() => {
                hiddenSteps.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        } else {
            hiddenSteps.classList.add('hidden');
            btnText.textContent = 'Ver más pasos de configuración';
            btnIcon1.style.transform = 'rotate(0deg)';
            btnIcon2.style.transform = 'rotate(0deg)';
        }
    };
    
    // --- LÓGICA PARA CARGAR CLASES DESDE JSON ---
    const loadClasses = async () => {
        try {
            const response = await fetchWithTimeout('data/iframes.json', {}, 6000);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const accordionContainer = document.querySelector('#clases .accordion');

            // Soportar ambos formatos: { courses: [] } o array directo
            const modules = data.courses || data;

            if (accordionContainer && Array.isArray(modules)) {
                const fragment = document.createDocumentFragment();
                modules.forEach((module, index) => {
                    const details = document.createElement('details');
                    details.className = 'accordion-item';
                    
                    // Abrir el primer módulo por defecto
                    if (index === 0) details.open = true;

                    const summary = document.createElement('summary');
                    // Soportar ambos nombres de propiedad
                    const moduleName = module.name || module.module;
                    summary.innerHTML = `
                        <span>${moduleName}</span>
                        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    `;
                    details.appendChild(summary);

                    const ul = document.createElement('ul');
                    ul.className = 'accordion-content';
                    (module.classes || []).forEach(clase => {
                        const li = document.createElement('li');
                        const className = clase.name || clase.title;
                        const classUrl = clase.src || clase.url;
                        
                        if (clase.status === 'disabled') {
                            li.innerHTML = `<a href="#" class="disabled opacity-50 cursor-not-allowed" onclick="return false;">${className}</a>`;
                        } else {
                            li.innerHTML = `<a href="${classUrl}" target="_blank" rel="noopener noreferrer">${className}</a>`;
                        }
                        ul.appendChild(li);
                    });

                    details.appendChild(ul);
                    fragment.appendChild(details);
                });
                accordionContainer.innerHTML = '';
                accordionContainer.appendChild(fragment);
                
                console.log(`✅ ${modules.length} módulos cargados exitosamente`);
            }
        } catch (error) {
            console.error('❌ Error al cargar las clases:', error);
            const accordionContainer = document.querySelector('#clases .accordion');
            if (accordionContainer) {
                accordionContainer.innerHTML = `
                    <div class="text-center py-8 px-4">
                        <div class="text-red-500 text-5xl mb-4">⚠️</div>
                        <p class="text-gray-700 text-lg font-semibold mb-2">No se pudieron cargar las clases</p>
                        <p class="text-gray-500">Por favor, intenta recargar la página o contacta con soporte.</p>
                    </div>
                `;
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
            const response = await fetchWithTimeout('data/updates.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const updates = data.updates || data;
            const updatesGrid = document.querySelector('.updates-grid');

            if (updatesGrid && Array.isArray(updates)) {
                updatesGrid.innerHTML = '';
                updates.forEach((update, index) => {
                    const card = document.createElement('div');
                    const isComingSoon = update.status === 'coming-soon';
                    const delay = index * 100;
                    
                    card.className = `group relative bg-white rounded-2xl p-7 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-purple-300 ${isComingSoon ? 'opacity-75' : ''}`;
                    card.style.animationDelay = `${delay}ms`;
                    card.style.animation = 'fadeIn 0.6s ease-out forwards';
                    
                    const badgeColors = {
                        'Nuevo': 'bg-green-100 text-green-700 border-green-200',
                        'Mejorado': 'bg-blue-100 text-blue-700 border-blue-200',
                        'Próximamente': 'bg-purple-100 text-purple-700 border-purple-200'
                    };
                    
                    const iconSVG = {
                        '🛍️': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>',
                        '📊': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
                        '👋': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>',
                        '👥': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>',
                        '💬': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>',
                        '🔗': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>',
                        '📦': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>',
                        '📅': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
                    };
                    
                    card.innerHTML = `
                        <!-- Badge -->
                        <div class="absolute top-4 right-4">
                            <span class="px-3 py-1.5 text-xs font-bold rounded-full border-2 ${badgeColors[update.badge] || 'bg-gray-100 text-gray-700 border-gray-200'}">
                                ${update.badge}
                            </span>
                        </div>
                        
                        <!-- Icon -->
                        <div class="flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                            ${iconSVG[update.icon] || '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>'}
                        </div>
                        
                        <!-- Title -->
                        <h3 class="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-purple-600 transition-colors">
                            ${update.title}
                        </h3>
                        
                        <!-- Description -->
                        <p class="text-gray-600 leading-relaxed text-base">
                            ${update.description}
                        </p>
                        
                        <!-- Border decoration -->
                        <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
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
            preloader.classList.add('hidden');
            setTimeout(() => preloader.remove(), 500);
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

        // Inicializar el primer slide como visible
        slides.forEach((slide, i) => {
            if (i === 0) {
                slide.classList.add('opacity-100', 'z-10');
                slide.classList.remove('opacity-0');
            }
        });

        // Crear indicadores si el contenedor existe
        if (indicatorsWrap) {
            slides.forEach((s, i) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = i === 0 
                    ? 'w-10 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 shadow-lg shadow-cyan-500/50 transition-all duration-300' 
                    : 'w-2 h-2 rounded-full bg-white/40 hover:bg-white/70 hover:w-4 transition-all duration-300';
                btn.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
                if (i === 0) btn.setAttribute('aria-current', 'true');
                indicatorsWrap.appendChild(btn);
                btn.addEventListener('click', () => goTo(i));
            });
        }

        const indicators = indicatorsWrap ? Array.from(indicatorsWrap.querySelectorAll('button')) : [];

        function update() {
            // Usar fade effect en lugar de translateX
            slides.forEach((slide, i) => {
                if (i === current) {
                    slide.classList.remove('opacity-0');
                    slide.classList.add('opacity-100', 'z-10');
                } else {
                    slide.classList.remove('opacity-100', 'z-10');
                    slide.classList.add('opacity-0');
                }
            });
            
            // Actualizar indicadores con clases Tailwind mejoradas
            if (indicators.length) {
                indicators.forEach((btn, i) => {
                    btn.setAttribute('aria-current', i === current ? 'true' : 'false');
                    if (i === current) {
                        btn.className = 'w-10 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 shadow-lg shadow-cyan-500/50 transition-all duration-300';
                    } else {
                        btn.className = 'w-2 h-2 rounded-full bg-white/40 hover:bg-white/70 hover:w-4 transition-all duration-300';
                    }
                });
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

    // --- LÓGICA PARA LA ANIMACIÓN DE STEPS Y BOTONES ---
    const initGuiaVisual = () => {
        const extraSteps = qsa('.step-extra');
        const expandBtn = qs('#btn-expand-guia');
        const stepsContainer = qs('.guia-steps');
        
        if (!expandBtn) return;

        let isExpanded = false;

        // Configurar el botón de expandir/colapsar
        expandBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            
            // Actualizar aria-expanded
            expandBtn.setAttribute('aria-expanded', isExpanded);
            
            // Mostrar/ocultar pasos extra
            extraSteps.forEach((step, index) => {
                if (isExpanded) {
                    step.classList.remove('hidden');
                    // Animación escalonada
                    setTimeout(() => {
                        step.classList.add('animate-fadeIn');
                    }, index * 100);
                } else {
                    step.classList.add('hidden');
                    step.classList.remove('animate-fadeIn');
                }
            });

            // Actualizar el ícono
            const chevron = expandBtn.querySelector('.chevron-icon');
            if (chevron) {
                chevron.style.transform = isExpanded ? 'rotate(180deg)' : '';
            }

            // Si estamos colapsando, hacer scroll suave hacia la sección
            if (!isExpanded && stepsContainer) {
                stepsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        // Manejar ampliación de imágenes en los steps
        const allSteps = qsa('.step-card');
        allSteps.forEach((step) => {
            // Manejar el clic en la imagen para ampliarla
            const img = step.querySelector('img[alt*="rapido"]');
            if (img) {
                on(img, 'click', () => {
                    const modal = document.createElement('div');
                    modal.className = 'image-modal';
                    modal.innerHTML = `
                        <div class="image-modal-content">
                            <img src="${img.src}" alt="${img.alt}">
                            <button class="image-modal-close">×</button>
                        </div>
                    `;
                    document.body.appendChild(modal);
                    
                    // Prevenir scroll del body
                    document.body.style.overflow = 'hidden';
                    
                    // Animación de entrada
                    requestAnimationFrame(() => modal.classList.add('visible'));
                    
                    // Manejar cierre
                    const close = () => {
                        modal.classList.remove('visible');
                        setTimeout(() => {
                            modal.remove();
                            document.body.style.overflow = '';
                        }, 300);
                    };
                    
                    on(modal, 'click', e => {
                        if (e.target === modal || e.target.classList.contains('image-modal-close')) {
                            close();
                        }
                    });
                    
                    on(window, 'keydown', e => {
                        if (e.key === 'Escape') close();
                    });
                });
            }
        });
    };

    // --- ICONOS PARA LA GUÍA VISUAL (CÓDIGO LEGACY - DEPRECADO) ---
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
            const [updates, modulesData, config] = await Promise.all([
                fetchWithTimeout('data/updates.json').then(res => res.json()),
                fetchWithTimeout('data/iframes.json').then(res => res.json()),
                fetchWithTimeout('data/config.json').then(res => res.json())
            ]);

            // Soportar ambos formatos del JSON
            const modules = modulesData.courses || modulesData;

            const latestUpdateTitle = updates?.[0]?.title;
            const lastModule = modules?.[modules.length - 1];
            const latestClass = lastModule?.classes?.[lastModule.classes.length - 1];
            const latestClassTitle = latestClass?.status !== 'disabled' ? (latestClass.name || latestClass.title) : null;

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
        const mobileToggle = qs('#mobileToggle');
        const mobileMenu = qs('#mobileMenu');
        const allMenuLinks = qsa('.mobile-item, .nav-item');

        if (!mobileToggle || !mobileMenu) return;

        const toggleMenu = () => {
            const isActive = mobileMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open', isActive);
        };
        
        on(mobileToggle, 'click', toggleMenu);

        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        };

        allMenuLinks.forEach(link => {
            on(link, 'click', (event) => {
                closeMenu();
                if (link.getAttribute('href').startsWith('#')) {
                    event.preventDefault();
                    const targetId = link.getAttribute('href');
                    const target = qs(targetId);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
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
                
                // Actualizar botones con estilos Tailwind
                qsa('.tab-btn').forEach(btn => {
                    if (btn === clickedBtn) {
                        btn.classList.remove('bg-white', 'text-gray-700', 'border-2', 'border-gray-300');
                        btn.classList.add('bg-purple-600', 'text-white', 'shadow-lg');
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('bg-purple-600', 'text-white', 'shadow-lg', 'active');
                        btn.classList.add('bg-white', 'text-gray-700', 'border-2', 'border-gray-300');
                    }
                });
                
                // Actualizar panes con animación
                qsa('.tab-pane').forEach(pane => {
                    if (pane.id === tabId) {
                        pane.classList.remove('hidden');
                        pane.classList.add('active');
                    } else {
                        pane.classList.add('hidden');
                        pane.classList.remove('active');
                    }
                });
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

    // Función para expandir/colapsar contenido
    window.toggleExpand = function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const isExpanded = container.classList.toggle('expanded');
        const button = container.querySelector('.btn-expand, .expand-toggle');
        if (button) {
            button.setAttribute('aria-expanded', isExpanded);
        }
        
        const content = container.querySelector('.expandable-content');
        if (content) {
            if (isExpanded) {
                content.style.maxHeight = `${content.scrollHeight}px`;
                content.style.opacity = '1';
            } else {
                content.style.maxHeight = '0';
                content.style.opacity = '0';
            }
        }
        
        // Scroll suave si el contenido está siendo colapsado
        if (!isExpanded && container.getBoundingClientRect().top < 0) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Función para manejar la expansión del contenido de productos
    const initProductExpansion = () => {
        const productSections = qsa('.product-section');
        productSections.forEach(section => {
            const content = qs('.product-content', section);
            const expandBtn = qs('.expand-btn', section);
            if (!content || !expandBtn) return;

            on(expandBtn, 'click', () => {
                const isExpanded = section.classList.toggle('expanded');
                expandBtn.setAttribute('aria-expanded', isExpanded);
                const btnText = expandBtn.querySelector('.btn-text');
                const icon = expandBtn.querySelector('.chevron-icon');
                
                if (btnText) {
                    btnText.textContent = isExpanded ? 'Ver menos' : 'Ver más';
                }
                if (icon) {
                    icon.style.transform = isExpanded ? 'rotate(180deg)' : '';
                }
                
                // Scroll suave cuando colapsamos
                if (!isExpanded && section.getBoundingClientRect().top < 0) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    };

    // --- INICIALIZACIÓN --- 
    loadClasses();
    loadUpdates();
    handleSmartNotification();
    initCarousel('hero-carousel', { autoplay: true, autoplayInterval: 3000 });
    initGuiaVisual();
    initInteractivePrompt();
    initCollapsiblePrompt();
    initNavMenu();
    initScrollBehaviors();
    initMisc();
    initProductExpansion();
});
