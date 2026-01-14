/**
 * Trip Service - Lógica de negocio para Viajes
 * 
 * Responsabilidades:
 * - Obtener lista de viajes del usuario
 * - Crear, actualizar, eliminar viajes
 * - Obtener detalles de un viaje con gastos
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Trip, 
  CreateTripDto, 
  UpdateTripDto, 
  TripDetail,
  ApiPaginatedResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private api = inject(ApiService);
  private readonly endpoint = 'trips';

  /**
   * Obtener todos los viajes del usuario actual
   * @param page Número de página (default: 1)
   * @param pageSize Elementos por página (default: 10)
   */
  getMyTrips(page: number = 1, pageSize: number = 10): Observable<ApiPaginatedResponse<Trip>> {
    return this.api.get<ApiPaginatedResponse<Trip>>(
      this.endpoint,
      { page, pageSize }
    );
  }

  /**
   * Obtener viajes de un usuario específico (para compartir)
   * @param userId ID del usuario
   */
  getUserTrips(userId: string): Observable<Trip[]> {
    return this.api.get<Trip[]>(`users/${userId}/trips`);
  }

  /**
   * Obtener detalles completos de un viaje (con participantes y gastos)
   * @param tripId ID del viaje
   */
  getTripDetails(tripId: string): Observable<TripDetail> {
    return this.api.get<TripDetail>(`${this.endpoint}/${tripId}`);
  }

  /**
   * Crear un nuevo viaje
   * @param trip Datos del viaje a crear
   */
  createTrip(trip: CreateTripDto): Observable<Trip> {
    return this.api.post<Trip>(this.endpoint, trip);
  }

  /**
   * Actualizar un viaje existente
   * @param tripId ID del viaje
   * @param updates Datos a actualizar
   */
  updateTrip(tripId: string, updates: Partial<UpdateTripDto>): Observable<Trip> {
    return this.api.put<Trip>(`${this.endpoint}/${tripId}`, updates);
  }

  /**
   * Eliminar un viaje
   * @param tripId ID del viaje
   */
  deleteTrip(tripId: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${tripId}`);
  }

  /**
   * Agregar participante a un viaje
   * @param tripId ID del viaje
   * @param userId ID del usuario a agregar
   */
  addParticipant(tripId: string, userId: string): Observable<Trip> {
    return this.api.post<Trip>(
      `${this.endpoint}/${tripId}/participants`,
      { userId }
    );
  }

  /**
   * Remover participante de un viaje
   * @param tripId ID del viaje
   * @param userId ID del usuario a remover
   */
  removeParticipant(tripId: string, userId: string): Observable<Trip> {
    return this.api.delete<Trip>(
      `${this.endpoint}/${tripId}/participants/${userId}`
    );
  }
}
