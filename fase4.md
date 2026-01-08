
FASE 4: SISTEMA DE RUTAS Y NAVEGACIÓN¶

Criterios: RA6.g, RA6.h

Entrega: 18 de diciembre (paralela a DIW Fases 1-2-3-4)

Objetivos:

Implementar sistema completo de navegación SPA con Angular Router. Las páginas usan los layouts que estás creando en DIW.
Tarea 1: Configuración de rutas¶

La configuración de rutas para este proyecto Angular puede quedar documentada así en tu README técnico.
Rutas principales¶

Define las rutas base de la SPA para home, listado, detalle genérico, formularios y about.^1

// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProductListComponent } from './features/products/product-list.component';
import { ProductDetailComponent } from './features/products/product-detail.component';
import { ProductFormComponent } from './features/products/product-form.component';
import { AboutComponent } from './features/about/about.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  { path: 'home', component: HomeComponent },
  { path: 'productos', component: ProductListComponent },
  { path: 'productos/nuevo', component: ProductFormComponent },
  { path: 'about', component: AboutComponent },

  // wildcard 404 siempre la última
  { path: '**', component: NotFoundComponent }
];

Rutas con parámetros¶

Para pantallas de detalle se usan rutas con parámetros tipo /productos/:id, accediendo al id vía @Input() o ActivatedRoute.^2

// app.routes.ts (añadir)
{ path: 'productos/:id', component: ProductDetailComponent }

// product-detail.component.ts (opción clásica)
constructor(private route: ActivatedRoute) {}

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id'); // string | null
}

<!-- ejemplo de navegación con routerLink -->
<a [routerLink]="['/productos', producto.id]">Ver detalle</a>

Rutas hijas anidadas¶

Para secciones con subpáginas (por ejemplo área de usuario) se definen child routes con <router-outlet> interno.^4

// app.routes.ts
import { UserLayoutComponent } from './features/user/user-layout.component';
import { UserProfileComponent } from './features/user/user-profile.component';
import { UserOrdersComponent } from './features/user/user-orders.component';

export const routes: Routes = [
  // ...
  {
    path: 'usuario',
    component: UserLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
      { path: 'perfil', component: UserProfileComponent },
      { path: 'pedidos', component: UserOrdersComponent }
    ]
  },
  { path: '**', component: NotFoundComponent }
];

<!-- user-layout.component.html -->
<nav>
  <a routerLink="perfil" routerLinkActive="active">Perfil</a>
  <a routerLink="pedidos" routerLinkActive="active">Pedidos</a>
</nav>

<router-outlet></router-outlet>

Ruta wildcard para 404¶

La ruta wildcard ** captura cualquier URL no reconocida y muestra una página 404 personalizada; debe ir siempre en último lugar.^6

// shared/not-found/not-found.component.ts
@Component({
  selector: 'app-not-found',
  template: `
    <h1>404 - Página no encontrada</h1>
    <p>La ruta solicitada no existe.</p>
    <a routerLink="/home">Volver al inicio</a>
  `
})
export class NotFoundComponent {}

// app.routes.ts (ya visto)
{ path: '**', component: NotFoundComponent }

⁂
Tarea 2: Navegación programática¶

La navegación programática en Angular se hace con el servicio Router, pasando comandos de ruta y un objeto NavigationExtras para parámetros, query params, fragmentos y estado adicional.^1
Usar Router para navegación desde código¶

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actions',
  template: `<button (click)="goHome()">Ir a inicio</button>`
})
export class ActionsComponent {
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/home']); // navegación absoluta
  }

  goToProducts() {
    this.router.navigate(['productos']); // según ruta raíz
  }
}

Pasar parámetros de ruta¶

// Ruta definida como: { path: 'productos/:id', component: ProductDetailComponent }

verDetalle(productId: number) {
  this.router.navigate(['/productos', productId]);
}

En el componente de destino se lee el parámetro:

import { ActivatedRoute } from '@angular/router';

productId = signal<number | null>(null);
route = inject(ActivatedRoute);

ngOnInit() {
  this.route.paramMap.subscribe(params => {
    this.productId.set(Number(params.get('id')));
  });
}

Query params y fragments¶

