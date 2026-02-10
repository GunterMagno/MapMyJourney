import { Routes, PreloadAllModules } from '@angular/router';
import { DemoPageComponent } from './components/pages/demo-page/demo-page';
import { HomeComponent } from './components/pages/home/home';
import { NotFoundComponent } from './components/pages/not-found/not-found';
import { StatusPageComponent } from './components/pages/status-page/status-page';
import { AUTH_ROUTES } from './features/auth/auth.routes';
//TODO: Crear TripDetailComponent (componente para mostrar detalles de un viaje)
  // {
  //   path: 'trips/:id',
  //   component: TripDetailComponent,
  //   resolve: { trip: productResolver },
  //   data: { breadcrumb: 'Detalle del Viaje' }
  // },

/**
 * MAPA DE RUTAS PRINCIPAL - ARQUITECTURA CON LAZY LOADING
 * 
 * Estructura General:
 * ├─ '' (raíz) → home (pública)
 * ├─ '/demo' → demo (pública, solo desarrollo)
 * ├─ '/auth' → Feature Module (lazy loading) → login/signup
 * ├─ '/trips' → Feature Module (lazy loading) → listado + detalle con resolver
 * ├─ '/usuario' → Feature Module (lazy loading) → perfil + itinerario (protegidas)
 * ├─ '/admin' → Feature Module (lazy loading) → estilo, dashboard, etc.
 * └─ '/**' → 404 (wildcard - debe ser última)
 * 
 * ESTRATEGIA DE CARGA (Bloque 4.1 y 4.3):
 * - Lazy Loading: Cada feature module se carga bajo demanda
 * - Precarga: PreloadAllModules descarga chunks en segundo plano después de la carga inicial
 * - Tree-shaking: Code no usado en feature modules no se incluye en main bundle
 * 
 * RUTAS HIJAS (Bloque 4.3):
 * - Autenticación: login, signup (bajo /auth)
 * - Viajes: listado (''), detalle (':id') con resolver (bajo /trips)
 * - Usuario: perfil, itinerario (bajo /usuario, protegidas con authGuard)
 * 
 * RESOLVERS (Bloque 4.5):
 * - tripResolver: Carga datos del viaje antes de mostrar trip-detail
 *   → Manejo de errores: redirige a /404 si falla o no existe
 *   → Sin parpadeo: datos listos antes de render
 * 
 * GUARDS:
 * - authGuard: Protege rutas de usuario
 * - pendingChangesGuard: Confirma cambios sin guardar antes de navegar
 * 
 * @example
 * // Navegación programática con queryParams, fragment y state
 * this.router.navigate(
 *   ['/trips'],
 *   {
 *     queryParams: { orden: 'fecha_asc', pag: 1 },
 *     fragment: 'top',
 *     state: { origen: 'busqueda_avanzada' }
 *   }
 * );
 */
export const routes: Routes = [
  // Redirección raíz - Home
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // Página de inicio (Home)
  {
    path: 'home',
    component: HomeComponent,
    data: { breadcrumb: null }
  },

  // Página de demo (desarrollo)
  {
    path: 'demo',
    component: DemoPageComponent,
    data: { breadcrumb: 'Demo' }
  },

  // Página de estado de servicios
  {
    path: 'status',
    component: StatusPageComponent,
    data: { breadcrumb: 'Estado de Servicios' }
  },

  /**
   * FEATURE MODULE: Autenticación
   * Lazy Loading: Se carga bajo demanda cuando usuario navega a /auth
   * Rutas internas: login, signup
   * Protección: Ninguna (pública)
   * 
   * @route /auth
   * @loadChildren Carga el módulo de autenticación dinámicamente
   * @example
   * // URL en navegador: http://localhost:4200/auth/login
   */
  {
    path: 'auth',
    children: AUTH_ROUTES,
    data: { breadcrumb: 'Autenticación' }
  },

  /**
   * FEATURE MODULE: Viajes (Trips)
   * Lazy Loading: Se carga bajo demanda cuando usuario navega a /trips
   * Rutas internas:
   *   - '': Listado de viajes (TripsPageComponent)
   *   - ':id': Detalle de viaje (TripDetailComponent) con resolver
   * Protección: Ninguna (pública)
   * Resolvers: tripResolver (carga datos antes de mostrar detalle)
   * 
   * @route /trips
   * @loadChildren Carga el módulo de viajes dinámicamente
   * @example
   * // Listado: http://localhost:4200/trips
   * // Detalle:  http://localhost:4200/trips/123
   */
  {
    path: 'trips',
    loadChildren: () => import('./features/trips/trips.routes').then(m => m.TRIPS_ROUTES),
    data: { breadcrumb: 'Viajes' }
  },

  /**
   * FEATURE MODULE: Usuario (User)
   * Lazy Loading: Se carga bajo demanda cuando usuario navega a /usuario
   * Rutas internas (todas bajo /usuario):
   *   - 'perfil': Perfil del usuario
   *   - 'itinerario': Itinerario del usuario
   * Protección: authGuard (requiere estar autenticado)
   * Guards adicionales: pendingChangesGuard en perfil
   * 
   * @route /usuario
   * @loadChildren Carga el módulo de usuario dinámicamente
   * @guard authGuard Protege todas las rutas hijas
   * @example
   * // Perfil:    http://localhost:4200/usuario/perfil
   * // Itinerario: http://localhost:4200/usuario/itinerario
   */
  {
    path: 'usuario',
    loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
  },

  /**
   * FEATURE MODULE: Administración (Admin)
   * Lazy Loading: Se carga bajo demanda cuando usuario navega a /admin
   * Rutas internas:
   *   - 'style-guide': Guía de estilos
   *   - (agregar más según sea necesario)
   * Protección: authGuard (solo admin)
   * 
   * @route /admin
   * @loadChildren Carga el módulo de admin dinámicamente
   * @example
   * // Style Guide: http://localhost:4200/admin/style-guide
   */
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    data: { breadcrumb: 'Administración' }
  },

  /**
   * RUTA WILDCARD (404)
   * Captura cualquier ruta no definida y muestra NotFoundComponent
   * DEBE SER LA ÚLTIMA RUTA en el array
   * 
   * @route /**
   * @component NotFoundComponent Muestra página de error 404
   * @example
   * // URL desconocida: http://localhost:4200/ruta-inventada
   * // Resultado: Redirige a NotFoundComponent
   */
  {
    path: '**',
    component: NotFoundComponent
  }
];

