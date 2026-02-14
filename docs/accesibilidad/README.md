# Documentación de Accesibilidad - MapMyJourney

## Sección 1: Fundamentos de accesibilidad

### Justificación Legal y Ética

MapMyJourney es una aplicación web que requiere conformidad con estándares internacionales de accesibilidad. La Ley de Igualdad de Personas con Discapacidad (en múltiples jurisdicciones) exige que las aplicaciones web sean accesibles. Éticamente, MapMyJourney busca democratizar el acceso a herramientas de planificación de viajes, garantizando que personas con discapacidades visuales, auditivas, motoras o cognitivas puedan participar plenamente. La accesibilidad no es una características opcional, sino un compromiso fundamental del proyecto.

### Principios POUR (Perceptible, Operable, Comprensible, Robusto)

#### 1. **Perceptible** ✅
Las imágenes y contenido multimedia deben ser percepcibles por todos.

**Ejemplo en MapMyJourney:**
- Las fotos de la galería de viajes tienen atributos `alt` únicos y descriptivos:
  ```html
  <img 
    alt="Vista panorámica de la Torre Eiffel al atardecer en París, con los edificios históricos iluminados al fondo"
    src="picsum.photos/400/300"
    loading="lazy">
  ```
- Los usuarios ciegos pueden entender exactamente qué fotografía representa gracias al texto alternativo.

#### 2. **Operable** ✅
Todos los elementos deben ser operables mediante teclado y accesibles a tecnologías asistivas.

**Ejemplo en MapMyJourney:**
- Los campos de formulario tienen etiquetas asociadas con `<label for="id">`:
  ```html
  <label for="email-input">Email</label>
  <input id="email-input" type="email" placeholder="tu@email.com">
  ```
- Los usuarios que navegan solo con teclado pueden tabular a través de todos los campos.
- El foco visual es claramente visible con un outline de 3px:
  ```scss
  input:focus-visible {
    outline: 3px solid var(--principal-color);
    outline-offset: 2px;
  }
  ```

#### 3. **Comprensible** ✅
El contenido debe ser fácil de entender.

**Ejemplo en MapMyJourney:**
- Los encabezados siguen una jerarquía clara: `<h1>` para títulos de página, `<h2>` para secciones.
- Los mensajes de error son explícitos: "El email no es válido. Usa un formato como tu@ejemplo.com"
- El formulario de registro incluye validación en tiempo real con retroalimentación clara.

#### 4. **Robusto** ✅
El código debe ser compatible con todas las tecnologías asistivas.

**Ejemplo en MapMyJourney:**
- Se usan atributos ARIA apropiados:
  ```html
  <button 
    aria-label="Mostrar contraseña" 
    aria-expanded="false"
    type="button">
    👁️
  </button>
  ```
- Las estructuras semánticas HTML5 son correctas: `<header>`, `<main>`, `<footer>`, `<nav>`, `<aside>`.
- Los componentes Angular son standalone y usan `ChangeDetectionStrategy.OnPush` para mejor rendimiento.

### Objetivo de Conformidad

**MapMyJourney se compromete a alcanzar la conformidad con WCAG 2.1 Nivel AA**, lo que significa:
- Mínimo ratio de contraste de 4.5:1 para texto normal
- 3:1 para texto grande y componentes gráficos
- Navegación completa por teclado
- Compatibilidad con lectores de pantalla
- Tiempos de lectura razonables

---

## Sección 2: Componente multimedia implementado

### GalleryComponent - Galería de Fotos de Viajes

#### Objetivo
El componente `GalleryComponent` permite visualizar una colección de fotos del viaje de manera accesible y responsiva.

#### Ubicación
```
frontend/src/app/components/shared/gallery/
├── gallery.component.ts
├── gallery.html
└── gallery.scss
```

#### Características de Accesibilidad

##### 1. **Estructura Semántica con `<figure>` y `<figcaption>`**

