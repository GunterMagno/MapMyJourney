# FASE 4: Sistema de Rutas y Navegación

## Mapa completo de rutas de la aplicación

| Ruta                          | Descripción                     | Lazy | Guards                  | Resolver           |
|-------------------------------|---------------------------------|------|-------------------------|--------------------|
| `/demo`                      | Página de inicio                | ❌   | -                       | -                  |
| `/trips`                     | Listado de viajes               | ❌   | -                       | -                  |
| `/trips/:id`                 | Detalle de viaje (pendiente)    | ❌   | -                       | -                  |
| `/usuario`                   | Área de usuario (layout)        | ❌   | `authGuard`             | -                  |
| `/usuario/perfil`            | Perfil de usuario               | ❌   | `authGuard`, `pendingChangesGuard` | - |
| `/usuario/itinerario`        | Resumen del itinerario con días | ❌   | `authGuard`             | -                  |
| `/auth/login`                | Pantalla de autenticación       | ❌   | -                       | -                  |
| `/auth/signup`               | Registro de usuario             | ❌   | -                       | -                  |
| `/style-guide`               | Guía de estilos                 | ❌   | -                       | -                  |
| `**`                         | Página 404                      | ❌   | -                       | -                  |

---

## Estrategia de Lazy Loading

### Estructura Actual
En esta fase, todos los componentes están cargados en el bundle inicial. La aplicación utiliza una estrategia de **precarga automática** para optimizar el rendimiento sin fragmentar los bundles aún.

### Configuración de PreloadAllModules

Se usa `PreloadAllModules` en `app.config.ts` para que los módulos lazy carguen automáticamente en segundo plano tras la carga inicial:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules) // Precarga todos los lazy-loaded modules
    )
  ]
};
```

### Ventajas de esta estrategia

1. **Bundle inicial pequeño**: El navegador descarga primero solo lo esencial
2. **Navegación rápida**: Cuando el usuario navega a rutas lazy, ya están precargadas
3. **Mejor UX**: Evita "loading spinners" innecesarios
4. **Escalable**: Preparado para futuros módulos lazy con `loadChildren`

### Estructura de rutas anidadas

La aplicación implementa rutas anidadas con `router-outlet` en componentes padres:

```typescript
// app.routes.ts (resumen)
export const routes: Routes = [
  { path: 'demo', component: DemoPageComponent, data: { breadcrumb: 'Demo' } },
  { path: 'trips', component: TripsPageComponent, data: { breadcrumb: 'Viajes' } },
  {
    path: 'usuario',
    component: UserLayoutComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Mi Cuenta' },
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
      {
        path: 'perfil',
        component: UserProfileComponent,
        canDeactivate: [pendingChangesGuard],
        data: { breadcrumb: 'Perfil' }
      },
      {
        path: 'itinerario',
        component: ItineraryComponent,
        data: { breadcrumb: 'Mi Itinerario' }
      }
    ]
  },
  { path: 'trips/:id', component: TripDetailComponent, resolve: { trip: tripResolver }, data: { breadcrumb: 'Detalle del Viaje' } },
  { path: '**', component: NotFoundComponent }
];
```

### Verificación en producción

Para verificar que el lazy loading funciona correctamente:

```bash
# Build de producción
ng build --configuration production

