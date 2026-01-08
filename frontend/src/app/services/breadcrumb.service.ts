import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Interfaz para un elemento de breadcrumb
 */
export interface BreadcrumbItem {
  label: string;
  url: string;
}

/**
 * Servicio de Breadcrumbs
 *
 * Escucha los eventos NavigationEnd del router y construye dinámicamente
 * la ruta de migas basándose en los metadatos "breadcrumb" definidos
 * en las rutas.
 *
 * Uso:
 * - En app.routes.ts: data: { breadcrumb: 'Nombre de la página' }
 * - En componente: breadcrumbs$ = inject(BreadcrumbService).breadcrumbs$
 */
@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  breadcrumbs$: Observable<BreadcrumbItem[]> = this.breadcrumbsSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.initBreadcrumbs();
  }

  /**
   * Inicializa la escucha de eventos de navegación
   */
  private initBreadcrumbs(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        const breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
        this.breadcrumbsSubject.next(breadcrumbs);
      });
  }

  /**
   * Construye recursivamente la ruta de migas desde el árbol de rutas activas
   */
  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    // Obtener todas las rutas hijas
    const ROUTE_DATA_BREADCRUMB = 'breadcrumb';
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      // Solo procesar rutas con componentes (saltar rutas puramente de routing)
      if (!child.outlet || child.outlet === 'primary') {
        const routeURL: string = child.snapshot.url
          .map(segment => segment.path)
          .join('/');

        // Agregar URL del segmento
        if (routeURL !== '') {
          url += `/${routeURL}`;
        }

        // Agregar breadcrumb si existe metadato
        const label = child.snapshot.data[ROUTE_DATA_BREADCRUMB];
        if (label) {
          breadcrumbs.push({
            label: label,
            url: url
          });
        }

        // Recursivo: continuar con rutas hijas
        return this.buildBreadcrumbs(child, url, breadcrumbs);
      }
    }

    return breadcrumbs;
  }
}
