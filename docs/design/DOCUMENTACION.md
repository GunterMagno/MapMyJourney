# MapMyJourney - Documentación de la Arquitectura CSS

## 1. Arquitectura CSS y Comunicación Visual

### 1.1 Principios de Comunicación Visual

Este proyecto aplica los 5 principios fundamentales de diseño visual para crear una interfaz coherente y fácil de usar:

#### 1.1.1 Jerarquía Visual

La jerarquía se establece mediante el uso de diferentes tamaños, pesos y espaciados:

**Escala Tipográfica:**
- **H1 (68px)**: Títulos principales de páginas (`--font-size-tittle-h1`)
- **H2 (42px)**: Secciones importantes (`--font-size-tittle-h2`)
- **H3 (26px)**: Subsecciones (`--font-size-tittle-h3`)
- **H4 (20px)**: Títulos de tarjetas/componentes (`--font-size-tittle-h4`)
- **Body (16px)**: Texto principal (`--font-size-medium`)
- **Small (14px)**: Texto secundario (`--font-size-small`)
- **Extra Small (12px)**: Metadata/etiquetas (`--font-size-extra-small`)

**Pesos de Fuente:**
- **Bold (700)**: Títulos principales y llamadas a la acción
- **Semibold (600)**: Subtítulos y elementos destacados
- **Medium (500)**: Navegación y elementos interactivos
- **Regular (400)**: Texto normal

**Espaciado:**
Utilizamos una escala modular de 0.25rem desde 0.25 hasta 6 rem

#### 1.1.2 Contraste

El contraste se logra mediante:

