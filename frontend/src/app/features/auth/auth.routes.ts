import { Routes } from '@angular/router';
import { LoginFormComponent } from '../../components/auth/login-form/login-form';
import { SignupFormComponent } from '../../components/auth/signup-form/signup-form';

/**
 * Rutas del módulo de Autenticación
 * 
 * Estructura:
 * - login: Página de inicio de sesión
 * - signup: Página de registro de usuario
 * - '': Redirección por defecto a login
 * 
 * Estrategia de Carga: Lazy Loading (loadChildren)
 */
export const AUTH_ROUTES: Routes = [
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
];
