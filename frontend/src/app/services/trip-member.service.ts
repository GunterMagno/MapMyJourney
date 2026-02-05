import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';

/**
 * Servicio para gestionar miembros de viajes
 * - Invitar usuarios por email
 * - Obtener miembros de un viaje
 * - Cambiar roles de miembros
 * - Remover miembros
 */
@Injectable({
  providedIn: 'root'
})
export class TripMemberService {
  private api = inject(ApiService);
  private readonly endpoint = 'trips';

  /**
   * Invita un usuario por email a un viaje
   * POST /api/trips/{tripId}/invite
   * @param tripId ID del viaje
   * @param email Email del usuario a invitar
   */
  inviteUserByEmail(tripId: number, email: string): Observable<any> {
    return this.api.post(
      `${this.endpoint}/${tripId}/invite`,
      { email: email }
    );
  }

  /**
   * Obtiene todos los miembros de un viaje
   * GET /api/trips/{tripId}/members
   * @param tripId ID del viaje
   */
  getMembers(tripId: number): Observable<any[]> {
    return this.api.get<any[]>(`${this.endpoint}/${tripId}/members`);
  }

  /**
   * Obtiene un miembro específico
   * GET /api/trips/{tripId}/members/{userId}
   * @param tripId ID del viaje
   * @param userId ID del usuario
   */
  getMember(tripId: number, userId: number): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${tripId}/members/${userId}`);
  }

  /**
   * Cambia el rol de un miembro
   * PUT /api/trips/{tripId}/members/{userId}/role
   * @param tripId ID del viaje
   * @param userId ID del usuario
   * @param role Nuevo rol (OWNER, EDITOR, VIEWER)
   */
  changeMemberRole(tripId: number, userId: number, role: string): Observable<any> {
    return this.api.put(
      `${this.endpoint}/${tripId}/members/${userId}/role`,
      { role: role }
    );
  }

  /**
   * Remueve un miembro del viaje
   * DELETE /api/trips/{tripId}/members/{userId}
   * @param tripId ID del viaje
   * @param userId ID del usuario a remover
   */
  removeMember(tripId: number, userId: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${tripId}/members/${userId}`);
  }

  /**
   * Permite que el usuario abandone un viaje
   * POST /api/trips/{tripId}/members/leave
   * @param tripId ID del viaje
   */
  leaveTrip(tripId: number): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${tripId}/members/leave`, {});
  }
}