**Contraste de Color:**
- Paleta primaria y secundaria para destacar elementos clave
- Color de texto principal: quinary-color-hover (#0F7CA0) para máximo contraste
- Colores semánticos (verde para éxito, rojo para error) para comunicar estados
- Alto contraste entre texto y fondo

**Contraste de Tamaño:**
- Títulos (H1-H4) significativamente más grandes que el body
- Elementos interactivos con tamaño diferenciado respecto al texto pasivo
- Espaciado generoso alrededor de elementos destacados

**Contraste de Peso:**
- Títulos en Bold (700) o Semibold (600)
- Texto normal en Regular (400) o Medium (500)
- Elementos destacados en Semibold (600)
- Metadata en Regular (400) o Light

#### 1.1.3 Alineación

**Sistema de Grid:**
- Grid de 6 columnas en desktop (repeat(6, 1fr))
- Grid de 3 columnas en tablet (≤768px)
- Grid de 1 columna en móvil (≤640px)

**Alineación de Contenido:**
- Contenido principal centrado con `.container` (max-width: 1024px)
- Alineación a la izquierda para bloques de texto (mejor legibilidad)
- Centrado vertical/horizontal con `.flex--center` para elementos destacados

#### 1.1.4 Proximidad

**Agrupación de Elementos:**
- Elementos relacionados tienen gaps pequeños (--spacing-4: 1rem)
- Secciones independientes separadas con gaps mayores (--spacing-6: 1.5rem)
- Espaciado entre secciones de página (--spacing-12 ... --spacing-16)

**Sistema de Espaciado:**

- Relacionado: 4-8px (spacing-1 a spacing-2)
- Normal: 16-24px (spacing-4 a spacing-6)
- Sección: 48-64px (spacing-12 a spacing-16)


#### 1.1.5 Repetición

**Patrones Consistentes:**
- Border radius consistente: small (10px), medium (20px), full (9999px)
- Transiciones uniformes: fast (0.2s), medium (0.4s), slow (0.6s)
- Sombras escaladas: sm, md, lg, xl
- Paleta de colores limitada y repetida en toda la aplicación

---

### 1.2 Metodología CSS: BEM

**¿Por qué BEM?**
- **Claridad**: Los nombres de clase son autoexplicativos
- **Modularidad**: Los componentes son independientes y reutilizables
- **Escalabilidad**: Fácil de mantener en proyectos grandes
- **Sin conflictos**: La especificidad es baja y predecible

**Nomenclatura:**

BEM divide los componentes en tres partes:

- **Bloque** (Block): Componente independiente reutilizable
  - Ejemplo: `.card`, `.button`, `.navigation`
  - Nombre en minúsculas, puede incluir guiones

- **Elemento** (Element): Parte del bloque que no puede existir independientemente
  - Sintaxis: `.block__element`
  - Ejemplo: `.card__title`, `.card__image`, `.button__icon`
  - Separados por doble guion bajo `__`

- **Modificador** (Modifier): Variación o estado de un bloque o elemento
  - Sintaxis: `.block--modifier` o `.block__element--modifier`
  - Ejemplo: `.button--primary`, `.card--featured`, `.button__text--bold`
  - Separados por doble guion `-`

**Ejemplos prácticos:**

```html
<!-- Bloque card básico -->
<div class="card">
  <h3 class="card__title">Título</h3>
  <p class="card__description">Descripción del viaje</p>
  <button class="card__button card__button--cta">Ver más</button>
</div>

<!-- Card destacado (modificador) -->
<div class="card card--featured">
  <h3 class="card__title card__title--large">Viaje Destacado</h3>
  <p class="card__description">Descripción especial</p>
  <button class="card__button card__button--primary">Descubrir</button>
</div>

<!-- Botón en diferentes estados -->
<button class="button button--primary">Enviar</button>
<button class="button button--secondary">Cancelar</button>
<button class="button button--disabled">Deshabilitado</button>
```

**Ventajas en nuestro proyecto:**
- Los nombres de clase son autodescriptivos: no necesitas ver el HTML para entender la estructura
- Fácil localizar estilos: busca `.card` para encontrar todos los estilos del componente
- Evita especificidad innecesaria: todas las clases tienen la misma especificidad

---

### 1.3 Organización de Archivos

**Estructura:**

```
frontend/src/styles/
├── 00-settings/          # Variables, tokens, configuración
│   └── _variables.scss   # Design tokens (colores, tipografía, espaciado)
│
├── 01-tools/             # Mixins y funciones
│   └── _mixins.scss      # Utilidades reutilizables
│
├── 02-generic/           # Resets y normalización
│   └── _reset.scss       # Reset CSS minimalista
│
├── 03-elements/          # Estilos de elementos HTML base
│   └── _base.scss        # Tipografía base sin clases
│
└── 04-layout/            # Sistemas de layout
    └── _layout.scss      # Grid, flex, container
```

**¿Por qué este orden?**

1. **Settings (Configuración)**: Variables globales que se usan en todo el proyecto. No genera CSS, solo define valores.

2. **Tools (Herramientas)**: Mixins y funciones. No genera CSS, solo código reutilizable.

3. **Generic (Genérico)**: Resets y normalización. Bajo nivel de especificidad, afecta a todos los elementos.

4. **Elements (Elementos)**: Estilos para elementos HTML sin clases (`h1`, `p`, `a`). Especificidad baja.

5. **Layout (Estructura)**: Sistemas de posicionamiento y estructura. Especificidad media.

**Principio de ITCSS:**
- **De lo general a lo específico**
- **De baja a alta especificidad**
- **De alcance amplio a alcance reducido**

---

### 1.4 Sistema de Design Tokens

**Archivo: `src/styles/00-settings/_variables.scss`**

#### Paleta de Colores

**Colores Principales:**
- `--principal-color`: #EF476F (color primario)
- `--secondary-color`: #F37748 (color secundario)
- `--tertiary-color`: #FFD166 (color terciario)
- `--quaternary-color`: #3ECBA6 (color cuaternario)
- `--quinary-color`: #118AB2 (color quinario)

**Variantes de Colores:**
- `-hover`: Versión más oscura para estados hover
- `-disabled`: Versión más clara para estados deshabilitados o fondos

**Colores Semánticos:**
- `--correct-color`: #8DCC52 (éxito)
- `--error-color`: #EB351A (error)
- `--warning-color`: var(--secondary-color) → #F37748 (advertencia)
- `--info-color`: var(--quinary-color) → #118AB2 (información)
- `--text-color`: var(--quinary-color) → #118AB2
- `--dark-color`: #141414 (texto oscuro)

**Modo Oscuro:**
El documento define variantes `.dark-mode` con colores oscurecidos para cada variable

#### Tipografía

**Familias de Fuentes:**
- `--font-primary`: 'Comfortaa' (fuente principal)
- `--font-secondary`: 'NTR' (fuente secundaria)
- `--font-tertiary`: 'Mulish' (fuente para body)

**Tamaños (escala modular con ratio 1.25):**
- `--font-size-extra-small`: 12px
- `--font-size-small`: 14px
- `--font-size-medium`: 16px
- `--font-size-tittle-h4`: 20px
- `--font-size-tittle-h3`: 26px
- `--font-size-tittle-h2`: 42px
- `--font-size-tittle-h1`: 68px

**Pesos:**
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

**Line Heights:**
- Tight: 1.1
- Normal: 1.4
- Relaxed: 1.6

#### Sistema de Espaciado

Escala basada en 4px: desde `$spacing-1` (4px) hasta `$spacing-24` (96px)

#### Breakpoints

- `--breakpoint-mobile`: 640px
- `--breakpoint-tablet`: 768px
- `--breakpoint-desktop`: 1024px
- `--breakpoint-large-desktop`: 1280px

#### Elevaciones (Sombras)

- shadow-sm, shadow-md, shadow-lg, shadow-xl

#### Bordes y Radios

- `--border-thin`: 1px
- `--border-medium`: 2px
- `--border-thick`: 4px
- `--border-radius-small`: 10px
- `--border-radius-medium`: 20px
- `--border-radius-full`: 9999px

#### Transiciones

- `--transition-fast`: 0.2s ease-in-out
- `--transition-medium`: 0.4s ease-in-out
- `--transition-slow`: 0.6s ease-in-out

---

### 1.5 Mixins y Funciones Reutilizables

**Archivo: `src/styles/01-tools/_mixins.scss`**

**Mixin: media_query** - Simplifica media queries por breakpoint
```scss
@mixin media_query($size) { /* ... */ }
// Uso: @include media_query('md') { ... }
// Soporta: sm, md, lg, xl
```

**Mixin: transition** - Agrega transiciones automáticas
```scss
@mixin transition($props: all, $speed: medium) { /* ... */ }
// Uso: @include transition(color, fast);
// Soporta velocidades: fast, medium, slow
```

**Mixin: flex-center** - Centra contenido con flexbox
```scss
@mixin flex-center($gap: var(--spacing-4)) { /* ... */ }
// Uso: @include flex-center(var(--spacing-6));
// Centra items verticalmente y horizontalmente
```

Estos mixins evitan repetir código y mantienen consistencia en toda la aplicación.

---

### 1.6 ViewEncapsulation en Angular

**Estrategia: ViewEncapsulation.Emulated (por defecto)**

Angular encapsula automáticamente los estilos de cada componente, garantizando que:
- Los estilos de un componente no afecten a otros
- Puedas reutilizar nombres de clase sin conflictos
- Sea fácil mantener y eliminar componentes

**Acceso a variables globales:**
Cada componente importa las variables globales en su SCSS:

```scss
@import '../../styles/00-settings/variables';
@import '../../styles/01-tools/mixins';
```

De esta forma, todos los componentes pueden usar `$color-primary-500`, `$spacing-4`, `@include respond-to('md')`, etc.

**Estilos realmente globales:**
El archivo `src/styles.scss` contiene estilos que aplican a toda la aplicación (body, html, resets, etc.)

Esta estrategia proporciona el mejor balance entre aislamiento y reutilización de código.

---

## 2. HTML Semántico y Componentes de Layout

### 2.1 Jerarquía de Headings (h1-h6)

La estructura de headings sigue un orden jerárquico lógico que facilita la navegación y accesibilidad:

**Niveles de Headings:**

- **h1**: Título principal de la página (único por página)
  - Ejemplo: "MapMyJourney" en la página de inicio
  - Uso: Define el tema principal de toda la página
  
- **h2**: Títulos de secciones principales
  - Ejemplo: "Gestión del Viaje" en el sidebar
  - Ejemplo: "Únete a MapMyJourney" en el formulario de registro
  - Uso: Divide el contenido en áreas temáticas principales
  
- **h3**: Subtítulos dentro de secciones
  - Ejemplo: "Itinerario del día 1", "Gastos de transporte"
  - Uso: Organiza subsecciones dentro de una sección h2
  
- **h4**: Títulos de tarjetas o componentes individuales
  - Ejemplo: Título de una tarjeta de viaje, nombre de actividad
  - Uso: Elementos más pequeños dentro de subsecciones
  
- **h5-h6**: Uso ocasional para niveles muy específicos
  - Ejemplo: Subtítulos dentro de descripciones largas
  - Uso: Raramente necesarios, solo en contenido muy estructurado

**Reglas de uso:**
- Nunca saltar niveles (no ir de h2 a h4 sin h3)
- Mantener un solo h1 por página
- Los headings deben describir el contenido que les sigue
- Usar estilos CSS para cambiar apariencia, no el nivel del heading

### 2.2 Elementos Semánticos de Layout

#### 2.2.1 `<header>` - Encabezado Principal

**Ubicación:** `components/layout/header`

**Estructura:**
```html
<header class="header">
  <section class="header__left">
    <a routerLink="/">
      <img src="assets/logo.png" alt="MapMyJourney-Logo" class="header__logo-img">
    </a>
  </section>

  <section class="header__center">
    <ng-content select="[header-content]"></ng-content>
  </section>

  <section class="header__right">
    <button class="header__theme-btn" (click)="toggleTheme()">
      {{ isDarkTheme ? '☀️' : '🌙' }}
    </button>

    <button *ngIf="!isLoggedIn" class="header__btn header__btn--primary" (click)="login()">
      Iniciar Sesión
    </button>
    <button *ngIf="!isLoggedIn" class="header__btn header__btn--secondary" (click)="signup()">
      Registrarse
    </button>

    <button *ngIf="isLoggedIn && showMyTripsBtn" class="header__btn header__btn--primary" (click)="goToTrips()">
      Mis Viajes
    </button>
    <button *ngIf="isLoggedIn && showCreateTripBtn" class="header__btn header__btn--primary" (click)="createTrip()">
      Crear un viaje
    </button>

    <article *ngIf="isLoggedIn" class="header__profile">
      <span class="header__profile-avatar">👤</span>
    </article>
  </section>
</header>
```

**Propósito:** 
- Contiene la navegación principal de la aplicación
- Logo y branding de MapMyJourney
- Acciones globales (login/logout, cambio de tema)

**Elementos clave:**
- `<nav>`: Navegación principal con enlaces a secciones clave
- Enlaces semánticos con `routerLink` de Angular
- Botones de acción claramente identificados

**Justificación:**
El `<header>` es el elemento adecuado porque contiene contenido introductorio y de navegación que se repite en todas las páginas. Los lectores de pantalla y motores de búsqueda reconocen este elemento como el encabezado del sitio.

#### 2.2.2 `<aside>` - Sidebar de Navegación

**Ubicación:** `components/layout/sidebar`

**Estructura:**
```html
<aside class="sidebar" [class.sidebar--collapsed]="isCollapsed">
  <button class="sidebar__toggle" (click)="toggleSidebar()" title="Toggle sidebar">
    {{ isCollapsed ? '→' : '←' }}
  </button>

  <div class="sidebar__header" *ngIf="!isCollapsed">
    <h3 class="sidebar__trip-title">{{ tripTitle }}</h3>
    <p class="sidebar__trip-dates">{{ tripDates }}</p>
  </div>

  <nav class="sidebar__nav">
    <h2 class="sidebar__nav-title" *ngIf="!isCollapsed">Gestión del Viaje</h2>
    <ul class="sidebar__list">
      <li class="sidebar__item">
        <a routerLink="/dashboard" routerLinkActive="active" class="sidebar__link" title="Dashboard">
          <img class="sidebar__icon" src="/assets/images/dashboard-icon.svg" alt="Dashboard">
          <span class="sidebar__label" *ngIf="!isCollapsed">Dashboard</span>
        </a>
      </li>
      <!-- Más items de navegación -->
    </ul>
  </nav>

  <button class="sidebar__chat-btn" title="Chat">
    <img src="/assets/images/chat-icon.svg" alt="Chat">
  </button>
</aside>
```

**Propósito:**
- Navegación secundaria para gestión de viajes
- Accesos rápidos a funcionalidades específicas del contexto
- Contenido complementario al contenido principal

**Estructura:**
```html
<aside class="sidebar">
  <nav>
    <h2>Gestión del Viaje</h2>
    <ul>
      <li><a>Dashboard</a></li>
      <li><a>Itinerario</a></li>
      <!-- más enlaces -->
    </ul>
  </nav>
</aside>
```

**Justificación:**
El elemento `<aside>` representa contenido tangencialmente relacionado con el contenido principal. En nuestro caso, el sidebar proporciona navegación contextual que complementa pero no es esencial para el contenido principal (`<main>`). Es perfecto para menús laterales, widgets y navegación secundaria.

#### 2.2.3 `<nav>` - Navegación

**Uso múltiple:**
- Dentro del `<header>` para navegación principal
- Dentro del `<aside>` para navegación contextual
- En el `<footer>` para enlaces legales

**Propósito:**
- Agrupa conjuntos de enlaces de navegación
- Identifica secciones de navegación para tecnologías asistivas
- Mejora la estructura semántica del documento

**Características:**
- Contiene listas `<ul>` con enlaces `<a>`
- Puede tener un `aria-label` para mayor claridad
- Solo se usa para grupos de navegación importantes

**Justificación:**
`<nav>` es el elemento estándar para secciones de navegación. Los lectores de pantalla pueden identificar y listar todos los elementos `<nav>`, permitiendo a los usuarios saltar rápidamente entre diferentes áreas de navegación.

#### 2.2.4 `<main>` - Contenido Principal

**Ubicación:** `components/layout/main`

**Estructura:**
```html
<main class="main">
  <ng-content></ng-content>
</main>
```

**Propósito:**
- Contiene el contenido principal único de cada página
- Excluye contenido repetido (header, footer, sidebar)
- Usa `<ng-content>` para proyectar contenido dinámico

**Estructura:**
```html
<main class="main">
  <ng-content></ng-content>
</main>
```

**Justificación:**
Debe haber un solo `<main>` por página y debe contener el contenido central. Esto permite a los lectores de pantalla saltar directamente al contenido principal, evitando la navegación repetitiva. En Angular, usamos proyección de contenido para que cada vista inyecte su contenido específico.

#### 2.2.5 `<footer>` - Pie de Página

**Ubicación:** `components/layout/footer`

**Estructura:**
```html
<footer class="footer">
  <article class="footer__container">
    <section class="footer__section footer__logo-section">
      <article class="footer__logo">
        <img src="assets/logo.png" alt="MapMyJourney" class="footer__logo-img">
      </article>
      <p class="footer__description">Planifica viajes. Crea recuerdos.</p>
      <nav class="footer__social">
        <a href="#" class="footer__social-link">📱</a>
        <a href="#" class="footer__social-link">🐦</a>
        <a href="#" class="footer__social-link">👍</a>
        <a href="#" class="footer__social-link">✉️</a>
      </nav>
    </section>

    <section class="footer__section footer__features-section">
      <h3 class="footer__section-title">Características</h3>
      <nav class="footer__nav">
        <a href="#">Viajes</a>
        <a href="#">Itinerario</a>
        <a href="#">Gastos</a>
        <a href="#">Documentos</a>
      </nav>
    </section>
  </article>

  <hr class="footer__divider">

  <p class="footer__copyright">
    © 2025 MapMyJourney. Todos los derechos reservados. Hecho con ❤️ para viajeros.
  </p>
</footer>
```

**Propósito:**
- Enlaces legales y de información
- Copyright y derechos de autor
- Navegación secundaria global

**Estructura:**
```html
<footer class="footer">
  <nav>
    <ul>
      <li><a>Términos y Condiciones</a></li>
      <li><a>Política de Privacidad</a></li>
      <li><a>Contacto</a></li>
    </ul>
  </nav>
  <p>&copy; 2025 MapMyJourney</p>
</footer>
```

**Justificación:**
El `<footer>` es ideal para información de cierre, legal y de contacto que aparece al final de cada página. Es reconocido por tecnologías asistivas como el final del contenido principal.

### 2.3 Elementos Semánticos de Formularios

#### 2.3.1 `<fieldset>` y `<legend>`

**Uso:** Formulario de registro (`signup-form`)

**Propósito:**
- `<fieldset>`: Agrupa campos relacionados
- `<legend>`: Proporciona un título descriptivo al grupo

**Ejemplo:**
```html
<fieldset class="signup__fieldset">
  <legend>Únete a MapMyJourney</legend>
  <!-- campos del formulario -->
</fieldset>
```

**Justificación:**
`<fieldset>` y `<legend>` son elementos semánticos específicamente diseñados para agrupar controles de formulario relacionados. Los lectores de pantalla anuncian el contenido del `<legend>` cuando el usuario navega por los campos del formulario, proporcionando contexto importante. Aunque a menudo se omiten por razones estéticas, son fundamentales para la accesibilidad.

#### 2.3.2 `<label>` vinculado con `for` e `id`

**Uso:** Componente `form-input` reutilizable

**Estructura:**
```html
<label [for]="inputId" class="form-input__label">
  {{ label }}
  <span *ngIf="required" class="form-input__required">*</span>
</label>
<input
  [id]="inputId"
  [type]="type"
  [placeholder]="placeholder"
  [required]="required"
  class="form-input__field"
  [class.form-input__field--error]="hasError"
/>
<span *ngIf="hasError && errorMessage" class="form-input__error">
  {{ errorMessage }}
</span>
```

**Beneficios:**
- Asociación explícita entre etiqueta y campo
- Clic en el label enfoca el input
- Lectores de pantalla anuncian el label al enfocar el input
- Mejora la accesibilidad y usabilidad

**Justificación:**
La vinculación explícita mediante `for` e `id` es una práctica esencial de accesibilidad. Garantiza que cada campo de formulario tenga una etiqueta descriptiva que sea reconocida por tecnologías asistivas y que mejore la experiencia de usuario al permitir clic en el label.

#### 2.3.3 `<section>` - Secciones de Contenido

**Uso:** Contenedor del formulario de registro

**Propósito:**
- Define una sección temática del documento
- Agrupa contenido relacionado bajo un tema común
- Generalmente contiene un heading (h1-h6)

**Ejemplo:**
```html
<section class="signup">
  <form><!-- formulario --></form>
</section>
```

**Justificación:**
`<section>` es el elemento apropiado para agrupar contenido temático. En el caso del formulario de registro, todo el contenido relacionado con el registro de usuarios se agrupa semánticamente. A diferencia de `<div>`, `<section>` comunica significado y estructura al documento.

### 2.4 Beneficios del HTML Semántico en MapMyJourney

1. **Accesibilidad mejorada**
   - Lectores de pantalla pueden navegar por la estructura del documento
   - Usuarios con teclado pueden saltar entre secciones principales
   - ARIA landmarks automáticos para tecnologías asistivas

2. **SEO optimizado**
   - Los motores de búsqueda entienden mejor la estructura del contenido
   - Mejora el ranking y la indexación de páginas
   - Fragmentos enriquecidos en resultados de búsqueda

3. **Mantenibilidad**
   - El código es más legible y autodocumentado
   - Fácil identificar la estructura y propósito de cada sección
   - Reducción de errores al trabajar en equipo

4. **Compatibilidad futura**
   - Preparado para nuevas tecnologías y navegadores
   - Estándares web modernos y buenas prácticas
   - Menor deuda técnica a largo plazo

### 2.5 Patrón de Estructura de Página

**Estructura típica de una página en MapMyJourney:**

```html
<app-header></app-header>

<div class="page-layout">
  <app-sidebar *ngIf="showSidebar"></app-sidebar>
  
  <app-main>
    <article>
      <h1>Título de la Página</h1>
      <section>
        <h2>Sección Principal</h2>
        <!-- contenido -->
      </section>
    </article>
  </app-main>
</div>

<app-footer></app-footer>
```

Esta estructura garantiza:
- Orden lógico de lectura (header → sidebar → main → footer)
- Semántica clara y predecible
- Fácil mantenimiento y extensión
- Excelente accesibilidad y SEO