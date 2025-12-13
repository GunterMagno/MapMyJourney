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