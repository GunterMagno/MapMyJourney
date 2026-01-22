# FASE 4: Responsive Design & Layouts

## 4.1 Estrategia Mobile-First

### 4.1.1 Principio Fundamental

**Mobile-First significa:**
1. **CSS base es para móviles** - Todos los estilos sin media queries aplican a dispositivos pequeños (320px)
2. **Min-width media queries** - Se agregan puntos de quiebre hacia arriba para tablets y desktops
3. **Progressive enhancement** - Funcionalidad base funciona en móvil, mejoras visuales en pantallas más grandes

**Flujo de implementación:**
```
Móvil (320px base)
  ↓ [media (min-width: 375px)]
Móvil estándar (375px)
  ↓ [media (min-width: 768px)]
Tablet (768px)
  ↓ [media (min-width: 1024px)]
Desktop (1024px)
  ↓ [media (min-width: 1280px)]
Large Desktop (1280px+)
```

### 4.1.2 Breakpoints Cubiertos

| Dispositivo | Ancho | Variables CSS | Uso |
|-------------|-------|---------------|-----|
| Móvil pequeño | 320px | Base | Pantalla mínima soportada |
| Móvil estándar | 375px | @media (min-width: var(--breakpoint-tablet)) | iPhone estándar, Samsung S10 |
| Tablet | 768px | @media (min-width: var(--breakpoint-tablet)) | iPad mini, tablets comunes |
| Desktop pequeño | 1024px | @media (min-width: var(--breakpoint-desktop)) | Laptops, desktops estándar |
| Desktop estándar | 1280px | @media (min-width: var(--breakpoint-large-desktop)) | Desktops con resolución mayor |

### 4.1.3 Implementación en MapMyJourney

**Ejemplo: Login/Landing Page**

Móvil (320px base - Stack vertical):
```scss
.login-page {
  padding: var(--spacing-3);  // Mínimo para 320px
}

.login-page__container {
  grid-template-columns: 1fr;  // 1 columna
  gap: var(--spacing-6);
}

.login-page__branding {
  display: none;  // Oculto en móvil
}

.login-page__form-section {
  padding: var(--spacing-6);
}
```

Tablet (768px - Optimizaciones de espacio):
```scss
@media (min-width: var(--breakpoint-tablet)) {
  .login-page__form-section {
    padding: var(--spacing-10);  // Padding más generoso
  }
  
  .login-page__form-title {
    font-size: var(--font-size-tittle-h2);  // Títulos más grandes
  }
}
```

Desktop (1024px - Layout 2 columnas):
```scss
@media (min-width: var(--breakpoint-desktop)) {
  .login-page__container {
    grid-template-columns: 1fr 1fr;  // 2 columnas
  }
  
  .login-page__branding {
    display: flex;  // Mostrar branding
  }
}
```

---

## 4.2 Container Queries (CSS Moderno)

### 4.2.1 ¿Qué son Container Queries?

Container Queries permiten que un componente **se adapte según el ancho de su contenedor padre**, no el viewport. Esto es revolucionario para componentes reutilizables que aparecen en diferentes contextos.

**Diferencia clave:**
- **Media Queries**: Adaptan el contenido según el ancho de la pantalla (viewport-dependent)
- **Container Queries**: Adaptan el contenido según el ancho disponible (container-dependent)

**Caso de uso perfecto en MapMyJourney:**
El componente `app-card` (tarjeta de viaje) aparece en:
- Dashboard: En grid de 1 columna (móvil) → 3-4 columnas (desktop)
- Cada contexto tiene un ancho diferente para la tarjeta
- Con Container Queries, la tarjeta se adapta automáticamente sin necesidad de variantes diferentes

### 4.2.2 Implementación en app-card

**Estructura HTML:**
```html
<article [class]="getCardClasses()">
  <!-- Imagen (se adapta según contenedor) -->
  <section class="card__image" *ngIf="image">
    <img [src]="image" [alt]="title" class="card__image-element">
  </section>

  <!-- Contenido (layout ajustado según contenedor) -->
  <section class="card__content">
    <h3 class="card__title">{{ title }}</h3>
    <p class="card__description">{{ description }}</p>
    <footer class="card__footer">
      <ng-content></ng-content>
    </footer>
  </section>
</article>
```

