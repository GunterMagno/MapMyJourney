/**
 * Loading Interceptor - Sincroniza estado de carga global
 * 
 * Muestra spinner al iniciar request, lo oculta al completar/fallar
 * Integración con LoadingService existente
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../../services/loading.service';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Iniciar spinner
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Ocultar spinner cuando complete (éxito o error)
      loadingService.hide();
    })
  );
};