// /productos?categoria=libros&page=2#comentarios
filtrar() {
  this.router.navigate(
    ['/productos'],
    {
      queryParams: { categoria: 'libros', page: 2 },
      fragment: 'comentarios'
    }
  );
}

Opciones útiles:

    queryParamsHandling: 'merge' | 'preserve' para conservar o fusionar query params existentes.
    relativeTo para navegar relativo a la ruta actual.^2

NavigationExtras para estado¶

NavigationExtras permite controlar historia, query params y pasar estado no visible en la URL.^3

checkout(order: Order) {
  this.router.navigate(
    ['/checkout/resumen'],
    {
      state: { order },          // datos en memoria, no en URL
      replaceUrl: true,          // no añade entrada al historial
      skipLocationChange: false, // muestra la URL actualizada
    }
  );
}

En el componente de destino:

import { Router } from '@angular/router';

router = inject(Router);

ngOnInit() {
  const navigation = this.router.getCurrentNavigation();
  const order = navigation?.extras.state?.['order'] as Order | undefined;
}

Propiedades clave de NavigationExtras:
Propiedad 	Uso principal
queryParams 	Filtros, paginación, búsqueda
fragment 	Scroll a secciones (#comentarios)
queryParamsHandling 	Conservar/mezclar query params existentes
state 	Pasar objetos sin exponerlos en la URL
replaceUrl 	Evitar contaminar el historial (redirects, login)
skipLocationChange 	Navegar sin cambiar la URL visible

⁂
Tarea 3: Lazy Loading¶

La carga perezosa en Angular divide la app en “trozos” (chunks) que se descargan solo cuando se navega a sus rutas, y opcionalmente se precargan en segundo plano con PreloadAllModules para mejorar la UX.^1
Módulos / rutas con carga perezosa¶

Con módulos de funcionalidad:

// app.routes.ts
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'tienda',
    loadChildren: () =>
      import('./features/shop/shop.module').then(m => m.ShopModule)
  }
];

Con standalone + rutas perezosas:

export const routes: Routes = [
  {
    path: 'perfil',
    loadComponent: () =>
      import('./features/user/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'pedidos',
    loadChildren: () =>
      import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES)
  }
];

Estrategia de precarga (PreloadAllModules)¶

En configuración standalone:

import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules) // precarga todos los lazy routes
    )
  ]
};

Así los módulos marcados con loadChildren se descargan en segundo plano después de la primera carga, reduciendo esperas en la primera navegación a esas secciones.^3^5
Verificar chunking en build production¶

    Ejecuta build prod:

    ng build --configuration production

    En dist/<app>/browser verás varios ficheros .js; el main.*.js es el bundle inicial y cada feature lazy genera un chunk adicional (nombres tipo admin-admin-module.*.js, orders-orders-routes.*.js, etc.).^6
    En la consola de build, Angular CLI lista los bundles con su tamaño; comprueba que tus módulos perezosos aparecen como bundles separados y que el main no incluye todo.^6
    Opcional: en las DevTools del navegador, pestaña “Network”, filtra por *.js y navega a una ruta lazy; deberías ver cómo se descarga el chunk correspondiente justo en ese momento (o antes si usas precarga).^8

⁂
Tarea 4: Route Guards¶

Los route guards controlan si una navegación se permite, se cancela o redirige, según autenticación o estado del formulario.^1
CanActivate para proteger rutas¶

// auth.service.ts (simulación simple)
@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = false; // simular login

  login()  { this.isLoggedIn = true; }
  logout() { this.isLoggedIn = false; }
}

// auth.guard.ts (CanActivate funcional)
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn) {
    return true;
  }

  // redirige a /login con la URL de retorno
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// app.routes.ts
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin', canActivate: [authGuard], component: AdminComponent },
];

Simular autenticación y redirección¶

// login.component.ts
@Component({ /* ... */ })
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  onLogin() {
    this.auth.login(); // simula login OK
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
    this.router.navigateByUrl(returnUrl);
  }
}

El guard redirige a /login si no está autenticado, y tras hacer login se vuelve a la URL original usando returnUrl.^2
CanDeactivate para formularios con cambios sin guardar¶

Define una interfaz para componentes con formulario y un guard funcional que pregunte si el form está sucio.^4

// pending-changes.guard.ts
export interface FormComponent {
  form: FormGroup;
}

