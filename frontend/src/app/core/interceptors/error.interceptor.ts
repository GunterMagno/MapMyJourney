/**
 * Error Interceptor - Manejo centralizado de errores HTTP
 * 
 * - 401/403: Redirige a login
 * - 500: Muestra error genérico
 * - 4xx: Muestra mensaje del servidor
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError(error => {
      const statusCode = error.status;
      const errorMessage = error.error?.message || 'Error desconocido';
      const isAuthRoute = req.url.includes('/users/login') || req.url.includes('/users/register');

      // No mostrar toasts automáticos para rutas de autenticación
      // (dejar que el componente maneje los errores específicos)
      if (isAuthRoute) {
        return throwError(() => error);
      }

      switch (statusCode) {
        // Autenticación requerida
        case 401:
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
          toastService.warning('Tu sesión ha expirado. Inicia sesión nuevamente.');
          router.navigate(['/auth/login']);
          return throwError(() => error); // Lanzar error para que los subscribers lo reciban

        // Acceso prohibido
        case 403:
          toastService.error('No tienes permisos para realizar esta acción.');
          // No redirigir si estamos en una ruta de autenticación
          if (!isAuthRoute) {
            router.navigate(['/home']);
          }
          return throwError(() => error);

        // No encontrado
        case 404:
          toastService.warning(error.error?.message || 'Recurso no encontrado');
          break;

        // Error de servidor
        case 500:
        case 502:
        case 503:
        case 504:
          // Solo mostrar toast una vez para errores de servidor
          if (statusCode === 500) {
            toastService.error('Error en el servidor. Por favor, intenta más tarde.');
          } else {
            toastService.error(`Error del servidor (${statusCode}). Por favor, intenta más tarde.`);
          }
          console.error('Server Error:', error);
          break;

        // Error de validación
        case 400:
          toastService.error(`Error de validación: ${errorMessage}`);
          break;

        // Otros errores
        default:
          if (statusCode >= 400 && statusCode < 500) {
            toastService.error(errorMessage || 'Error en la solicitud');
          }
          // Los errores 5xx ya se han manejado arriba
      }

      return throwError(() => error);
    })
  );
};
