# Arquitectura de Eventos y Manipulación del DOM - FASE 1

## Índice
1. [Introducción](#introducción)
2. [Arquitectura de Eventos](#arquitectura-de-eventos)
3. [Manipulación Segura del DOM](#manipulación-segura-del-dom)
4. [Ciclo del Evento](#ciclo-del-evento)
5. [Componentes Interactivos Implementados](#componentes-interactivos-implementados)
6. [Buenas Prácticas](#buenas-prácticas)
7. [Tabla de Compatibilidad](#tabla-de-compatibilidad)

---

## Introducción

La FASE 1 se enfoca en la **interactividad nativa sin librerías externas pesadas**. Se implementan patrones seguros para manipular el DOM y manejar eventos usando las herramientas de Angular.

### Principios Clave

- **Seguridad**: Uso de `Renderer2` y `ViewChild` en lugar de `document.getElementById`
- **Accesibilidad**: Atributos ARIA y manejo semántico de eventos
- **Reactividad**: Event Binding, `@HostListener`, y control de estado con booleanos

---

## Arquitectura de Eventos

### Event Binding - Sintaxis

```typescript
// Template
<button (click)="onButtonClick()">Click me</button>
<input (keyup.enter)="onEnter($event)">
<div (click)="onDivClick($event)">Content</div>

// Component
onButtonClick(): void {
  console.log('Button clicked');
}

onEnter(event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  console.log('Enter pressed:', input.value);
}

onDivClick(event: MouseEvent): void {
  event.stopPropagation(); // Evita propagación
  event.preventDefault();  // Previene acción por defecto
}
```

### @HostListener - Escuchadores en el Host

Usados para capturar eventos en la ventana o documento desde dentro del componente.

```typescript
@Component({
  selector: 'app-header',
  // ...
})
export class HeaderComponent {
  isMobileMenuOpen = false;

  // Escucha clicks de ESC en toda la ventana
  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  // Escucha el evento resize de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth > 768) {
      this.isMobileMenuOpen = false;
    }
  }
}
```

### preventDefault() y stopPropagation()

```typescript
onFormSubmit(event: Event): void {
  event.preventDefault(); // Evita que el formulario se envíe por defecto
}

onBackdropClick(event: MouseEvent): void {
  event.stopPropagation(); // Evita que el evento suba hacia el padre
}

onLinkClick(event: MouseEvent): void {
  if (condition) {
    event.preventDefault(); // Evita navegar
  }
}
```

---

## Manipulación Segura del DOM

### ❌ NUNCA hacer esto (Inseguro)

```typescript
// NO HACER
document.getElementById('myId')?.classList.add('active');
const el = document.querySelector('.myClass');
el.innerHTML = userContent; // Vulnerabilidad XSS
```

### ✅ SIEMPRE usar Renderer2 (Seguro)

```typescript
import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `<div #myElement>Content</div>`
})
export class ExampleComponent {
  @ViewChild('myElement') myElement!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    // Agregar clase
    this.renderer.addClass(this.myElement.nativeElement, 'active');

    // Establecer estilo
    this.renderer.setStyle(this.myElement.nativeElement, 'color', 'red');

    // Crear elemento dinámicamente
    const newDiv = this.renderer.createElement('div');
    this.renderer.setProperty(newDiv, 'textContent', 'Hello World');
    this.renderer.appendChild(this.myElement.nativeElement, newDiv);

    // Escuchar evento
    this.renderer.listen(newDiv, 'click', (event) => {
      console.log('Clicked:', event);
    });
  }

  removeElement(): void {
    // Remover elemento
    this.renderer.removeChild(
      this.myElement.nativeElement.parentNode,
      this.myElement.nativeElement
    );
  }
}
```

### Métodos Principales de Renderer2

| Método | Uso |
|--------|-----|
| `addClass(el, className)` | Agregar clase CSS |
| `removeClass(el, className)` | Remover clase CSS |
| `setStyle(el, style, value)` | Establecer estilo inline |
| `removeStyle(el, style)` | Remover estilo inline |
| `setProperty(el, name, value)` | Establecer propiedad HTML |
| `setAttribute(el, name, value)` | Establecer atributo HTML |
| `removeAttribute(el, name)` | Remover atributo |
| `createElement(tagName)` | Crear elemento |
| `createText(text)` | Crear nodo de texto |
| `appendChild(parent, child)` | Agregar hijo |
| `removeChild(parent, child)` | Remover hijo |
| `listen(el, event, callback)` | Escuchar evento |

---

## Ciclo del Evento

### Diagrama de Flujo (Texto)

```
┌────────────────────────────────────────────────────────────┐
│                    Usuario Interactúa                       │
│                  (click, keyup, hover, etc)                 │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          ▼
                  ┌─────────────────┐
                  │ Fase de Captura │
                  │ (Capture Phase) │
                  └────────┬────────┘
                           │
                 Evento viaja del documento
                    hacia el elemento
                           │
                           ▼
              ┌──────────────────────────┐
              │ Fase de Objetivo / Meta  │
              │   (Target Phase)         │
              └────────┬─────────────────┘
                       │
             El evento alcanza el elemento
            que desencadenó la acción
                       │
                       ▼
              ┌──────────────────────────┐
              │  Fase de Burbujeo        │
              │ (Bubbling Phase)         │
              └────────┬─────────────────┘
                       │
               Evento viaja hacia arriba
               en el árbol del DOM
                       │
                       ▼
              ┌──────────────────────┐
              │ Event Listeners      │
              │ Ejecutar Callbacks   │
              └────────┬─────────────┘
                       │
          ¿Se llamó stopPropagation()?
              │                    │
         Sí (Detiene)         No (Continúa)
              │                    │
              └────────┬───────────┘
                       │
                       ▼
              ┌──────────────────────┐
              │   Evento Completado  │
              └──────────────────────┘
```

### Ejemplo Práctico: Modal con ESC

```typescript
@Component({
  selector: 'app-modal',
  template: `
    <div class="modal" [class.modal--open]="isOpen">
      <div class="modal__backdrop" (click)="onBackdropClick()"></div>
      <div class="modal__content" (click)="onModalContentClick($event)">
        Content
      </div>
    </div>
  `
})
export class ModalComponent {
  isOpen = false;

  // Escucha ESC en toda la ventana
  @HostListener('keydown.escape')
  onEscapeKey(): void {
    this.closeModal();
  }

  // Cierra al hacer click en el backdrop
  onBackdropClick(): void {
    this.closeModal();
  }

  // Previene que click en el contenido cierre el modal
  onModalContentClick(event: MouseEvent): void {
    event.stopPropagation(); // El click no sube al backdrop
  }

  closeModal(): void {
    this.isOpen = false;
  }
}
```

---

## Componentes Interactivos Implementados

### 1. **Header con Menú Hamburguesa**

**Ubicación**: `frontend/src/app/components/layout/header/`

**Características**:
- Toggle de menú con booleano `isMobileMenuOpen`
- Cierre automático con ESC (`@HostListener`)
- Cierre automático al redimensionar a desktop
- Integración con `ThemeService` para cambio de tema

**Ejemplo de Uso**:
```html
<button (click)="toggleMobileMenu()" aria-label="Abrir menú">
  ☰
</button>
<div [class.header__menu--open]="isMobileMenuOpen">
  <!-- Menu items -->
</div>
```

### 2. **Modal**

**Ubicación**: `frontend/src/app/components/shared/modal/`

**Características**:
- Abre/cierra con estado booleano
- Cierre con ESC usando `@HostListener`
- Cierre al hacer click en el backdrop
- Prevención de propagación para clicks dentro del modal
- Manipulación segura del DOM con `Renderer2`

**Ejemplo de Uso**:
```html
<app-modal #myModal title="Confirmar">
  <p>¿Estás seguro?</p>
  <button (click)="myModal.closeModal()">Cancelar</button>
  <button (click)="confirmAction()">Confirmar</button>
</app-modal>
```

### 3. **Tabs**

**Ubicación**: `frontend/src/app/components/shared/tabs/`

**Características**:
- Selección de tab con click
- Vista activa con `@if` bloque
- Accesibilidad ARIA
- Animación de fade in

**Ejemplo de Uso**:
```typescript
const tabs: TabItem[] = [
  { id: 'tab1', label: 'Descripción', content: 'Contenido...' },
  { id: 'tab2', label: 'Comentarios', content: 'Comentarios...' }
];
```

```html
<app-tabs [tabs]="tabs"></app-tabs>
```

### 4. **Tooltip**

**Ubicación**: `frontend/src/app/components/shared/tooltip/`

**Características**:
- Mostrar/ocultar en hover
- Posicionamiento configurable (top, bottom, left, right)
- Uso de `@HostListener` para mouseenter/mouseleave
- Animación de fade in

**Ejemplo de Uso**:
```html
<app-tooltip text="Ayuda" position="top">
  <button>?</button>
</app-tooltip>
```

### 5. **Theme Switcher**

**Ubicación**: `frontend/src/app/services/theme.service.ts`

**Características**:
- Detección de preferencia del sistema con `matchMedia`
- Persistencia en `localStorage`
- Aplicación de clase `.dark-mode` al `document.documentElement`
- Uso de variables CSS para cambio de colores

**Ejemplo de Uso**:
```typescript
constructor(private themeService: ThemeService) {}

toggleTheme(): void {
  this.themeService.toggleTheme();
}
```

---

## Buenas Prácticas

### 1. Usar @Input para ControlState
```typescript
@Component({
  selector: 'app-my-component'
})
export class MyComponent {
  @Input() isOpen = false; // Estado controlado por el padre
}
```

### 2. Señales de Angular 17+
```typescript
import { signal } from '@angular/core';

export class MyComponent {
  isOpen = signal(false); // Estado reactivo

  toggle(): void {
    this.isOpen.update(v => !v); // Actualizar con función
  }
}
```

### 3. Limpiar Listeners en ngOnDestroy
```typescript
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.someService.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Handle data
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 4. Usar preventDefault() y stopPropagation()
```typescript
// Prevenir acción por defecto
<form (submit)="onSubmit($event)">

onSubmit(event: Event): void {
  event.preventDefault(); // Evita recargar la página
  // Handle form submission
}

// Prevenir propagación
<div (click)="onDivClick()">
  <button (click)="onButtonClick($event)">Click</button>
</div>

onButtonClick(event: MouseEvent): void {
  event.stopPropagation(); // No sube hacia el div
}
```

---

## Tabla de Compatibilidad

| Característica | Chrome | Firefox | Safari | Edge | IE11 |
|----------------|--------|---------|--------|------|------|
| Event Binding | ✅ | ✅ | ✅ | ✅ | ❌ |
| @HostListener | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Renderer2 | ✅ | ✅ | ✅ | ✅ | ✅ |
| matchMedia | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| classList | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| preventDefault | ✅ | ✅ | ✅ | ✅ | ✅ |
| stopPropagation | ✅ | ✅ | ✅ | ✅ | ✅ |
| ViewChild | ✅ | ✅ | ✅ | ✅ | ✅ |

### Notas:
- **IE11**: No soportado. Angular 17+ requiere navegadores modernos.
- **matchMedia**: Parcialmente soportado en IE11, verificar fallback.
- Todos los navegadores modernos (últimas 2 versiones) soportan completamente FASE 1.

---

## Estándares Utilizados

- **ECMAScript 2020** (ES11): Template literals, arrow functions, async/await
- **DOM Level 4**: Event API estándar
- **CSS Media Queries**: Para detección de preferencias del sistema
- **Web Accessibility Initiative (WAI)**: ARIA attributes para accesibilidad
- **Angular 21**: Standalone Components, Control Flow (@if, @for)