**Estructura SCSS con Container Queries:**

```scss
// ============================================================================
// CONTENEDOR PADRE (Define context de Container Queries)
// ============================================================================
.card-container {
  container-type: inline-size;  // CRUCIAL: Habilita container queries
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

// ============================================================================
// TARJETA BASE (Mobile-First)
// ============================================================================
.card {
  display: flex;
  flex-direction: column;  // Stack vertical por defecto
  border-radius: var(--border-radius-medium);
  background-color: var(--bg-elevated);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  
  // ========================================================================
  // CONTAINER QUERIES: Layout adapta al ancho del contenedor
  // ========================================================================
  
  // Muy pequeño: < 280px (ultra-compacto)
  @container (max-width: 280px) {
    min-height: auto;
    
    .card__image { height: 120px; }
    .card__title { font-size: var(--font-size-small); }
    .card__description { 
      -webkit-line-clamp: 1;
      font-size: var(--font-size-extra-small);
    }
  }
  
  // Pequeño: 280px - 300px
  @container (min-width: 280px) and (max-width: 300px) {
    min-height: auto;
    
    .card__image { height: 150px; }
    .card__title { font-size: var(--font-size-tittle-h4); }
    .card__description { 
      -webkit-line-clamp: 2;
      font-size: var(--font-size-small);
    }
  }
  
  // Mediano: 300px - 500px (vertical normal)
  @container (min-width: 300px) and (max-width: 500px) {
    min-height: 480px;
    
    .card__image { height: 200px; }
    .card__title { font-size: var(--font-size-tittle-h4); }
    .card__description { 
      -webkit-line-clamp: 3;
      font-size: var(--font-size-medium);
    }
  }
  
  // Grande: 500px - 700px (horizontal emerge)
  @container (min-width: 500px) {
    flex-direction: row;  // CAMBIO CLAVE: Pasa a horizontal
    min-height: 300px;
    
    .card__image {
      width: 280px;
      height: auto;
      min-height: 300px;
      flex-shrink: 0;
    }
    
    .card__content {
      flex: 1;
      padding: var(--spacing-6);
    }
    
    .card__title { font-size: var(--font-size-tittle-h3); }
  }
  
  // Muy grande: >= 700px (horizontal optimizado)
  @container (min-width: 700px) {
    flex-direction: row;
    min-height: 350px;
    
    .card__image {
      width: 340px;
      min-height: 350px;
    }
    
    .card__content {
      padding: var(--spacing-8);
      gap: var(--spacing-4);
    }
    
    .card__title { font-size: var(--font-size-tittle-h2); }
    .card__description { 
      -webkit-line-clamp: 5;
      font-size: var(--font-size-medium);
    }
  }
}
```

**Ventajas clave:**
1. **Componente verdaderamente reutilizable** - Mismo código, diferentes layouts según contexto
2. **No necesita variantes** - No hay `card-small`, `card-large`, etc.
3. **Flexible** - Funciona en cualquier grid (1, 2, 3, 4+ columnas)
4. **Responsivo sin media queries adicionales** - El contenedor se adapta automáticamente

**Soporte de navegadores:**
- Chrome/Edge 105+
- Firefox 111+
- Safari 16+
- Fallback: Media queries para navegadores antiguos

---

## 4.3 Layouts de Páginas Completas

### 4.3.1 A. Login / Landing Page

**Objetivo:** Diferente layout vertical (móvil) vs 2 columnas (desktop)

**Móvil (320px - 767px):**
```
┌─────────────────────────────┐
│                             │
│    Logo & Branding          │ (Oculto)
│    (No se muestra)          │
│                             │
├─────────────────────────────┤
│                             │
│  Título: "Únete a ..."      │
│  Email input                │
│  Password input             │
│  Login button               │
│  O Botones sociales         │
│                             │
└─────────────────────────────┘
```