export const pendingChangesGuard: CanDeactivateFn<FormComponent> =
  (component, currentRoute, currentState, nextState) => {
    if (component.form?.dirty) {
      return confirm('Hay cambios sin guardar. ¿Seguro que quieres salir?');
    }
    return true;
  };

// app.routes.ts
{ path: 'perfil/editar',
  component: ProfileFormComponent,
  canDeactivate: [pendingChangesGuard]
}

// profile-form.component.ts
export class ProfileFormComponent implements FormComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });
}

Si el formulario tiene cambios (dirty) y el usuario intenta salir, el guard lanza el confirm; si responde “Cancelar”, se bloquea la navegación.^6
⁂

^20: https://www.angularthink.in/2023/06/angular-router-guards .html
Tarea 5: Resolvers¶

Un resolver permite precargar datos antes de que se active la ruta, de forma que el componente ya recibe todo listo y puede mostrar un loading o un error de forma controlada.^1
Resolver para precargar datos¶

// product.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProductService } from './product.service';

export const productResolver: ResolveFn<Product> = (route, state) => {
  const service = inject(ProductService);
  const id = route.paramMap.get('id')!;
  return service.getProductById(id); // Observable<Product>
};

// app.routes.ts
export const routes: Routes = [
  {
    path: 'productos/:id',
    component: ProductDetailComponent,
    resolve: { product: productResolver }
  }
];

En el componente se lee el dato resuelto:

// product-detail.component.ts
route = inject(ActivatedRoute);
product = signal<Product | null>(null);

ngOnInit() {
  this.route.data.subscribe(({ product }) => this.product.set(product));
}

Loading state mientras resuelve¶

Como la ruta no se activa hasta que el resolver termina, se suele mostrar un spinner global o una página intermedia.^3

Opción sencilla: usar un servicio de loading alrededor de la navegación:

// product.service.ts (ejemplo)
getProductById(id: string): Observable<Product> {
  this.loading.show();
  return this.http.get<Product>(`/api/products/${id}`).pipe(
    finalize(() => this.loading.hide())
  );
}

El router mantiene la vista anterior hasta que el resolver complete; el usuario ve el spinner global mientras llega la respuesta.

Alternativa más explícita: resolver un “wrapper” con estado.

// product.resolver.ts
export interface ProductResolved {
  loading: boolean;
  error?: string;
  data?: Product;
}

export const productResolver: ResolveFn<ProductResolved> = (route, state) => {
  const service = inject(ProductService);
  const id = route.paramMap.get('id')!;

  return service.getProductById(id).pipe(
    map(data => ({ loading: false, data })),
    startWith({ loading: true }),
    catchError(() => of({ loading: false, error: 'No se pudo cargar el producto' }))
  );
};

// product-detail.component.ts
this.route.data.subscribe(({ product }) => {
  this.state.set(product as ProductResolved);
});

Manejo de errores en resolver¶

En caso de error, el resolver puede:

    Devolver un objeto con error y que el componente lo trate.
    O redirigir a otra ruta (lista, 404, etc.).^5^1

Ejemplo con redirección:

// product.resolver.ts
export const productResolver: ResolveFn<Product | null> = (route, state) => {
  const service = inject(ProductService);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  return service.getProductById(id).pipe(
    catchError(err => {
      // navega a /productos y pasa mensaje de error vía state
      router.navigate(['/productos'], {
        state: { error: `No existe el producto con id ${id}` }
      });
      return of(null);
    })
  );
};

En la lista de productos se lee el posible error:

// product-list.component.ts
router = inject(Router);

ngOnInit() {
  const nav = this.router.getCurrentNavigation();
  this.errorMessage = nav?.extras.state?.['error'] ?? null;
}

Este patrón deja la UX clara:

    Resolver = carga y decide si se puede entrar.
    Componente = muestra datos, loading o error según lo resuelto.^7

⁂
Tarea 6: Breadcrumbs dinámicos¶

