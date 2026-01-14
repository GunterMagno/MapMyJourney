import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interfaz para datos de Viaje (Trip)
 */
export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  budget: number;
  currency?: string;
  image?: string;
  createdAt?: string;
}

/**
 * Servicio simulado para obtener viajes
 *
 * En una aplicación real, esto vendría de TripService + HttpClient
 */
class TripService {
  private trips: Trip[] = [
    {
      id: '1',
      destination: 'Barcelona',
      startDate: '2024-06-01',
      endDate: '2024-06-07',
      description: 'Una experiencia inolvidable por las calles de Barcelona',
      budget: 1299,
      currency: 'USD',
      image: 'barcelona.jpg'
    },
    {
      id: '2',
      destination: 'Machu Picchu',
      startDate: '2024-07-15',
      endDate: '2024-07-22',
      description: 'Descubre una de las 7 maravillas del mundo',
      budget: 2199,
      currency: 'USD',
      image: 'machupicchu.jpg'
    },
    {
      id: '3',
      destination: 'Safari Kenya',
      startDate: '2024-08-10',
      endDate: '2024-08-20',
      description: 'Observa la fauna silvestre en su hábitat natural',
      budget: 1899,
      currency: 'USD',
      image: 'safari.jpg'
    }
  ];

  getTripById(id: string): Observable<Trip | null> {
    const trip = this.trips.find(t => t.id === id);
    return of(trip || null);
  }
}

/**
 * Trip Resolver (ResolveFn Moderno)
 *
 * Resolvers y Carga de Datos
 *
 * Comportamiento:
 * ✅ Se ejecuta ANTES de activar la ruta
 * ✅ Asegura que los datos estén listos antes de render (sin parpadeos)
 * ✅ Si falla o no existe, redirige a 404/listado y cancela la carga
 *
 * Manejo de Errores:
 * - Si no encuentra el viaje (id no existe) → Redirige a /404
 * - Si hay error en la API → Captura con catchError y redirige
 * - Devuelve EMPTY para cancelar la carga del componente
 *
 * Uso en rutas:
 * {
 *   path: ':id',
 *   component: TripDetailComponent,
 *   resolve: { trip: tripResolver }
 * }
 *
 * En el componente:
 * constructor(private route: ActivatedRoute) {
 *   const trip = this.route.snapshot.data['trip'];
 * }
 *
 * @param route ActivatedRouteSnapshot con paramMap
 * @returns Observable<Trip> con los datos del viaje
 * @throws Redirige a 404 si el viaje no existe
 */
export const tripResolver: ResolveFn<Trip | null> = (
  route: ActivatedRouteSnapshot
) => {
  const router = inject(Router);
  const tripService = new TripService();
  const id = route.paramMap.get('id');

  if (!id) {
    // ID no proporcionado
    router.navigate(['/404']);
    return EMPTY;
  }

  return tripService.getTripById(id).pipe(
    catchError((error) => {
      console.error('Error al cargar viaje:', error);
      // Redirige a 404 si hay error o viaje no existe
      router.navigate(['/404']);
      return EMPTY;
    })
  );
};

/**
 * Alias para compatibilidad hacia atrás
 * @deprecated Usar tripResolver en su lugar
 */
export const productResolver = tripResolver;

/**
 * Alias para compatibilidad hacia atrás
 * @deprecated Usar Trip en su lugar
 */
export type Product = Trip;