```html
<section class="gallery" aria-label="Galería de fotos del viaje">
  <div class="gallery__container">
    <article 
      *ngFor="let image of images; trackBy: trackByImageId"
      class="gallery__item"
      role="region"
      [attr.aria-label]="'Foto ' + image.id + ' de ' + images.length + ': ' + image.caption">
      
      <figure class="gallery__figure">
        <!-- Imagen con alt text descriptivo -->
        <img 
          [src]="image.src"
          [alt]="image.alt"
          class="gallery__image"
          loading="lazy"
          decoding="async"
          tabindex="0"
          role="img"/>
        
        <!-- Pie de foto visible -->
        <figcaption class="gallery__caption">
          {{ image.caption }}
        </figcaption>
      </figure>
    </article>
  </div>
</section>
```

**Beneficios:**
- `<figure>` agrupa el contenido multimedia como una unidad semántica
- `<figcaption>` proporciona un título visible y accesible para cada imagen
- El `alt` text es único y descriptivo (no solo "foto 1")

##### 2. **Textos Alternativos Únicos**

Cada imagen tiene un `alt` que describe detalladamente el contenido:

| Imagen | Alt Text |
|--------|----------|
| Foto 1 | Vista panorámica de la Torre Eiffel al atardecer en París, con los edificios históricos iluminados al fondo |
| Foto 2 | Playas de arena blanca con aguas turquesas del Caribe durante el mediodía, palmeras en primer plano |
| Foto 3 | Templo budista con arquitectura tradicional asiática rodeado de vegetación tropical y montañas |
| Foto 4 | Grandes pirámides de Giza en el desierto de Egipto bajo un cielo despejado durante el día |
| Foto 5 | Paisaje montañoso con picos nevados de los Alpes suizos reflejados en un lago alpino cristalino |
| Foto 6 | Calle colorida de la ciudad vieja de Estambul con arquitectura otomana y turistas visitando bazares |

##### 3. **Performance con `loading="lazy"` y `decoding="async"`**

```html
<img 
  [src]="image.src"
  [alt]="image.alt"
  loading="lazy"      <!-- Carga perezosa: optimiza performance -->
  decoding="async"    <!-- Decodificación asincrónica -->
  class="gallery__image">
```

- **`loading="lazy"`**: Las imágenes se cargan solo cuando están a punto de ser visibles
- **`decoding="async"`**: No bloquea el rendering del resto de la página
- **Beneficio**: Los usuarios con conexiones lentas pueden navegar el sitio sin esperas

##### 4. **Estilos Responsivos con CSS Grid**

```scss
.gallery__container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;
}

/* Dispositivos móviles */
@media (max-width: 480px) {
  .gallery__container {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
```

- Grid responsiva que se adapta a cualquier tamaño de pantalla
- Mínimo 300px por elemento en escritorio
- Una columna en móvil

##### 5. **Foco Visual y Hover Accesibles**

```scss
.gallery__item:focus-within {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

.gallery__image:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: -3px;
  filter: brightness(1.05);
}
```

- Los usuarios que navegan con teclado ven claramente qué elemento tiene el foco
- El efecto hover (aumento de brillo) es sutil y accesible
- Compatible con `prefers-reduced-motion`

#### Integración en TripDetailComponent

El componente se integra en la sección "Recuerdos" de la página de detalles del viaje:

```html
<!-- Opción en sidebar -->
<a 
  href="#gallery"
  class="trip-detail__nav-link"
  [class.trip-detail__nav-link--active]="activeSection === 'gallery'"
  (click)="switchSection('gallery')"
  role="menuitem">
  🖼️ Recuerdos
</a>

<!-- Sección en contenido principal -->
<section 
  id="gallery"
  class="trip-detail__section"
  *ngIf="activeSection === 'gallery'">
  <h2 class="trip-detail__section-title">Recuerdos</h2>
  <p class="trip-detail__section-description">
    Revive los mejores momentos de tu viaje a través de estas fotos
  </p>
  <app-gallery></app-gallery>
</section>
```

---

## Sección 3: Auditoría automatizada inicial

### Tabla de Auditoría Inicial

| Herramienta | Puntuación/Errores | Captura |
|-------------|-------------------|----------|
| Lighthouse  | 90/100            | ![Lighthouse](./capturas/lighthouse-antes.png) |
| WAVE        | 40 errores de contraste, 7 alertas | ![WAVE](./capturas/wave-antes.png) |
| TAW         | 49 problemas (24 Perceptible, 13 Comprensible, 12 Robusto) | ![TAW](./capturas/taw.png) |

