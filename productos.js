// Función para inicializar la expansión de productos
function initProductExpansion() {
    const productSections = document.querySelectorAll('.product-section');

    productSections.forEach(section => {
        const expandBtn = section.querySelector('.expand-btn');
        const content = section.querySelector('.product-content');

        if (expandBtn && content) {
            expandBtn.addEventListener('click', () => {
                const isExpanded = expandBtn.getAttribute('aria-expanded') === 'true';
                
                // Actualizar el estado del botón
                expandBtn.setAttribute('aria-expanded', !isExpanded);
                expandBtn.querySelector('.btn-text').textContent = isExpanded ? 'Ver más' : 'Ver menos';
                
                // Alternar la clase de expansión
                section.classList.toggle('expanded');
            });
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initProductExpansion();
});