/**
 * Auth Interceptor - Inyecta token JWT en headers
 * 
 * Agrega el header Authorization: Bearer {token} a todas las peticiones
 * si existe un token en localStorage
 * Excluye las rutas de autenticación (/api/users/login, /api/users/register)
 */

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // No agregar tokens a las rutas de autenticación
  const isAuthRoute = req.url.includes('/users/login') || req.url.includes('/users/register');
  
  if (isAuthRoute) {
    return next(req);
  }

  // Obtener token del localStorage
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth_token')
    : null;

  // Si existe token, clonar request y agregar header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Agregar header X-App-Client
  req = req.clone({
    setHeaders: {
      'X-App-Client': 'MapMyJourney-Angular-17'
    }
  });

  return next(req);
};
