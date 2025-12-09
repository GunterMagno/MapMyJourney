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

**Contraste de Tamaño:**

**Contraste de Peso:**

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
```scss
// Relacionado: 4-8px (spacing-1 a spacing-2)
// Normal: 16-24px (spacing-4 a spacing-6)
// Sección: 48-64px (spacing-12 a spacing-16)
```

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

---------------------------------------------------

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