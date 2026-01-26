/**
 * ApiService - Wrapper centralizado para operaciones HTTP
 * 
 * Responsabilidades:
 * - Centralizar URL base (ENVIRONMENT)
 * - Manejo genérico de errores
 * - Métodos CRUD reutilizables (GET, POST, PUT, DELETE)
 * - Tipado estricto con interfaces
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * GET - Obtener datos
   * @param endpoint Ruta sin la URL base (ej: 'trips', 'trips/123')
   * @param params Parámetros de query opcionales
   */
  get<T>(endpoint: string, params?: HttpParams | Record<string, any>): Observable<T> {
    const httpParams = params instanceof HttpParams ? params : this.buildParams(params);
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * POST - Crear recurso
   * @param endpoint Ruta sin la URL base
   * @param body Datos a enviar
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * PUT - Actualizar recurso completo
   * @param endpoint Ruta sin la URL base (ej: 'trips/123')
   * @param body Datos completos del recurso
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * PATCH - Actualización parcial
   * @param endpoint Ruta sin la URL base
   * @param body Datos parciales a actualizar
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * DELETE - Eliminar recurso
   * @param endpoint Ruta sin la URL base
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`)
      .pipe(catchError(error => this.handleError(error)));
  }

  /**
   * Construir parámetros de query
   * @param params Objeto con parámetros
   * @returns HttpParams para usar en requests
   */
  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return httpParams;
  }

  /**
   * Manejo centralizado de errores
   * @param error HttpErrorResponse del interceptor
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);

    // El error.error contiene la respuesta del servidor
    const errorMessage = error.error?.message || 
                        error.message || 
                        'Ocurrió un error desconocido';

    return throwError(() => ({
      statusCode: error.status,
      message: errorMessage,
      error: error.error,
      timestamp: new Date()
    }));
  }
}
