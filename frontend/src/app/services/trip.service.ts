import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';

export interface TripFormData {
  title: string;
  destination: string;
  description?: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  budget?: number;
}

export interface Trip extends TripFormData {
  id: number;
  tripCode: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * TripService - Servicio para gestionar viajes
 *
 * Maneja la comunicación con el backend para:
 * - Crear viajes
 * - Obtener viajes del usuario
 * - Actualizar viajes
 * - Eliminar viajes
 */
@Injectable({
  providedIn: 'root'
})
export class TripService {
  private api = inject(ApiService);

  /**
   * Crear un nuevo viaje
   * POST /api/trips
   */
  createTrip(tripData: TripFormData): Observable<Trip> {
    console.log('TripService.createTrip called with:', tripData);
    return this.api.post<Trip>('trips', tripData);
  }

  /**
   * Obtener todos los viajes del usuario autenticado
   * GET /api/trips/my-trips
   */
  getUserTrips(): Observable<Trip[]> {
    return this.api.get<Trip[]>('trips/my-trips');
  }

  /**
   * Obtener un viaje específico por ID
   * GET /api/trips/:id
   */
  getTripById(id: number): Observable<Trip> {
    return this.api.get<Trip>(`trips/${id}`);
  }

  /**
   * Actualizar un viaje
   * PUT /api/trips/:id
   */
  updateTrip(id: number, tripData: Partial<TripFormData>): Observable<Trip> {
    return this.api.put<Trip>(`trips/${id}`, tripData);
  }

  /**
   * Eliminar un viaje
   * DELETE /api/trips/:id
   */
  deleteTrip(id: number): Observable<void> {
    return this.api.delete<void>(`trips/${id}`);
  }

  /**
   * Guarda un borrador de viaje en sessionStorage
   * Usado para el flujo invitado -> usuario registrado
   * 
   * @param tripData Datos del viaje a guardar
   */
  saveGuestTrip(tripData: TripFormData): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('guest_trip_draft', JSON.stringify(tripData));
      console.log('✓ Guest trip saved to sessionStorage:', tripData);
    }
  }

  /**
   * Obtiene el borrador de viaje guardado en sessionStorage
   * 
   * @returns Los datos del viaje o null si no existe
   */
  getGuestTrip(): TripFormData | null {
    if (typeof sessionStorage === 'undefined') return null;
    
    const saved = sessionStorage.getItem('guest_trip_draft');
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * Elimina el borrador de viaje de sessionStorage
   */
  clearGuestTrip(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('guest_trip_draft');
      console.log('✓ Guest trip cleared from sessionStorage');
    }
  }
}
