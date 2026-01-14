import { Routes } from '@angular/router';
import { StyleGuideComponent } from '../../components/pages/style-guide/style-guide';

/**
 * Rutas del módulo de Administración (Admin)
 * 
 * Estructura:
 * - style-guide: Guía de estilos de la aplicación
 * 
 * Nota: Agregar más rutas de administración según sea necesario
 * (dashboard admin, gestión de usuarios, reportes, etc.)
 * 
 * Estrategia de Carga: Lazy Loading (loadChildren)
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: 'style-guide',
    component: StyleGuideComponent,
    data: { breadcrumb: 'Guía de Estilos' }
  }
];