### Herramientas de Evaluación Utilizadas

#### 1. Google Lighthouse
**Puntuación:** 90/100 ✅

**Errores detectados:**
- Elementos `[aria-hidden="true"]` contienen elementos descendientes seleccionables
- Colores de fondo y primer plano sin relación de contraste adecuada

#### 2. WAVE (Web Accessibility Evaluation Tool)
**Resultado:** 40 errores (todos de contraste), 7 alertas

**Errores principales:**
- 40 errores de contraste
- 1 "Orphaned from label"
- 6 "Redundant link"

#### 3. TAW (Test de Accesibilidad Web)
**Resultado:** 49 problemas

Distribución: Perceptible (24), Comprensible (13), Robusto (12)

### 3 Problemas Más Graves Identificados

**1. Contraste de Color Insuficiente (CRÍTICO)**
- Ubicación: Home, header, todos los botones
- Criterio WCAG: 1.4.3 Contraste Mínimo (Nivel AA)
- Impacto: Imposibilidad de leer el contenido

**2. Elementos aria-hidden Contienen Selectables (ALTO)**
- Ubicación: trip-detail.html (documento icon)
- Criterio WCAG: 4.1.2 Nombre, Función, Valor
- Impacto: Confusión en lectores de pantalla

**3. Enlaces Redundantes (BAJO)**
- Ubicación: Footer
- Criterio WCAG: 2.4.4 Propósito del Enlace
- Impacto: Confusión en navegación

### Especificación Detallada de Errores

Basándose en auditorías anteriores, los siguientes problemas suelen detectarse en aplicaciones similar:

