import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Auth Guard - Protege rutas privadas
 *
 * Verifica si el usuario está autenticado. Si no lo está, redirige a /auth/login
 * pasando la URL actual como queryParam (returnUrl) para volver después del login.
 *
 * Uso en rutas:
 * { path: 'usuario', canActivate: [authGuard], component: UserLayoutComponent }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Simular verificación de autenticación
  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirigir a login con URL de retorno
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};
