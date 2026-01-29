/**
 * PollingService - Servicio para actualización periódica en tiempo real
 *
 * Implementa polling con:
 * - timer de RxJS para intervalos
 * - switchMap para cancelación automática de peticiones anteriores
 * - document.visibilityState para respetar el estado de la pestaña
 *
 * Uso típico (FASE 6 - Realtime):
 * ```typescript
 * this.pollingService.poll(30000, () => {
 *   this.expenseStore.loadExpensesByTrip(tripId);
 * });
 * ```
 */

import { Injectable, inject } from '@angular/core';
import { timer, switchMap, takeUntil, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PollingService {
  // ============================================================================
  // CONTROL DE CICLO DE VIDA
  // ============================================================================

  /**
   * Subject para detener el polling cuando sea necesario
   * @private
   */
  private _stopPolling$ = new Subject<void>();

  /**
   * Indica si el polling está actualmente activo
   * @private
   */
  private _isPolling = false;

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Inicia polling periódico que ejecuta un callback
   *
   * El callback se ejecuta:
   * - Cada intervalMs milisegundos
   * - Solo si la pestaña está visible (document.visibilityState === 'visible')
   * - Las peticiones anteriores se cancelan automáticamente con switchMap
   *
   * @param intervalMs Intervalo en milisegundos (ej: 30000 = 30 segundos)
   * @param callback Función a ejecutar periódicamente
   *
   * @example
   * // Polling cada 30 segundos
   * this.pollingService.poll(30000, () => {
   *   console.log('Actualizando...');
   *   this.expenseStore.loadExpensesByTrip(tripId);
   * });
   *
   * @example
   * // Detener el polling cuando sea necesario
   * this.pollingService.stop();
   */
  poll(intervalMs: number, callback: () => void): void {
    if (this._isPolling) {
      console.warn('PollingService: Ya hay un polling activo, deténlo primero con stop()');
      return;
    }

    this._isPolling = true;

    // Crear observable que emite cada intervalMs
    // Empezar desde 0 para ejecutar inmediatamente en la primera iteración
    timer(0, intervalMs)
      .pipe(
        // 1. VISIBILIDAD: Solo continuar si la pestaña está visible
        tap(() => {
          if (document.visibilityState !== 'visible') {
            console.debug('[PollingService] Pestaña no visible, pausando polling');
          }
        }),

        // 2. CONDICIONAL: Filtrar por visibilidad
        switchMap(() => {
          // Si la pestaña no está visible, no ejecutar callback
          if (document.visibilityState !== 'visible') {
            return [];
          }

          // Ejecutar el callback
          callback();
          return [];
        }),

        // 3. CICLO DE VIDA: Detenerse cuando se emita _stopPolling$
        takeUntil(this._stopPolling$)
      )
      .subscribe({
        error: (err) => {
          console.error('[PollingService] Error en polling:', err);
          this._isPolling = false;
        },
        complete: () => {
          console.debug('[PollingService] Polling completado');
          this._isPolling = false;
        }
      });
  }

  /**
   * Detiene el polling activo
   *
   * @example
   * this.pollingService.stop();
   */
  stop(): void {
    if (!this._isPolling) {
      console.warn('PollingService: No hay polling activo');
      return;
    }

    this._stopPolling$.next();
    this._isPolling = false;
  }

  /**
   * Obtiene el estado actual del polling
   *
   * @returns true si hay un polling activo, false en caso contrario
   */
  isActive(): boolean {
    return this._isPolling;
  }

  /**
   * Resetea el servicio (limpia subscripciones)
   * Útil cuando se destruye el componente
   */
  reset(): void {
    this.stop();
    this._stopPolling$.complete();
  }
}
