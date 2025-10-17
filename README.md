# Mi Página IsaChat

Repositorio del landing page estático de IsaChat.

Cómo usar localmente

- Abrir `index.html` en un navegador moderno (o servir la carpeta con un servidor estático):
  - Python 3: `python -m http.server 8000` y abrir `http://localhost:8000`

Estructura recomendada

- `index.html` — página principal
- `productos.html` — página de productos
- `isa.css`, `productos.css`, `theme.css` — hojas de estilo
- `isa.js`, `productos.js`, `theme.js` — scripts
- `assets/images/` — imágenes optimizadas (copia no destructiva)

Buenas prácticas

- Evitar espacios y tildes en nombres de archivos. Usar kebab-case: `mi-logo.svg`, `mascota-isa.png`.
- Hacer cambios en pasos: crear copias optimizadas, verificar, luego reemplazar rutas y finalmente borrar archivos originales.

Tareas sugeridas

1. Probar el sitio localmente y revisar que no haya rutas rotas.
2. Considerar mover CSS/JS a carpetas `css/` y `js/` cuando el proyecto crezca.
3. Añadir un CI con linters y pruebas de accesibilidad (opcional).

Contacto

- Equipo IsaChat