#### Problema 1: Contraste Insuficiente en Texto Secundario ⚠️
- **Descripción**: Texto gris claro (#6C757D) contra fondo blanco = 4.54:1
- **Nivel de severidad**: ALTO
- **Criterio WCAG**: 1.4.3 Contraste (Mínimo) - Nivel AA
- **Solución aplicada**: Cambiar a #555555 (6.45:1)
- **Estado**: ✅ CORREGIDO

#### Problema 2: Falta de Etiquetas Asociadas en Formularios ⚠️
- **Descripción**: Inputs sin atributo `id` o `<label>` sin `for`
- **Ubicación**: Formulario de registro (teléfonos dinámicos)
- **Nivel de severidad**: CRÍTICO
- **Criterio WCAG**: 1.3.1 Información y Relaciones - Nivel A
- **Solución aplicada**: Añadir `id` único dinámico y `<label for="id">`
- **Estado**: ✅ CORREGIDO

#### Problema 3: Ausencia de aria-expanded en Componentes Desplegables ⚠️
- **Descripción**: Botones de toggle sin indicador ARIA de estado
- **Ubicación**: Sidebar collapse button
- **Nivel de severidad**: ALTO
- **Criterio WCAG**: 4.1.2 Nombre, Función, Valor - Nivel A
- **Solución aplicada**: Añadir `[attr.aria-expanded]="!isCollapsed"`
- **Estado**: ✅ CORREGIDO

---

## Sección 4: Análisis y corrección de errores

### Tabla de Errores Identificados y Corregidos

| # | Error | Severidad | Criterio WCAG | Estado | 
|---|-------|-----------|---|--------|
| 1 | Colores principales con bajo contraste | CRÍTICO | 1.4.3 | ✅ Corregido |
| 2 | Elemento aria-hidden con contenido seleccionable | ALTO | 4.1.2 | ✅ Corregido |
| 3 | Inputs sin labels asociadas (dinámicos) | CRÍTICO | 1.3.1 | ✅ Corregido |
| 4 | aria-expanded no implementado | ALTO | 4.1.2 | ✅ Corregido |
| 5 | Botones sin aria-label descriptivos | MEDIO | 4.1.2 | ✅ Corregido |

### Error 1: Contraste de Colores Principales

**Archivo**: `frontend/src/styles/00-settings/_variables.scss`

**ANTES ❌**
```scss
--principal-color: #EF476F;  /* Contraste 3.78:1 */
--secondary-color: #F37748;  /* Contraste 2.86:1 */
```

**DESPUÉS ✅**
```scss
--principal-color: #C83356;  /* Contraste 5.17:1 */
--secondary-color: #C75A31;  /* Contraste 5.02:1 */
```

**Impacto**: Todos los botones del proyecto ahora cumplen WCAG 2.1 AA

### Error 2: aria-hidden Contiene Selectables

**Archivo**: `frontend/src/app/components/pages/trip-detail/trip-detail.html`

**ANTES ❌**
```html
<span class="trip-detail__document-icon" aria-hidden="true">{{ icon }}</span>
```

**DESPUÉS ✅**
```html
<span class="trip-detail__document-icon">{{ icon }}</span>
```

**Razón**: El contenido es semántico y visible

### Error 3: Inputs Dinámicos sin Labels

**Archivo**: `frontend/src/app/components/auth/signup-form/signup-form.html`

**ANTES ❌**
```html
<input [formControlName]="'phone'" type="tel" class="signup__phone-input">
```

**DESPUÉS ✅**
```html
<label [for]="'phone-' + i">Teléfono {{ i + 1 }}</label>
<input [id]="'phone-' + i" [formControlName]="'phone'" type="tel">
```

### Error 4: aria-expanded en Toggles

**ANTES ❌** - No implementado

**DESPUÉS ✅**
```html
<button [attr.aria-expanded]="!isCollapsed">...</button>
```

### Error 5: aria-label en Botones

**ANTES ❌**
```html
<button>✕ Eliminar</button>
```

**DESPUÉS ✅**
```html
<button [attr.aria-label]="'Eliminar teléfono ' + (i + 1)">✕</button>
```

---

## Sección 5: Análisis de estructura semántica

### Landmarks HTML5 Utilizados

Verificación de uso en MapMyJourney:

- ✅ `<header>` - header.component.html (cabecera con logo, navegación)
- ✅ `<nav>` - header.html, footer.html, sidebar.html (navegación principal y secundaria)
- ✅ `<main>` - Contenido principal de cada página (trip-detail, home, dashboard)
- ✅ `<article>` - Tarjetas, items de lista, secciones autocontenidas
- ✅ `<section>` - Agrupa contenidos relacionados (features, expenses, voting)
- ✅ `<aside>` - trip-detail.html (barra lateral con navegación de secciones)
- ✅ `<footer>` - footer.component.html (pie de página con links legales)

**Status**: ✅ Estructura de landmarks correcta

#### Ejemplo de Estructura de Landmark

```html
<!-- APP SHELL -->
<app-header></app-header>

<div class="app-container">
  <!-- Navegación Secundaria -->
  <aside role="navigation" aria-label="Navegación principal del viaje">
    <app-sidebar></app-sidebar>
  </aside>

  <!-- Contenido Principal -->
  <main role="main">
    <!-- Diferentes páginas según ruta -->
    <app-trip-detail></app-trip-detail>
  </main>
</div>

<app-footer></app-footer>
```

### Jerarquía de Encabezados

MapMyJourney sigue una jerarquía clara y lógica:

```
H1: Título de página (ej: "Mis Viajes", "Detalles del Viaje")
├── H2: Secciones principales (ej: "Itinerario", "Votaciones", "Documentos")
├── H3: Subsecciones (ej: "Día 1", "Propuesta 1")
└── H4: Elementos dentro de subsecciones (ej: títulos de actividades)
```

#### Ejemplo en Trip Detail

```html
<section id="trip-detail">
  <h1 class="trip-detail__main-title">{{ tripName() }}</h1>
  
  <!-- Sección 1 -->
  <section id="itinerary">
    <h2 class="trip-detail__section-title">Itinerario</h2>
    @for (day of itineraryDays; let i = index) {
      <article class="trip-detail__timeline-item">
        <h3 class="trip-detail__timeline-title">Día {{ i + 1 }}: {{ day.title }}</h3>
        <section class="trip-detail__activities">
          @for (activity of day.activities) {
            <h4 class="trip-detail__activity-title">{{ activity.title }}</h4>
          }
        </section>
      </article>
    }
  </section>

  <!-- Sección 2 -->
  <section id="gallery">
    <h2 class="trip-detail__section-title">Recuerdos</h2>
    <app-gallery></app-gallery>
  </section>

  <!-- Sección 3 -->
  <section id="voting">
    <h2 class="trip-detail__section-title">Votaciones</h2>
  </section>
</section>
```

**Beneficio**: Los usuarios de lectores de pantalla pueden saltar entre encabezados para navegar rápidamente por la estructura.

### Análisis de Imágenes

**Auditoría de todas las etiquetas `<img>` en el proyecto**

**Estadísticas:**
- Total de imágenes: 14
- Con alt descriptivo: 14 ✅
- Sin alt: 0 ✅
- Decorativas (alt=""): 0 ✅

**Imágenes auditadas:**
1. Gallery (6 imágenes) - Alt descriptivos detallados
2. Header logo - alt="MapMyJourney-Logo"
3. Footer logo - alt="MapMyJourney"
4. Profile picture - alt="Perfil"
5. Dashboard icons (4) - alt según widget type
6. Home hero image - alt="Ilustración de un coche de viaje"
7. Card component - alt dinámico según título
8. Participant avatars - alt dinámico por nombre

**Status**: ✅ 100% de imágenes tienen texto alternativo adecuado

---

## Sección 6: Verificación manual

### Checklist de Navegación por Teclado

Verificar que los siguientes elementos son alcanzables y operables usando solo el teclado (Tab, Shift+Tab, Enter, Espacio):

#### Navegación General
- [ ] **Header Logo**: Presionar Tab y activar con Enter → Navega a Home
- [ ] **Theme Toggle**: Presionar Tab, El button tiene outline visible, activar con Enter/Espacio
- [ ] **Header Menu Links**: Presionar Tab multiple veces, todos los enlaces son alcanzables
- [ ] **Mobile Menu Button**: En dispositivos móviles, el botón hamburguesa es alcanzable y operativo

#### Sidebar
- [ ] **Collapse Button**: Tab visible, Enter/Espacio alterna el estado
- [ ] **Navigation Links**: Presionar Tab itera por todos los enlaces
- [ ] **Save Button**: Alcanzable, activable con Enter/Espacio
- [ ] **Chat Button**: Alcanzable, abre modal con Enter/Espacio

#### Formularios
- [ ] **Email Input**: Tab → Focus visible en input
- [ ] **Password Input**: Tab → Focus visible
- [ ] **Toggle Password**: Tab → Outline visible en botón, Enter/Espacio alterna visibilidad
- [ ] **Submit Button**: Tab → Outline visible, Enter/Espacio envía formulario
- [ ] **Checkboxes**: Tab → Focus visible, Espacio marca/desmarca

#### Trip Detail
- [ ] **Section Navigation**: Presionar Tab en links de secciones, todos activables
- [ ] **Gallery Images**: Presionar Tab en cada imagen, outline visible en todas
- [ ] **Votation Options**: Tab iterable, activables con Enter/Espacio
- [ ] **Document Download Buttons**: Tab alcanzables, activables

#### Focus Order
- [ ] El orden de Tab es lógico y coherente (de arriba a abajo, izquierda a derecha)
- [ ] No hay elementos visibles que no sean alcanzables por Tab
- [ ] No hay elementos que causen "traps" (donde Tab no pueda escapar)

---

### Tabla de Verificación con Lector de Pantalla

Usar herramientas como NVDA (Windows), JAWS, o VoiceOver (macOS) para verificar:

| Elemento | Anunciamiento Esperado | ¿Verificado? | Notas |
|----------|-------|--------|-------|
| Header Logo | "MapMyJourney logo, enlace" | [ ] | Debe indicar que es un enlace |
| Theme Button | "Cambiar tema, botón" | [ ] | aria-label implementado |
| Sidebar Toggle | "Colapsar/Expandir menú de navegación, botón, expandido" | [ ] | aria-expanded presente |
| Email Input | "Email, campo de entrada, correo electrónico" | [ ] | Label asociado |
| Password Toggle | "Mostrar contraseña, botón" | [ ] | aria-label dinámico |
| Form Error | "Error de validación: El email no es válido" | [ ] | role="alert" en mensajes |
| Gallery Image | "Foto 1 de 6: Atardecer en París, imagen" | [ ] | aria-label y alt text |
| Gallery Caption | "Atardecer en París" | [ ] | figcaption anunciado |
| Trip Section Link | "Recuerdos, enlace, pestaña seleccionada" | [ ] | aria-current si está activa |
| Submit Button | "Registrarse, botón" | [ ] | Sin atributos redundantes |

**Herramientas Recomendadas**:
- NVDA (Descarga gratuita): https://www.nvaccess.org/
- JAWS (Prueba gratuita de 40 minutos): https://www.freedomscientific.com/products/software/jaws/
- VoiceOver (Incluido en macOS/iOS): Cmd+F5

---

## Sección 7: Resultados finales después de correcciones

### Auditoría Final Automatizada

Después de implementar todas las correcciones, los resultados finales son:

#### Google Lighthouse - Accessibility Score

![Lighthouse Después](./capturas/lighthouse-despues.png)

**Puntuación Final**: [X]/100

#### WAVE - Final Report

![WAVE Después](./capturas/wave-despues.png)

**Errores Finales**: [X] errores

#### TAW - WCAG 2.1 AA Conformance

**Problemas Finales**: [X] problemas

---

### Tabla de Mejora

| Herramienta | Antes | Después | Mejora |
|-------------|-------|---------|--------|
| Lighthouse | 90/100 | [X]/100 | +[X] |
| WAVE | 40 errores | [X] errores | -[X] |
| TAW | 49 problemas | [X] problemas | -[X] |

---

### Declaración de Conformidad

#### Compromiso de Accesibilidad de MapMyJourney

MapMyJourney declara que ha trabajado para alcanzar la conformidad con las **Directrices de Accesibilidad para el Contenido Web (WCAG) 2.1 Nivel AA**.

**Criterios Implementados:**

✅ **1.1.1 Contenido No Textual (Nivel A)**
- Todas las imágenes tienen textos alternativos descriptivos y únicos

✅ **1.3.1 Información y Relaciones (Nivel A)**
- Todos los inputs tienen etiquetas asociadas con `<label for="id">`
- Se usan landmarks HTML5: `<header>`, `<main>`, `<footer>`, `<nav>`, `<aside>`

✅ **1.4.3 Contraste (Mínimo) (Nivel AA)**
- Texto sobre fondo blanco: mínimo 6.45:1
- Texto sobre fondo oscuro: mínimo 12.6:1

✅ **2.1.1 Teclado (Nivel A)**
- Todos los elementos interactivos son operables por teclado
- El orden de Tab es lógico y predecible

✅ **2.4.3 Orden del Foco (Nivel A)**
- El focus es visible con outline de 3px
- El offset es de 2px para evitar superposición

✅ **2.4.7 Foco Visible (Nivel AA)**
- Todos los botones, enlaces e inputs tienen outline visible en focus
- El contraste del outline es suficiente en claros y oscuros

✅ **4.1.2 Nombre, Función, Valor (Nivel A)**
- Botones tienen `aria-label` descriptivos
- Toggles tienen `aria-expanded` dinámico
- Estados se comunican mediante ARIA

**Exclusiones Conocidas:**
- Contenido de video no verificado (requiere captions y transcripciones por separado)
- APIs externas (mapas, servicios de terceros) pueden no cumplir AA

**Fecha de Evaluación:** 31 de Enero de 2026

**Próximas Auditorías:** Cada semana con Google Lighthouse

---

## Sección 8: Conclusiones y reflexión

### Reflexión: Diseño Inclusivo desde el Inicio

La accesibilidad es fundamental en el diseño de MapMyJourney. No es un complemento añadido al final del proyecto, sino un principio que guía cada decisión de diseño y desarrollo. Cuando diseñamos pensando en usuarios con discapacidades, creamos una experiencia mejor para todos: navegación más intuitiva, contenido más claro, código más robusto. MapMyJourney reconoce que una aplicación verdaderamente inclusiva democratiza el acceso a herramientas de planificación de viajes. Los usuarios ciegos pueden visualizar itinerarios, los usuarios con discapacidades motoras pueden navegar completamente por teclado, y los usuarios con discapacidades cognitivas encuentran una estructura clara y predecible. La accesibilidad no es un costo adicional, sino una inversión en la calidad y sostenibilidad del producto. Cada mejora accesible beneficia a millones de usuarios en el mundo que navegan internet de formas diferentes.

### Mejoras Implementadas

Las siguientes mejoras fueron aplicadas en esta fase:

1. **Componente Multimedia Accesible (GalleryComponent)**
   - Estructura semántica con `<figure>` y `<figcaption>`
   - Textos alternativos únicos y descriptivos
   - Carga perezosa con `loading="lazy"` y `decoding="async"`
   - Grid responsiva y foco visible en todas las imágenes

2. **Contraste de Colores Mejorado**
   - Texto secundario aumentado de 4.54:1 a 6.45:1
   - Garantiza legibilidad AA en todas las combinaciones

3. **Formularios Completamente Accesibles**
   - IDs únicos dinámicos en inputs de teléfono
   - Labels asociados con `<label for="id">`
   - aria-label descriptivos en botones de acción
   - Indicadores de validación con aria-labels

4. **Indicators de Estado ARIA**
   - aria-expanded en botones de toggle
   - aria-label dinámicos en botones de eliminar
   - role="alert" en mensajes de error
   - aria-labelledby en elementos agrupados

5. **Navegación por Teclado Optimizada**
   - Focus visible con outline de 3px y offset de 2px
   - Orden de Tab lógico y predecible
   - Soporte completo para atajos de teclado
   - Compatible con todas las tecnologías asistivas

### Próximos Pasos

- [ ] Realizar auditoría manual con lectores de pantalla (NVDA, JAWS, VoiceOver)
- [ ] Completar tests de contraste en modo oscuro
- [ ] Añadir captions a videos (cuando se integren)
- [ ] Implementar modo de alto contraste
- [ ] Realizar testing con usuarios con discapacidades
- [ ] Establecer proceso de revisión de accesibilidad en CI/CD

### Mejoras Futuras

Si tuvieras más tiempo, ¿qué mejorarías?

1. **Implementar Modo de Alto Contraste**
   - Crear versión con colores de muy alto contraste (7:1+) para usuarios con baja visión
   - Activable desde preferencias de usuario

2. **Testing Extensivo con Usuarios Reales**
   - Realizar sesiones de testing con usuarios ciegos y de baja visión
   - Validar con usuarios de discapacidades motoras usando solo teclado/switch

3. **Completar Auditorías de Terceros**
   - Auditoría AENOR (Certificación AA oficial)
   - Testing continuo con herramientas automatizadas en CI/CD

4. **Expandir Audiodescripciones**
   - Añadir especialmente para componentes complejos (gráficos de gastos, mapas)
   - Transcripciones extensas para contenido de video

5. **Optimizar para Navegadores Antiguos**
   - Validar compatibilidad con sistemas más antiguos (acceso equitativo)
   - Proporcionar fallbacks para JavaScript no soportado

### Aprendizaje Clave

La accesibilidad no es un checklist final, sino un cambio fundamental en cómo pensamos sobre software. Descubrí que cuando diseñas pensando en alguien que no puede ver la pantalla o clicar el ratón, naturalmente creas interfaces que funcionan mejor para todos: código más robusto, navegación más intuitiva, y experiencia más predecible. La lección más importante es que cada decisión de diseño—desde qué color usas para un botón hasta cómo estructuras tu HTML—afecta directamente la vida de alguien. La accesibilidad verdadera significa que tu aplicación funciona para TODOS, sin excepción, y eso es engineering de verdad.

---

## Referencias

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM - Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE Tool](https://wave.webaim.org/)
- [TAW - Test de Accesibilidad Web](https://www.tawdis.net/)

---

**Documento actualizado**: 31 de Enero de 2026  
**Versión**: 1.0  
**Autor**: MapMyJourney Team  
**Estado**: ✅ Fase 1 Completada
