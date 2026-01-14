import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Interfaz para resultados de búsqueda
 */
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'trip' | 'user' | 'itinerary';
}

/**
 * Servicio simulado para búsqueda
 *
 * En una aplicación real, esto sería SearchService + HttpClient
 */
class SearchService {
  search(query: string): Observable<SearchResult[]> {
    // Simulación de resultados
    const allResults: SearchResult[] = [
      { id: '1', title: 'Barcelona Trip', description: 'Viaje a Barcelona', type: 'trip' },
      { id: '2', title: 'Machu Picchu Tour', description: 'Tour por Machu Picchu', type: 'trip' },
      { id: '3', title: 'Kenya Safari', description: 'Safari en Kenya', type: 'trip' }
    ];

    return of(
      allResults.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase())
      )
    );
  }
}

/**
 * Search Resolver - Precarga resultados de búsqueda
 *
 * Resolvers y Carga de Datos
 *
 * Comportamiento:
 * ✅ Lee queryParam 'q' de la ruta
 * ✅ Ejecuta búsqueda ANTES de activar el componente
 * ✅ Previene parpadeos mostrando resultados de inmediato
 *
 * Uso en rutas:
 * {
 *   path: 'search',
 *   component: SearchResultsComponent,
 *   resolve: { results: searchResolver }
 * }
 *
 * @param route ActivatedRouteSnapshot con queryParamMap
 * @returns Observable<SearchResult[]> con resultados
 */
export const searchResolver: ResolveFn<SearchResult[]> = (
  route: ActivatedRouteSnapshot
) => {
  const searchService = new SearchService();
  const query = route.queryParamMap.get('q') || '';

  if (!query) {
    return of([]);
  }

  return searchService.search(query);
};
