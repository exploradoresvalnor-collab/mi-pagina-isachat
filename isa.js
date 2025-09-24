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

    loadClasses();

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
        const navLinksForScroll = qsa('.nav-menu .nav-link');
        const sections = navLinksForScroll.map(l => qs(l.getAttribute('href'))).filter(Boolean);
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
    initInteractivePrompt();
    initCollapsiblePrompt();
    initNavMenu();
    initScrollBehaviors();
    initMisc();
});