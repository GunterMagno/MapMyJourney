import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { User } from '../core/models';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
  profilePicture?: string;
}

/**
 * UserService - Servicio para gestionar datos del usuario
 *
 * Maneja la comunicación con el backend para:
 * - Obtener datos del usuario actual
 * - Actualizar perfil del usuario
 * - Operaciones relacionadas con la cuenta
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(ApiService);

  /**
   * Obtiene el perfil del usuario autenticado
   * GET /api/users/me
   */
  getCurrentUserProfile(): Observable<User> {
    return this.api.get<User>('users/me');
  }

  /**
   * Obtiene un usuario específico por ID
   * GET /api/users/{id}
   */
  getUserById(id: string): Observable<User> {
    return this.api.get<User>(`users/${id}`);
  }

  /**
   * Actualiza el perfil del usuario autenticado
   * PUT /api/users/{id}/profile
   */
  updateUser(id: string, data: UpdateUserRequest): Observable<User> {
    return this.api.put<User>(`users/${id}/profile`, data);
  }

  /**
   * Obtiene un usuario por email
   * GET /api/users/email/{email}
   */
  getUserByEmail(email: string): Observable<User> {
    return this.api.get<User>(`users/email/${email}`);
  }
}
