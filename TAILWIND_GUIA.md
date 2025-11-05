# 🎨 Tailwind CSS - Guía de Uso para IsaChat

## ✅ Instalación Completada

Tailwind CSS ha sido instalado y configurado en tu proyecto.

---

## 🚀 Comandos Disponibles

### Desarrollo:
```bash
# Compilar Tailwind y ver cambios en tiempo real
npm run watch:tailwind

# Servidor de desarrollo (incluye watch de Tailwind)
npm run dev
```

### Producción:
```bash
# Build de Tailwind minificado
npm run build:tailwind

# Build completo (Tailwind + CSS + JS)
npm run build
```

---

## 📝 Cómo Usar Tailwind en tu HTML

### 1. Agregar el CSS compilado al HTML

En `index.html`, agrega **ANTES** de tu CSS actual:

```html
<head>
    <!-- Tailwind CSS -->
    <link rel="stylesheet" href="css/tailwind.css">
    
    <!-- Tu CSS personalizado -->
    <link rel="stylesheet" href="css/main.css">
</head>
```

### 2. Usar las clases de Tailwind

#### Ejemplo - Botón Hero:

**Antes (solo tu CSS):**
```html
<button class="btn-hero">Empezar Ahora</button>
```

**Ahora (con Tailwind):**
```html
<!-- Opción 1: Clase personalizada -->
<button class="btn-isa">Empezar Ahora</button>

<!-- Opción 2: Clases de utilidad -->
<button class="bg-isa-purple hover:bg-isa-purple-600 text-white px-8 py-4 
               rounded-lg shadow-isa hover:shadow-isa-lg transform hover:scale-105 
               transition-all duration-300">
    Empezar Ahora
</button>
```

---

## 🎨 Clases Personalizadas Creadas para IsaChat

Ya tienes estas clases listas para usar:

### Botones:
```html
<button class="btn-isa">Botón Principal</button>
<button class="btn-isa-outline">Botón Outline</button>
<button class="btn-isa-pink">Botón Rosa</button>
```

### Cards:
```html
<div class="card-isa">Card normal</div>
<div class="card-isa-hover">Card con hover effect</div>
```

### Containers:
```html
<div class="container-isa">Contenedor centrado</div>
```

### Gradientes:
```html
<div class="gradient-isa">Gradiente morado a rosa</div>
<h1 class="text-gradient-isa">Texto con gradiente</h1>
```

### Secciones:
```html
<section class="section-isa">Sección con padding responsive</section>
```

---

## 🎯 Colores de IsaChat Disponibles

### Morado (isa-purple):
```html
<div class="bg-isa-purple">Morado principal</div>
<div class="bg-isa-purple-500">Morado medio</div>
<div class="bg-isa-purple-700">Morado oscuro</div>
<div class="text-isa-purple">Texto morado</div>
```

### Rosa (isa-pink):
```html
<div class="bg-isa-pink">Rosa principal</div>
<div class="bg-isa-pink-500">Rosa medio</div>
<div class="text-isa-pink">Texto rosa</div>
```

---

## 💡 Ejemplos Prácticos

### Hero Section con Tailwind:

```html
<section class="gradient-isa min-h-screen flex items-center justify-center">
    <div class="container-isa">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- Contenido -->
            <div class="space-y-6 text-white">
                <h1 class="text-5xl lg:text-7xl font-bold leading-tight">
                    IsaChat
                </h1>
                <p class="text-xl lg:text-2xl opacity-90">
                    Automatiza tu WhatsApp Business con IA
                </p>
                <div class="flex gap-4">
                    <button class="btn-isa">Empezar Gratis</button>
                    <button class="btn-isa-outline bg-white/10 backdrop-blur-isa">
                        Ver Demo
                    </button>
                </div>
            </div>
            
            <!-- Imagen -->
            <div class="animate-float">
                <img src="assets/images/isotipoIsa.svg" 
                     alt="IsaChat" 
                     class="w-full max-w-md mx-auto">
            </div>
        </div>
    </div>
</section>
```

### Cards de Características:

```html
<div class="grid md:grid-cols-3 gap-8">
    <div class="card-isa-hover">
        <div class="w-16 h-16 bg-isa-purple/10 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-isa-purple">...</svg>
        </div>
        <h3 class="text-xl font-bold mb-2 text-gray-800">Automatización 24/7</h3>
        <p class="text-gray-600">Responde automáticamente a tus clientes</p>
    </div>
    
    <!-- Más cards... -->
</div>
```

### Navbar Responsive:

```html
<nav class="fixed w-full backdrop-blur-isa bg-white/80 shadow-lg z-50">
    <div class="container-isa">
        <div class="flex items-center justify-between h-20">
            <!-- Logo -->
            <div class="text-2xl font-bold text-gradient-isa">IsaChat</div>
            
            <!-- Links Desktop -->
            <div class="hidden md:flex items-center gap-8">
                <a href="#funciones" class="text-gray-700 hover:text-isa-purple transition">
                    Funciones
                </a>
                <a href="#precios" class="text-gray-700 hover:text-isa-purple transition">
                    Precios
                </a>
                <button class="btn-isa">Empezar</button>
            </div>
            
            <!-- Hamburger Móvil -->
            <button class="md:hidden">
                <svg class="w-6 h-6">...</svg>
            </button>
        </div>
    </div>
</nav>
```

---

## 🎨 Clases de Utilidad Más Útiles

### Espaciado:
```html
<div class="p-4">padding: 1rem</div>
<div class="px-8 py-4">padding horizontal 2rem, vertical 1rem</div>
<div class="m-4">margin: 1rem</div>
<div class="space-y-6">gap vertical entre hijos</div>
```

### Layout:
```html
<div class="flex items-center justify-between">Flexbox</div>
<div class="grid grid-cols-3 gap-4">Grid 3 columnas</div>
<div class="hidden md:block">Oculto en móvil, visible en desktop</div>
```

### Tamaños:
```html
<div class="w-full">width: 100%</div>
<div class="max-w-7xl mx-auto">Max width con centrado</div>
<div class="h-screen">height: 100vh</div>
```

### Responsive:
```html
<div class="text-base md:text-lg lg:text-xl">
    Texto responsive (aumenta en pantallas grandes)
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    1 columna móvil, 2 tablet, 3 desktop
</div>
```

---

## 🔥 Próximos Pasos

1. **Compila Tailwind**:
   ```bash
   npm run build:tailwind
   ```

2. **Agrega el CSS al HTML**:
   ```html
   <link rel="stylesheet" href="css/tailwind.css">
   ```

3. **Prueba las clases**:
   - Empieza con `btn-isa`, `card-isa`, `container-isa`
   - Luego experimenta con las clases de utilidad

4. **Modo desarrollo**:
   ```bash
   npm run dev
   ```
   Los cambios se recompilarán automáticamente

---

## 📚 Documentación Oficial

- **Tailwind Docs**: https://tailwindcss.com/docs
- **Tailwind Play** (probar online): https://play.tailwindcss.com

---

## 🎯 Tips Importantes

1. **No elimines tu CSS actual** - Tailwind se complementa con él
2. **Usa clases de utilidad para cosas simples** (margins, colors, flex)
3. **Crea componentes personalizados** para elementos complejos (ya están en `tailwind-input.css`)
4. **El orden importa** - Tailwind primero, tu CSS después en el HTML

---

**¡Tailwind está listo! Ahora ejecuta `npm install` y luego `npm run build:tailwind`** 🚀
