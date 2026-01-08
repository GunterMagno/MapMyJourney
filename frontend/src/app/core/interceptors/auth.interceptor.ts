/**
 * Auth Interceptor - Inyecta token JWT en headers
 * 
 * Agrega el header Authorization: Bearer {token} a todas las peticiones
 * si existe un token en localStorage
 */

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
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