Los breadcrumbs dinámicos se pueden generar a partir de la configuración de rutas usando data en cada ruta y escuchando NavigationEnd para reconstruir la ruta de migas tras cada navegación.^1
Generar breadcrumbs desde las rutas¶

    Añade metadatos data.breadcrumb en tus rutas.

    // app.routes.ts
    export const routes: Routes = [
      { path: 'home', component: HomeComponent, data: { breadcrumb: 'Inicio' } },
      { path: 'productos', component: ProductListComponent, data: { breadcrumb: 'Productos' } },
      { path: 'productos/:id', component: ProductDetailComponent, data: { breadcrumb: 'Detalle' } },
      {
        path: 'usuario',
        component: UserLayoutComponent,
        data: { breadcrumb: 'Usuario' },
        children: [
          { path: 'perfil', component: UserProfileComponent, data: { breadcrumb: 'Perfil' } },
          { path: 'pedidos', component: UserOrdersComponent, data: { breadcrumb: 'Pedidos' } }
        ]
      }
    ];

    Crea un servicio que construya el array de breadcrumbs recorriendo el árbol de rutas activas en cada NavigationEnd.^3

    // breadcrumb.service.ts
    import { Injectable } from '@angular/core';
    import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
    import { BehaviorSubject, filter } from 'rxjs';

    export interface Breadcrumb {
      label: string;
      url: string;
    }

    @Injectable({ providedIn: 'root' })
    export class BreadcrumbService {
      private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
      readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

      constructor(private router: Router, private route: ActivatedRoute) {
        this.router.events
          .pipe(filter(event => event instanceof NavigationEnd))
          .subscribe(() => {
            const breadcrumbs: Breadcrumb[] = [];
            this.buildCrumbs(this.route.root, '', breadcrumbs);
            this._breadcrumbs$.next(breadcrumbs);
          });
      }

      private buildCrumbs(route: ActivatedRoute, url: string, crumbs: Breadcrumb[]) {
        const children = route.children;
        if (!children || !children.length) return;

        for (const child of children) {
          const routeURL = child.snapshot.url.map(segment => segment.path).join('/');
          if (routeURL) {
            url += `/${routeURL}`;
            const label = child.snapshot.data['breadcrumb'] as string | undefined;
            if (label) {
              crumbs.push({ label, url });
            }
          }
          this.buildCrumbs(child, url, crumbs);
        }
      }
    }

Actualizar según navegación¶

Crea un componente que se suscriba al servicio y pinte las migas, actualizándose automáticamente con cada navegación.^5

// breadcrumb.component.ts
import { Component, OnInit } from '@angular/core';
import { BreadcrumbService, Breadcrumb } from './breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit() {
    this.breadcrumbService.breadcrumbs$.subscribe(crumbs => this.breadcrumbs = crumbs);
  }
}

<!-- breadcrumb.component.html -->
<nav aria-label="breadcrumb" *ngIf="breadcrumbs.length">
  <ol class="breadcrumb">
    <li class="breadcrumb-item">
      <a routerLink="/home">Inicio</a>
    </li>

    <li
      *ngFor="let crumb of breadcrumbs; let last = last"
      class="breadcrumb-item"
      [class.active]="last"
      [attr.aria-current]="last ? 'page' : null"
    >
      <ng-container *ngIf="!last">
        <a [routerLink]="crumb.url">{{ crumb.label }}</a>
      </ng-container>
      <ng-container *ngIf="last">
        {{ crumb.label }}
      </ng-container>
    </li>
  </ol>
</nav>

/* breadcrumb.component.scss */
.breadcrumb {
  margin: 0 0 1rem;
  padding: 0;
  background: transparent;
}
.breadcrumb-item + .breadcrumb-item::before {
  content: '>';
}

Coloca <app-breadcrumb></app-breadcrumb> encima de tu <router-outlet> principal para que los breadcrumbs reflejen siempre la ruta actual.^5
⁂
Tarea 7: Documentación¶

Para la documentación de tu proyecto Angular, esta podría ser la sección de rutas y navegación para el README/mkdocs.
Mapa completo de rutas¶

Incluye un mapa resumido de todas las rutas con su propósito, guardas y resolvers.^1

### Mapa de rutas de la aplicación

