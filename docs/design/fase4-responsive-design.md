# FASE 4: Responsive Design y Layouts - MapMyJourney

## Índice
1. [Introducción](#introducción)
2. [Estrategia Mobile-First](#estrategia-mobile-first)
3. [Container Queries](#container-queries)
4. [Breakpoints y Media Queries](#breakpoints-y-media-queries)
5. [Archivos Implementados](#archivos-implementados)
6. [Tabla Comparativa de Layouts](#tabla-comparativa-de-layouts)
7. [Mejores Prácticas](#mejores-prácticas)
8. [Casos de Uso](#casos-de-uso)

---

## Introducción

La **FASE 4** se enfoca en implementar una **arquitectura CSS moderna y responsive** que garantice una experiencia óptima en todos los dispositivos, desde móviles (320px) hasta desktops grandes (1400px+).

### Objetivos Principales

✅ **Enfoque Mobile-First**: Diseño base para móviles, enhancements con media queries  
✅ **Container Queries**: Componentes adaptables según su propio ancho, no solo el viewport  
✅ **CSS Grid y Flexbox**: Layout moderno y flexible sin necesidad de frameworks  
✅ **3 Páginas Completas**: Login, Dashboard y Detalle de Viaje con layouts variados  
✅ **Accesibilidad**: Garantizar navegación en todos los dispositivos  

---

## Estrategia Mobile-First

### Concepto

En **Mobile-First**, el CSS base está optimizado para dispositivos móviles, y usamos **media queries con `min-width`** para agregar estilos progresivamente a medida que aumenta el ancho de la pantalla.

```scss
// ❌ NO RECOMENDADO: Desktop-First
@media (max-width: 768px) {
  .container {
    width: 100%;
  }
}

// ✅ RECOMENDADO: Mobile-First
.container {
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    width: 90%;
  }
}
```

### Ventajas

| Ventaja | Descripción |
|---------|------------|
| **Performance** | Móviles cargan menos CSS innecesario |
| **Mantenibilidad** | CSS más limpio y predecible |
| **Progressive Enhancement** | Funciona en navegadores antiguos |
| **Mobile UX** | Optimizado desde el inicio |

---

## Container Queries

### ¿Por qué Container Queries?

Los **media queries tradicionales** adaptan layouts según el **tamaño de la pantalla**, pero los **container queries** adaptan componentes según su **propio ancho de contenedor**.

**Ejemplo práctico**: La tarjeta de viaje puede ser vertical o horizontal dependiendo si está en una columna de 300px o 500px, **sin importar el tamaño de la pantalla**.

### Implementación en `card.component.scss`

```scss
// 1. Definir contenedor
.card-container {
  container-type: inline-size;  // Habilitar container queries
  display: flex;
  flex-direction: column;
  height: 100%;
}

// 2. Usar @container para adaptar el componente
.card {
  // Base: Vertical layout
  display: flex;
  flex-direction: column;

  // PEQUEÑO: < 300px - Layout compacto
  @container (max-width: 300px) {
    min-height: auto;
    .card__image { height: 150px; }
    .card__content { padding: var(--spacing-3); }
  }

  // MEDIANO: 300px - 500px
  @container (min-width: 300px) and (max-width: 500px) {
    min-height: 480px;
    .card__image { height: 200px; }
  }

  // GRANDE: >= 500px - Imagen a un lado
  @container (min-width: 500px) {
    flex-direction: row;  // ¡Cambio de layout!
    .card__image { width: 280px; min-height: 300px; }
  }
}
```

### Ventajas de Container Queries

| Ventaja | Ejemplo |
|---------|---------|
| **Componente independiente** | Card funciona en cualquier grid |
| **Reutilizable** | Mismo componente en sidebar (300px) o main (800px) |
| **No depende de viewport** | Funciona sin saber el tamaño de la pantalla |
| **Futuro del CSS** | Estándar emergente en navegadores modernos |

---

## Breakpoints y Media Queries

### Variables de Breakpoints Definidas

```scss
:root {
  --breakpoint-mobile: 640px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --breakpoint-large-desktop: 1280px;
}
```

### Mixin para Media Queries

```scss
@mixin media_query($size) {
  @if $size == sm {
    @media (min-width: var(--breakpoint-mobile)) { @content; }
  } @else if $size == md {
    @media (min-width: var(--breakpoint-tablet)) { @content; }
  } @else if $size == lg {
    @media (min-width: var(--breakpoint-desktop)) { @content; }
  } @else if $size == xl {
    @media (min-width: var(--breakpoint-large-desktop)) { @content; }
  }
}
```

### Uso del Mixin

```scss
.dashboard__grid {
  grid-template-columns: 1fr;  // Móvil: 1 columna

  @include media_query(md) {
    grid-template-columns: repeat(2, 1fr);  // Tablet: 2 columnas
  }

  @include media_query(lg) {
    grid-template-columns: repeat(3, 1fr);  // Desktop: 3 columnas
  }

  @include media_query(xl) {
    grid-template-columns: repeat(4, 1fr);  // Large: 4 columnas
  }
}
```

---

## Archivos Implementados

### 1. **Login / Landing Page**
**Ubicación**: `frontend/src/app/components/pages/login/`

**Archivos**:
- `login.html` - Template HTML
- `login.component.ts` - Componente Angular (Standalone)
- `login.scss` - Estilos responsive

**Características**:
- Layout vertical en móvil (stack)
- Layout 2 columnas en desktop (branding + form)
- Formularios de login y registro con validación
- Botones de login social
- Animaciones de slide-up y fade-in

**Breakpoints**:
```
Móvil (< 768px):    Stack vertical, form a pantalla completa
Tablet (768px+):    Espaciado mejorado, padding aumentado
Desktop (1024px+):  Layout 2 columnas, max-width 1000px
Large (1280px+):    Max-width 1200px, spacing aumentado
```

### 2. **Dashboard - Mis Viajes**
**Ubicación**: `frontend/src/app/components/pages/dashboard/`

**Archivos**:
- `dashboard.html` - Template HTML con grid responsivo
- `dashboard.component.ts` - Lógica de filtrado y búsqueda
- `dashboard.scss` - Grid adaptativo

**Características**:
- Grid responsivo con `grid-template-columns: repeat(auto-fit, minmax())`
- Filtros y búsqueda en tiempo real (debouncing)
- Empty state cuando no hay viajes
- Estadísticas (desktop only)
- Container queries en tarjetas

**Grid Layout**:
```
Móvil (< 768px):      1 columna
Tablet (768px+):      2 columnas
Desktop (1024px+):    3 columnas (auto-fit minmax 280px)
Large (1280px+):      4 columnas (auto-fit minmax 300px)
```

### 3. **Trip Detail - Página Compleja**
**Ubicación**: `frontend/src/app/components/pages/trip-detail/`

**Archivos**:
- `trip-detail.html` - Layout complejo con sidebar
- `trip-detail.component.ts` - Gestión de secciones y datos
- `trip-detail.scss` - Layout sidebar + main con grid

**Características**:
- **Móvil**: Sidebar como drawer (menú hamburguesa)
- **Desktop**: Sidebar fijo a la izquierda
- 4 secciones principales:
  1. **Itinerario**: Timeline de días con actividades
  2. **Votaciones**: Cards con opciones y gráficos
  3. **Documentos**: Lista de archivos con descarga
  4. **Gastos**: Resumen y desglose de gastos

**Layout Grid Desktop**:
```scss
.trip-detail {
  grid-template-columns: 280px 1fr;  // Sidebar fijo + contenido
  grid-template-rows: auto;
}
```

**Estados del Sidebar**:
```
Móvil:     Drawer (position: fixed, transform: translateX(-100%))
           Overlay oscuro al abrirlo
Tablet+:   Visible por defecto (position: static)
Desktop:   Sticky a la izquierda (position: sticky)
```

---

## Tabla Comparativa de Layouts

### 1. LOGIN PAGE

| Aspecto | Móvil (320px) | Tablet (768px) | Desktop (1024px) | Large (1280px) |
|---------|---------------|----------------|------------------|----------------|
| **Layout** | 1 columna | 1 columna | 2 columnas | 2 columnas |
| **Branding** | Oculto | Oculto | Visible | Visible |
| **Ancho máx** | 100% | 100% | 1000px | 1200px |
| **Padding** | 16px | 24px | 32px | 48px |
| **Formulario** | Full width | Full width | ~500px | ~500px |
| **Título H1** | 42px | 42px | 68px | 68px |

### 2. DASHBOARD

| Aspecto | Móvil | Tablet | Desktop | Large |
|---------|-------|--------|---------|-------|
| **Grid Tarjetas** | 1 col | 2 col | 3 col (280px) | 4 col (300px) |
| **Filtros Layout** | Stack | 2 col | Inline | Inline |
| **Estadísticas** | Ocultas | 2 col grid | 4 col grid | 4 col grid |
| **Padding** | 24px | 32px | 40px | 48px |
| **Gap** | 24px | 32px | 40px | 48px |

### 3. TRIP DETAIL

| Aspecto | Móvil | Tablet | Desktop | Large |
|---------|-------|--------|---------|-------|
| **Sidebar** | Drawer | Visible | Sticky (280px) | Sticky (320px) |
| **Grid Cols** | 1 | 1 | 280px + 1fr | 320px + 1fr |
| **Menú Hamburgesa** | ✓ Visible | ✗ Oculto | ✗ Oculto | ✗ Oculto |
| **Votaciones Grid** | 1 col | 1 col | 2 col | 2 col |
| **Gastos Grid** | 1 col | 2 col | 2 col | 3 col |
| **Timeline** | Completo | Completo | Max 900px | Max 1000px |

---

## Mejores Prácticas Implementadas

### 1. **Nombrado de Clases (BEM)**
```scss
.trip-detail__sidebar { }        // Bloque
.trip-detail__sidebar-title { }  // Elemento
.trip-detail__sidebar--open { }  // Modificador
```

### 2. **CSS Variables para Tema**
```scss
color: var(--text-main);
background: var(--bg-surface);
border: 1px solid var(--border-color);
padding: var(--spacing-6);
```

### 3. **Transiciones y Animaciones**
```scss
transition: all var(--transition-fast);  // 0.2s
transform: translateX(-100%);  // Performance con GPU
animation: slideUp 0.6s ease-out;
```

### 4. **Accesibilidad**
```html
<button (click)="toggleMenu()" [attr.aria-expanded]="isOpen">
  Menu
</button>

<nav role="navigation" aria-label="Navegación principal">
  ...
</nav>
```

### 5. **Performance**
- ✅ `position: sticky` en sidebar en lugar de `fixed`
- ✅ `transform: translateX()` para animaciones (GPU acceleration)
- ✅ `grid-template-columns: repeat(auto-fit, minmax())` para grids dinámicos
- ✅ `contain: layout paint` para optimización en componentes aislados

---

## Casos de Uso

### Caso 1: Tarjeta en Grid Responsivo
```html
<!-- Dashboard -->
<div class="dashboard__trips-grid">
  <div class="card-container">
    <app-card [title]="trip.name" [image]="trip.image">
      <!-- Card se adapta automáticamente -->
    </app-card>
  </div>
</div>
```

**Comportamiento**:
- Móvil (1 col × 400px): Card es vertical
- Tablet (2 col × 360px): Card es vertical
- Desktop (3 col × 280px): Card es vertical
- Desktop (4 col × 300px): Card es horizontal (container query)

### Caso 2: Sidebar Responsivo en Trip Detail
```html
<!-- Desktop: Sidebar visible -->
<div class="trip-detail">
  <aside class="trip-detail__sidebar">
    <!-- Navegación -->
  </aside>
  <main class="trip-detail__main">
    <!-- Contenido -->
  </main>
</div>
```

**CSS Grid**:
- Móvil: `grid-template-columns: 1fr` (overlay drawer)
- Desktop: `grid-template-columns: 280px 1fr` (sidebar fijo)

### Caso 3: Form Responsive en Login
```html
<!-- Móvil: Stack vertical -->
<form class="login-page__form">
  <app-form-input ... />  <!-- 100% width -->
  <app-form-input ... />
  <app-button ... />      <!-- Full width -->
</form>
```

**Desktop**: Misma estructura, pero con padding mayor y centered

---

## Testing Responsive

### Checklist de Validación

- [ ] **Móvil (320px - 480px)**
  - [ ] Texto legible (min 16px)
  - [ ] Botones tocables (min 44px height)
  - [ ] Sin overflow horizontal
  - [ ] Menú hamburguesa visible

- [ ] **Tablet (768px - 1024px)**
  - [ ] Grid de 2 columnas
  - [ ] Sidebar visible
  - [ ] Filtros en 2 columnas
  - [ ] Espaciado adecuado

- [ ] **Desktop (1024px+)**
  - [ ] Grid de 3+ columnas
  - [ ] Sidebar sticky
  - [ ] Máximo ancho respetado
  - [ ] Hover effects funcionales

### Herramientas de Testing

```bash
# Chrome DevTools
1. F12 → Device Toolbar
2. Testear en 320px, 768px, 1024px, 1400px

# Responsively App (recomendado)
https://responsively.app/

# SCSS Compilation
npm run build:styles

# Production Check
npm run build
```

---

## Próximas Fases

Esta Fase 4 sienta las bases para:
- **FASE 5**: HTTP Requests y Consumo de APIs
- **FASE 6**: Dark Mode y Temas dinámicos
- **FASE 7**: Animaciones avanzadas y transiciones de ruta

---

## Referencias y Recursos

### Documentación
- [MDN: CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [MDN: Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [Container Queries Spec](https://drafts.csswg.org/container-queries/)
- [A List Apart: Mobile First](https://alistapart.com/article/mobilefirst/)

### Herramientas
- [Can I Use - Container Queries](https://caniuse.com/css-container-queries)
- [Chrome DevTools Device Emulation](https://developer.chrome.com/docs/devtools/device-mode/)
- [Sass Documentation](https://sass-lang.com/documentation)

---

**Fecha de implementación**: 2024  
**Versión**: 1.0  
**Última actualización**: Enero 2026
