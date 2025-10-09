// Función para manejar el tema
function initTheme() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Obtener tema guardado o usar preferencia del sistema
    const savedTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Actualizar botón activo
    themeButtons.forEach(btn => {
        if(btn.dataset.theme === savedTheme) {
            btn.classList.add('active');
        }
    });

    // Event listeners para los botones
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            // Actualizar botones
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Función para manejar secciones expandibles
function initExpandableSections() {
    const sections = document.querySelectorAll('.expandable-section');
    
    sections.forEach(section => {
        const header = section.querySelector('.expandable-header');
        const content = section.querySelector('.expandable-content');
        
        if (header && content) {
            header.addEventListener('click', () => {
                const isExpanded = section.classList.contains('expanded');
                section.classList.toggle('expanded');
                
                // Actualizar ARIA attributes
                header.setAttribute('aria-expanded', !isExpanded);
            });
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initExpandableSections();
});