| Ruta                          | Descripción                     | Lazy | Guards                  | Resolver           |
|-------------------------------|---------------------------------|------|-------------------------|--------------------|
| `/home`                      | Página de inicio                | ❌   | -                       | -                  |
| `/about`                     | Información de la app           | ❌   | -                       | -                  |
| `/productos`                 | Listado de productos            | ✅   | `authGuard` (ejemplo)   | `productsResolver` |
| `/productos/nuevo`           | Formulario alta producto        | ✅   | `authGuard`             | -                  |
| `/productos/:id`             | Detalle de producto             | ✅   | `authGuard`             | `productResolver`  |
| `/usuario`                   | Área de usuario (layout)        | ✅   | `authGuard`             | -                  |
| `/usuario/perfil`            | Perfil de usuario               | ✅   | `authGuard`             | `userResolver`     |
| `/usuario/perfil/editar`     | Form perfil (con cambios)       | ✅   | `authGuard`, `pendingChangesGuard` | `userResolver` |
| `/usuario/pedidos`           | Listado de pedidos              | ✅   | `authGuard`             | `ordersResolver`   |
| `/login`                     | Pantalla de autenticación       | ❌   | -                       | -                  |
| `**`                         | Página 404                      | ❌   | -                       | -                  |

Estrategia de lazy loading explicada¶

Describe cómo se dividen las features y cómo se precargan.^3^5

### Estrategia de lazy loading

- Las secciones **Productos** y **Usuario** se cargan de forma perezosa para reducir el tamaño del bundle inicial.
- Cada feature define sus rutas en un módulo/rutas propio y se carga con `loadChildren` o `loadComponent`.

// app.routes.ts (resumen) export const routes: Routes = [ { path: 'productos', loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES) }, { path: 'usuario', loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES) }, { path: 'login', component: LoginComponent }, { path: '', pathMatch: 'full', redirectTo: 'home' }, { path: '**', component: NotFoundComponent } ];

- Se usa `PreloadAllModules` para precargar en segundo plano todos los módulos lazy una vez cargada la app:

// app.config.ts import { provideRouter, withPreloading } from '@angular/router'; import { PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = { providers: [ provideRouter(routes, withPreloading(PreloadAllModules)) ] };

- En el build de producción (`ng build --configuration production`) se verifican los **chunks** generados: cada feature lazy produce su propio `.js` separado, reduciendo el tamaño de `main`.[web:121][web:122]

Guards y resolvers documentados¶

Explica para qué sirve cada guard/resolver y en qué rutas se aplica.^6^8

### Guards implementados

- `authGuard` (`CanActivateFn`)
  - Objetivo: proteger rutas privadas si el usuario no está autenticado.
  - Comportamiento: si no hay sesión, redirige a `/login` pasando `returnUrl` en `queryParams`.
  - Rutas: `/productos`, `/productos/**`, `/usuario/**`.

export const authGuard: CanActivateFn = (route, state) => {
const auth = inject(AuthService);
const router = inject(Router);

return auth.isLoggedIn
? true
: router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

    pendingChangesGuard (CanDeactivateFn)
    Objetivo: evitar perder cambios en formularios reactivos.
    Comportamiento: si form.dirty muestra un confirm() antes de salir.
    Rutas: /usuario/perfil/editar.

export interface FormComponent { form: FormGroup; }

export const pendingChangesGuard: CanDeactivateFn<FormComponent> =
(component) => component.form?.dirty
? confirm('Hay cambios sin guardar. ¿Salir igualmente?')
: true;

Resolvers implementados¶

    productsResolver
    Carga el listado de productos antes de activar /productos.
    productResolver
    Carga un producto concreto antes de activar /productos/:id.
    userResolver
    Carga los datos del usuario antes de /usuario/perfil y /usuario/perfil/editar.
    ordersResolver
    Carga pedidos antes de /usuario/pedidos.

export const productResolver: ResolveFn<Product> = (route) => {
const service = inject(ProductService);
const id = route.paramMap.get('id')!;
return service.getProductById(id);
};

export const routes: Routes = [
{
path: 'productos/:id',
component: ProductDetailComponent,
resolve: { product: productResolver },
canActivate: [authGuard]
}
];

    Errores en resolvers:
    En caso de error se redirige a /productos con mensaje en state, o se devuelve un objeto { error, data: null } que el componente interpreta para mostrar un mensaje de fallo.[web:166][web:168] ```

⁂
Entregables:¶

    Sistema de rutas completo (mínimo 5 rutas principales)
    Lazy loading en al menos 1 módulo
    Route guards implementados
    Resolver en al menos 1 ruta
    Navegación funcional en toda la aplicación
    Breadcrumbs dinámicos
    Documentación de rutas

