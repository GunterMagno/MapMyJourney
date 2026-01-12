import { Routes } from '@angular/router';
import { StyleGuideComponent } from './components/pages/style-guide/style-guide';
import { DemoPageComponent } from './components/pages/demo-page/demo-page';
import { HomeComponent } from './components/pages/home/home';
import { LoginFormComponent } from './components/auth/login-form/login-form';
import { SignupFormComponent } from './components/auth/signup-form/signup-form';
import { TripsPageComponent } from './components/pages/trips-page/trips-page';
import { NotFoundComponent } from './components/pages/not-found/not-found';
import { authGuard } from './core/guards/auth.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';
import { tripResolver } from './core/resolvers';
import { UserLayoutComponent } from './components/pages/user/user-layout.component';
import { UserProfileComponent } from './components/pages/user/user-profile.component';
import { ItineraryComponent } from './components/pages/user/itinerary.component';
//TODO: Crear TripDetailComponent (componente para mostrar detalles de un viaje)
  // {
  //   path: 'trips/:id',
  //   component: TripDetailComponent,
  //   resolve: { trip: productResolver },
  //   data: { breadcrumb: 'Detalle del Viaje' }
  // },
/**
 * Rutas principales de la aplicación
 *
 * Estructura:
 * - Rutas públicas: home, auth, trips
 * - Rutas protegidas (con authGuard): usuario
 * - Rutas con resolvers: trips/:id
 * - Lazy loading: No implementado aún (modularización futura)
 * - Wildcard: ** (404)
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

  // Autenticación (público)
  {
    path: 'auth',
    data: { breadcrumb: 'Autenticación' },
    children: [
      {
        path: 'login',
        component: LoginFormComponent,
        data: { breadcrumb: 'Iniciar Sesión' }
      },
      {
        path: 'signup',
        component: SignupFormComponent,
        data: { breadcrumb: 'Registrarse' }
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Viajes (público)
  {
    path: 'trips',
    component: TripsPageComponent,
    data: { breadcrumb: 'Viajes' }
  },

  // Detalle de viaje con resolver
  // TODO: Crear TripDetailComponent (componente para mostrar detalles de un viaje)
  // {
  //   path: 'trips/:id',
  //   component: TripDetailComponent,
  //   resolve: { trip: productResolver },
  //   data: { breadcrumb: 'Detalle del Viaje' }
  // },

  // Usuario (protegido con authGuard)
  {
    path: 'usuario',
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
  },

  // Style guide (solo desarrollo)
  {
    path: 'style-guide',
    component: StyleGuideComponent,
    data: { breadcrumb: 'Guía de Estilos' }
  },

  // Wildcard 404 - Debe ser la última ruta
  {
    path: '**',
    component: NotFoundComponent
  }
];

