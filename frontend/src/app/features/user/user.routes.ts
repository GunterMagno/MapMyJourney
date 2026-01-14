import { Routes } from '@angular/router';
import { UserLayoutComponent } from '../../components/pages/user/user-layout.component';
import { UserProfileComponent } from '../../components/pages/user/user-profile.component';
import { ItineraryComponent } from '../../components/pages/user/itinerary.component';
import { authGuard } from '../../core/guards/auth.guard';
import { pendingChangesGuard } from '../../core/guards/pending-changes.guard';

/**
 * Rutas del módulo de Usuario (User)
 * 
 * Estructura:
 * - Layout: UserLayoutComponent (contenedor con sidebar/navbar)
 *   - perfil: Perfil del usuario (protegido)
 *   - itinerario: Itinerario del usuario (protegido)
 * 
 * Protección: authGuard en el nivel padre (aplica a todas las rutas hijas)
 * Guards adicionales: pendingChangesGuard en perfil (confirma cambios sin guardar)
 * 
 * Estrategia de Carga: Lazy Loading (loadChildren)
 */
export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Mi Cuenta' },
    children: [
      {
        path: '',
        redirectTo: 'perfil',
        pathMatch: 'full'
      },
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
  }
];