# Verifica los chunks en dist/frontend/browser/
# main.*.js          → bundle principal
# chunk-*.js         → módulos lazy (si los hay)
```

---

## Guards Implementados

### authGuard (CanActivateFn)

**Objetivo**: Proteger rutas privadas requiriendo autenticación

**Comportamiento**: 
- Si el usuario NO está autenticado → redirige a `/auth/login` con `returnUrl` en query params
- Si el usuario SÍ está autenticado → permite acceso

**Rutas protegidas**:
- `/usuario/*` (perfil, itinerario)

**Implementación**:

```typescript
// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirige a login con URL de retorno
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

**Ejemplo de uso en rutas**:

```typescript
{
  path: 'usuario',
  component: UserLayoutComponent,
  canActivate: [authGuard]
}
```

---

### pendingChangesGuard (CanDeactivateFn)

**Objetivo**: Evitar que el usuario pierda cambios sin guardar en formularios

**Comportamiento**:
- Si el formulario está `dirty` (tiene cambios) → muestra `confirm()` del navegador
- Si el usuario elige "Cancelar" → bloquea la navegación
- Si el usuario elige "Aceptar" → permite navegar

**Rutas protegidas**:
- `/usuario/perfil` (componente con formulario reactivo de edición)

**Implementación**:

```typescript
// core/guards/pending-changes.guard.ts
import { CanDeactivateFn } from '@angular/router';
import { FormGroup } from '@angular/forms';

export interface FormComponent {
  form: FormGroup;
}

export const pendingChangesGuard: CanDeactivateFn<FormComponent> = (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  if (component.form?.dirty) {
    return confirm('⚠️ Hay cambios sin guardar. ¿Seguro que quieres salir?');
  }
  return true;
};
```

**Ejemplo de uso en componente**:

```typescript
// components/pages/user/user-profile.component.ts
export class UserProfileComponent implements FormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

  onSubmit(): void {
    // Guardar cambios
    this.form.markAsPristine(); // Limpia el estado "dirty"
  }
}
```

**En rutas**:

```typescript
{
  path: 'perfil',
  component: UserProfileComponent,
  canDeactivate: [pendingChangesGuard]
}
```

---

## Resolvers Implementados

### tripResolver (ResolveFn<Trip | null>)

**Objetivo**: Precargar los datos del viaje ANTES de activar la ruta `/trips/:id`

**Comportamiento**:
- Se ejecuta automáticamente antes de que el componente se cargue
- Si encuentra el viaje → retorna los datos
- Si NO encuentra el viaje → retorna `null`
- El componente recibe los datos ya listos en `route.data`

**Ubicación**: `core/resolvers/product.resolver.ts` (mantiene nombre para compatibilidad)

**Implementación**:

```typescript
import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

// Servicio simulado (reemplazar con HttpClient en producción)
class ProductService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Viaje a Barcelona',
      description: 'Una experiencia inolvidable por las calles de Barcelona',
      price: 1299,
      category: 'Europa'
    },
    {
      id: '2',
      name: 'Aventura en Machu Picchu',
      description: 'Descubre una de las 7 maravillas del mundo',
      price: 2199,
      category: 'América Latina'
    },
    {
      id: '3',
      name: 'Safari en Kenya',
      description: 'Observa la fauna silvestre en su hábitat natural',
      price: 1899,
      category: 'África'
    }
  ];

  getProductById(id: string): Observable<Product | null> {
    const product = this.products.find(p => p.id === id);
    return of(product || null);
  }
}

export const productResolver: ResolveFn<Product | null> = (
  route: ActivatedRouteSnapshot
) => {
  const productService = new ProductService();
  const id = route.paramMap.get('id');
  
  if (!id) {
    return of(null);
  }
  
  return productService.getProductById(id);
};
```

**En rutas**:

```typescript
{
  path: 'productos/:id',
  component: ProductDetailComponent,
  resolve: { product: productResolver }
}
```

**En el componente**:

```typescript
// components/pages/products/product-detail.component.ts
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // El resolver ha precargado los datos automáticamente
    this.route.data.subscribe(({ product }) => {
      this.product = product || null;
    });
  }
}
```

### Manejo de errores

En caso de error en el resolver, el componente puede mostrar un mensaje de fallo:

```typescript
// En el resolver
export const productResolver: ResolveFn<Product | null> = (route) => {
  const service = inject(ProductService);
  const id = route.paramMap.get('id')!;

  return service.getProductById(id).pipe(
    catchError(err => {
      console.error('Error cargando producto:', err);
      return of(null); // Retorna null si hay error
    })
  );
};

// En el componente
ngOnInit(): void {
  this.route.data.subscribe(({ product }) => {
    if (!product) {
      this.errorMessage = 'Producto no encontrado';
    }
    this.product = product;
  });
}
```

---

## Breadcrumbs Dinámicos

La aplicación incluye un componente de breadcrumbs que se actualiza automáticamente al navegar:

### Funcionamiento

1. El `BreadcrumbService` escucha eventos `NavigationEnd` del Router
2. Recorre recursivamente el árbol de `ActivatedRoute`
3. Extrae los metadatos `data.breadcrumb` de cada ruta
4. Construye un array de `BreadcrumbItem[]`
5. El `BreadcrumbComponent` muestra las migas de pan

### Ejemplo de breadcrumbs generados

```
/demo                   → "Inicio"
/trips                  → "Inicio / Viajes"
/trips/1                → "Inicio / Viajes / Detalle del Viaje"
/usuario/perfil         → "Inicio / Mi Cuenta / Perfil"
/usuario/itinerario     → "Inicio / Mi Cuenta / Mi Itinerario"
/auth/login             → "Inicio / Autenticación / Iniciar Sesión"
```

### Configuración en rutas

Cada ruta que desee aparecer en breadcrumbs debe incluir metadatos:

```typescript
export const routes: Routes = [
  { path: 'demo', component: DemoPageComponent, data: { breadcrumb: 'Demo' } },
  { path: 'trips', component: TripsPageComponent, data: { breadcrumb: 'Viajes' } },
  {
    path: 'usuario',
    component: UserLayoutComponent,
    data: { breadcrumb: 'Mi Cuenta' },
    children: [
      { path: 'perfil', component: UserProfileComponent, data: { breadcrumb: 'Perfil' } },
      { path: 'itinerario', component: ItineraryComponent, data: { breadcrumb: 'Mi Itinerario' } }
    ]
  }
];
```

---

## Resumen de Archivos Creados

| Archivo | Tipo | Responsabilidad |
|---------|------|-----------------|
| `core/guards/auth.guard.ts` | Guard | Protege rutas privadas |
| `core/guards/pending-changes.guard.ts` | Guard | Protege formularios sin guardar |
| `core/resolvers/product.resolver.ts` | Resolver | Precarga datos de viaje |
| `services/breadcrumb.service.ts` | Service | Construye breadcrumbs dinámicamente |
| `components/shared/breadcrumb/breadcrumb.component.ts` | Component | Muestra breadcrumbs en UI |
| `components/pages/user/user-layout.component.ts` | Component | Layout de usuario con sidebar |
| `components/pages/user/user-profile.component.ts` | Component | Perfil editable de usuario |
| `components/pages/user/itinerary.component.ts` | Component | Resumen itinerario con accordion |
| `components/pages/products/product-detail.component.ts` | Component | Detalle de viaje |

---

## Mejores Prácticas Implementadas

1. **Guards Funcionales**: Usando `CanActivateFn` y `CanDeactivateFn` (moderno Angular 15+)
2. **Inyección de Dependencias**: Con `inject()` en lugar de constructores
3. **Observables**: BehaviorSubject para estado reactivo
4. **HTML Semántico**: `<nav>`, `<ol>`, `<li>` con `aria-current`
5. **Responsive Design**: Breakpoints en 640px, 768px, 1024px
6. **BEM CSS**: Nomenclatura consistente (`.block__element--modifier`)
7. **Variables CSS**: 100% uso de tokens del sistema
8. **Documentación**: JSDoc en archivos fuente

