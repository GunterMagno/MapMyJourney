import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

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
 * Trip Resolver - Precarga datos del viaje
 *
 * Se ejecuta antes de activar la ruta, asegurando que el componente
 * recibe los datos de inmediato. Si no encuentra el viaje, retorna null
 * y el componente puede mostrar un mensaje de error.
 *
 * Uso en rutas:
 * { path: 'trips/:id', component: TripDetailComponent, resolve: { trip: tripResolver } }
 */
export const tripResolver: ResolveFn<Trip | null> = (
  route: ActivatedRouteSnapshot
) => {
  const tripService = new TripService();
  const id = route.paramMap.get('id');

  if (!id) {
    return of(null);
  }

  return tripService.getTripById(id);
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