**Desktop (1024px+):**
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ┌──────────────────┐ ┌──────────────────┐     │
│  │                  │ │                  │     │
│  │   Branding       │ │   Formulario     │     │
│  │   + Features     │ │   + Campos       │     │
│  │   (Lado izq.)    │ │   (Lado der.)    │     │
│  │                  │ │                  │     │
│  └──────────────────┘ └──────────────────┘     │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### 4.3.2 B. Dashboard (Mis Viajes)

**Objetivo:** Grid responsivo que crece de 1 → 2 → 3-4 columnas

**Móvil (320px - 767px):**
- 1 columna de tarjetas
- Filtros apilados verticalmente
- Padding y spacing reducido

**Tablet (768px - 1023px):**
- 2 columnas de tarjetas
- Filtros en 2 columnas
- Padding optimizado

**Desktop (1024px+):**
- 3-4 columnas automáticas (usando `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`)
- Filtros horizontales
- Padding generoso

**Técnica `grid-auto-fit` explicada:**
```scss
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));

// Significa:
// - repeat(auto-fit, ...): Crea tantas columnas como quepan
// - minmax(280px, 1fr): Mínimo 280px, máximo lo disponible
// - Resultado: En 1024px (3 cols) y 1280px (4 cols) automáticamente
```

---

### 4.3.3 C. Detalle de Viaje (Vista Compleja con Sidebar)

**Desafío:** El sidebar debe ocultarse en móvil (como hamburguesa) y estar fijo en desktop

**Móvil (320px - 767px) - Hamburguesa Off-Canvas:**
- Sidebar oculto por defecto (`transform: translateX(-100%)`)
- Botón ☰ en top-left (visible siempre)
- Al presionar: sidebar desliza desde la izquierda
- Backdrop oscuro aparece (clickeable para cerrar)
- Clic en link navega y cierra automáticamente

**Desktop (1024px+) - Sidebar Fijo:**
- Sidebar visible en el flujo normal
- Ocupa 20-25% del ancho (width: 20%)
- Main content ocupa 75-80% (flex: 1)
- Sin hamburguesa ni backdrop

**Implementación clave (SCSS):**

```scss
// Móvil
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 80%;
    max-width: 300px;
    height: 100vh;
    z-index: 1000;
    
    transform: translateX(-100%);  // Oculto inicialmente
    transition: transform var(--transition-medium);
    
    &--open {
      transform: translateX(0);  // Abierto
    }
  }
  
  .sidebar-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
    
    opacity: 0;
    visibility: hidden;
    
    &--active {
      opacity: 1;
      visibility: visible;
    }
  }
}

// Desktop
@media (min-width: 1024px) {
  .sidebar {
    position: relative;  // Flujo normal
    width: 20%;
    height: 100vh;
  }
  
  .sidebar-backdrop {
    display: none;  // No se necesita
  }
}
```

---

## 4.4 Tabla Comparativa: Móvil vs Desktop

| Aspecto | Móvil (320px) | Tablet (768px) | Desktop (1024px) | Large (1280px) |
|---------|---------------|----------------|------------------|----------------|
| **Login Page** | Stack vertical 1 col | Stack vertical 1 col | 2 columnas grid | 2 col, max-width |
| **Branding section** | Oculto (display: none) | Oculto | Visible flex | Visible, gap aumentado |
| **Form padding** | spacing-6 | spacing-10 | spacing-12 | spacing-16 |
| **Dashboard grid** | 1 columna | 2 columnas | 3-4 auto-fit | 4 columnas óptimas |
| **Sidebar** | Off-canvas 80% | Horizontal full-width | Fijo 20% izq | Fijo 25% izq |
| **Sidebar toggle** | Visible (☰) | Oculto | Oculto | Oculto |
| **Main padding** | spacing-4 | spacing-8 | spacing-12 | spacing-16 |
| **Main width** | 100% | 100% | 80% | 75% |
| **Card layout** | Vertical apilado | Vertical apilado | Vertical/Horizontal (container-query) | Horizontal optimizado |
| **Font sizes** | Small-medium | Medium | Medium-large | Large |
| **Spacing base** | spacing-3,4 | spacing-4,5 | spacing-6,8 | spacing-8,10 |

