import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor, errorInterceptor, loadingInterceptor } from './core/interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules) // Precarga todos los lazy-loaded modules en segundo plano
    ),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    // HTTP Client con interceptores funcionales en orden de ejecución
    provideHttpClient(
      withInterceptors([
        authInterceptor,  // 1. Inyecta token Bearer
        errorInterceptor, // 2. Maneja errores (401, 403, 500)
        loadingInterceptor // 3. Muestra/oculta estado de carga
      ])
    )
  ]
};
