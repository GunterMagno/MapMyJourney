import { Routes } from '@angular/router';
import { TripsPageComponent } from '../../components/pages/trips-page/trips-page';
import { TripLayoutComponent } from './components/trip-layout/trip-layout';

/**
 * Rutas del módulo de Viajes (Trips)
 * 
 * Estructura:
 * - '': Listado de viajes (TripsPageComponent)
 * - ':id': Layout de viaje con rutas hijas
 *   ├─ '/dashboard': Dashboard del viaje
 *   ├─ '/itinerario': Itinerario del viaje
 *   ├─ '/gastos': Gestión de gastos
 *   ├─ '/documentos': Documentos del viaje
 *   ├─ '/votaciones': Votaciones del viaje
 *   └─ '/compartir': Compartir viaje
 * 
 * Estrategia de Carga: Lazy Loading (loadChildren)
 * El TripLayoutComponent proporciona el sidebar compartido para todas las vistas
 */
export const TRIPS_ROUTES: Routes = [
  {
    path: '',
    component: TripsPageComponent,
    data: { breadcrumb: 'Viajes' }
  },
  {
    path: ':id',
    component: TripLayoutComponent,
    data: { breadcrumb: 'Viaje' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => 
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'itinerario',
        loadComponent: () => 
          import('./pages/itinerary/itinerary.component').then(m => m.ItineraryComponent),
        data: { breadcrumb: 'Itinerario' }
      },
      {
        path: 'gastos',
        loadComponent: () => 
          import('./pages/expenses/expenses.component').then(m => m.ExpensesComponent),
        data: { breadcrumb: 'Gastos' }
      },
      {
        path: 'documentos',
        loadComponent: () => 
          import('./pages/documents/documents.component').then(m => m.DocumentsComponent),
        data: { breadcrumb: 'Documentos' }
      },
      {
        path: 'votaciones',
        loadComponent: () => 
          import('./pages/polls/polls.component').then(m => m.PollsComponent),
        data: { breadcrumb: 'Votaciones' }
      },
      {
        path: 'compartir',
        loadComponent: () => 
          import('./pages/share/share.component').then(m => m.ShareComponent),
        data: { breadcrumb: 'Compartir' }
      },
      {
        path: 'configuracion',
        loadComponent: () => 
          import('./pages/trip-settings/trip-settings').then(m => m.TripSettingsComponent),
        data: { breadcrumb: 'Configuración' }
      }
    ]
  }
];