---

## 4.5 Justificación Técnica de Decisiones

### ¿Por qué Mobile-First?

1. **Rendimiento** - CSS base es minimal para móvil, media queries agregan complejidad progresivamente
2. **Accesibilidad** - Móvil obliga a diseñadores a priorizar contenido esencial
3. **Mantenibilidad** - Más fácil agregar features hacia arriba que removerlas hacia abajo
4. **Estadísticas** - 60%+ tráfico web viene de móvil

### ¿Por qué Container Queries?

1. **Componentes verdaderamente reutilizables** - `app-card` funciona en cualquier contexto sin variantes
2. **Mejor que media queries** - No depende de viewport, depende de espacio real disponible
3. **Futuro de CSS** - Estándar CSSWG, soporte navegadores mejorando constantemente
4. **Evita prop drilling** - El componente se adapta automáticamente sin @Input adicionales

### ¿Por qué estos breakpoints específicos?

| Breakpoint | Razón |
|-----------|-------|
| 320px | Dispositivo móvil más pequeño soportado |
| 375px | iPhone estándar (X, 12, 13), Samsung S10 |
| 768px | iPad mini, tablets comunes |
| 1024px | iPad Pro 10.5", desktops estándar antiguos |
| 1280px | Laptops comunes (MacBook Air, etc) |

---

## 4.6 Testing y Validación

### 4.6.1 Testing Manual de Breakpoints

**Procedimiento:**
```
1. npm start (inicia servidor dev)
2. Abre DevTools (F12)
3. Device Toolbar (Ctrl+Shift+M)
4. Prueba estos anchos exactos:
   - 320px (Móvil pequeño)
   - 375px (iPhone/Móvil estándar)
   - 768px (Tablet)
   - 1024px (Desktop pequeño)
   - 1280px (Desktop estándar)
   - 1920px (Full HD)
5. Verifica:
   ✓ Layouts cambian correctamente
   ✓ Textos son legibles
   ✓ Botones son clicables
   ✓ Imágenes se ajustan
   ✓ Spacing es apropiado
```

### 4.6.2 Container Queries - Verificación

```
1. Navega a /dashboard (Mis Viajes)
2. DevTools → Elements
3. Inspecciona un `.card-container`
4. Cambia ancho de ventana
5. Observa:
   ✓ Card cambia layout vertical → horizontal automáticamente
   ✓ Imagen cambia tamaño según regla @container
   ✓ Padding y gaps se adaptan
   ✓ Fuente cambia según container-width
```

### 4.6.3 Sidebar Hamburguesa - Verificación (Móvil)

```
1. Navega a página con sidebar (Ej: Detalle de viaje)
2. DevTools → Device Emulation → 375px
3. Verifica:
   ✓ Sidebar NO está visible inicialmente
   ✓ Botón ☰ está en top-left
   ✓ Click en ☰ desliza sidebar desde izquierda
   ✓ Backdrop aparece oscuro
   ✓ Click en backdrop cierra sidebar
   ✓ Click en link de sidebar cierra sidebar automáticamente
```

---

## 4.7 Resumen de Mejoras Fase 4

✅ **Estrategia Mobile-First implementada** en 5 componentes clave
✅ **Container Queries** en `app-card` para máxima flexibilidad
✅ **Breakpoints exactos** en login, dashboard, sidebar
✅ **Hamburguesa off-canvas** en móvil para sidebar
✅ **Grid responsivo** con `auto-fit` en dashboard
✅ **Documentación completa** con ejemplos visuales y código
✅ **CSS Variables** para todos los breakpoints (--breakpoint-tablet, --breakpoint-desktop, --breakpoint-large-desktop)
