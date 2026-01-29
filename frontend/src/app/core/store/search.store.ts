/**
 * Search Store - Gestión de búsqueda reactiva en tiempo real
 *
 * Patrón: Service-based Store con Signals + RxJS
 * Responsabilidades:
 * - Mantener término de búsqueda actual
 * - Mantener resultados filtrados
 * - Aplicar debounce para evitar saturar API
 * - Manejar loading state durante búsqueda
 *
 * PATRÓN: Combina Signals (estado local) con RxJS (operadores async)
 * Razón: FormControl y async search requieren Observables
 *
 * @example
 * // En componente
 * searchStore = inject(SearchStore);
 * results = this.searchStore.results;
 *
 * <input (change)="searchStore.search($event.target.value)">
 * <ul>
 *   <li *ngFor="let trip of results()">{{ trip.destination }}</li>
 * </ul>
 */

import { Injectable, signal, computed } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TripService } from '../services/trip.service';
import { Trip } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SearchStore {
  // ============================================================================
  // STATE SIGNALS
  // ============================================================================

  private _searchTerm = signal<string>('');
  private _results = signal<Trip[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // ============================================================================
  // EXPOSED SIGNALS
  // ============================================================================

  /**
   * Resultados de búsqueda actual
   */
  results = this._results.asReadonly();

  /**
   * Término de búsqueda actual
   */
  searchTerm = this._searchTerm.asReadonly();

  /**
   * Estado de carga durante búsqueda
   */
  loading = this._loading.asReadonly();

  /**
   * Error durante búsqueda
   */
  error = this._error.asReadonly();

  /**
   * FASE 6: Computed signal que indica si no hay resultados
   *
   * Es true solo si:
   * - El usuario ha escrito algo (searchTerm no está vacío)
   * - La búsqueda no está cargando (loading es false)
   * - El array de resultados está vacío
   *
   * Uso en template:
   * ```html
   * @if (searchStore.emptyResults()) {
   *   <p class="search-empty">No se encontraron viajes</p>
   * }
   * ```
   */
  emptyResults = computed(() => {
    const term = this._searchTerm();
    const isLoading = this._loading();
    const results = this._results();

    // True solo si hay búsqueda, no está cargando y sin resultados
    return term.trim().length > 0 && !isLoading && results.length === 0;
  });

  // ============================================================================
  // FORM CONTROL PARA INTEGRACIÓN CON INPUT
  // ============================================================================

  /**
   * FormControl conectado al input de búsqueda
   * Permite usar reactive forms con el store
   *
   * @example
   * <input [formControl]="searchStore.searchControl">
   */
  searchControl = new FormControl('');

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(private tripService: TripService) {
    this._setupSearchPipeline();
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Buscar viajes por término
   * Aplica debounce automáticamente a través del pipeline
   *
   * @param term Término a buscar
   *
   * @example
   * this.searchStore.search('París');
   * // Se encolará debounceTime(300) antes de enviar a API
   * // results() se actualiza cuando la API responde
   * // emptyResults() se actualiza automáticamente
   */
  search(term: string): void {
    this.searchControl.setValue(term, { emitEvent: true });
  }

  /**
   * Limpiar búsqueda
   * Limpia resultados y term
   */
  clear(): void {
    this._searchTerm.set('');
    this._results.set([]);
    this._error.set(null);
    this.searchControl.reset('', { emitEvent: false });
  }

  /**
   * Resetear estado
   */
  reset(): void {
    this.clear();
    this._loading.set(false);
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - PIPELINE DE BÚSQUEDA
  // ============================================================================

  /**
   * Configurar el pipeline reactivo de búsqueda
   * Combina FormControl valueChanges con debounce y búsqueda remota
   *
   * FLUJO:
   * 1. Usuario tipea en el input
   * 2. FormControl emite valueChanges
   * 3. Debounce espera 300ms sin cambios
   * 4. DistinctUntilChanged evita búsquedas duplicadas
   * 5. SwitchMap cancela búsqueda anterior e inicia nueva
   *    (Automaticamente cancela petición HTTP anterior si hay una pendiente)
   * 6. API devuelve resultados (o array vacío si término está vacío)
   * 7. Signal _results se actualiza
   * 8. Componentes reaccionan automáticamente (incluido emptyResults computed)
   *
   * FASE 6: El switchMap garantiza que solo la última búsqueda
   *    tenga efecto, evitando race conditions
   */
  private _setupSearchPipeline(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Esperar 300ms sin cambios
        distinctUntilChanged(), // Solo si el valor cambió
        switchMap(term => {
          // Actualizar el signal del término (para emptyResults)
          this._searchTerm.set(term || '');

          if (!term || term.trim().length === 0) {
            // Si vacío, limpiar resultados sin hacer petición
            this._setLoading(false);
            this._setError(null);
            return of([] as Trip[]);
          }

          // Mostrar loading
          this._setLoading(true);
          this._setError(null);

          // FASE 6: Filtrado robusto del backend
          // Nota: Idealmente habría un searchTrips(term) en TripService
          // Por ahora usamos getMyTrips y filtramos localmente
          // La petición anterior será cancelada automáticamente por switchMap
          return this.tripService.getMyTrips(1, 100).pipe(
            switchMap(response => {
              const filtered = response.items.filter(trip =>
                trip.destination.toLowerCase().includes(term.toLowerCase()) ||
                trip.description?.toLowerCase().includes(term.toLowerCase())
              );
              return of(filtered);
            }),
            catchError(err => {
              this._setError('Error durante la búsqueda');
              console.error('SearchStore error:', err);
              return of([] as Trip[]);
            })
          );
        })
      )
      .subscribe({
        next: (results) => {
          this._results.set(results);
          this._setLoading(false);
        },
        error: (err) => {
          console.error('[SearchStore] Error en pipeline:', err);
          this._setError('Error inesperado en búsqueda');
          this._setLoading(false);
        }
      });
  }

  // ============================================================================
  // UTILIDADES PRIVADAS
  // ============================================================================

  private _setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  private _setError(error: string | null): void {
    this._error.set(error);
  }

  // ============================================================================
  // DEBUG
  // ============================================================================

  debugState(): { term: string; results: Trip[]; loading: boolean; error: string | null } {
    return {
      term: this._searchTerm(),
      results: this._results(),
      loading: this._loading(),
      error: this._error()
    };
  }
}

/**
 * NOTAS DE INTEGRACIÓN:
 *
 * 1. FORMCONTROL + SIGNALS
 *    Típicamente estarían separados, pero aquí combinamos:
 *    - FormControl: para integración con HTML input y validación
 *    - Signals: para estado reactivo sin observables
 *    - El pipeline RxJS: conecta ambos mundos
 *
 * 2. DEBOUNCE Y DISTINCTUNTILCHANGED
 *    - debounceTime(300): no envíes petición hasta que pase 300ms sin cambios
 *    - distinctUntilChanged(): no repitas búsqueda del mismo término
 *    - Juntos reducen carga API y mejoran UX (menos parpadeos)
 *
 * 3. SWITCHMAP
 *    - Cancela búsqueda anterior si el usuario tipea otra cosa
 *    - Si user tipea: "Pá" -> espera -> "París" -> cancela "Pá" e inicia "París"
 *    - Evita race conditions (respuestas llegando en orden incorrecto)
 *
 * 4. OPTIMIZACIÓN: FILTRADO LOCAL vs REMOTO
 *    Actualmente filtramos localmente (simple pero limita a 100 viajes)
 *    Para escala mayor, implementar:
 *    - searchTrips(term: string) en TripService
 *    - Llamada directa: this.tripService.searchTrips(term)
 *    - API devuelve resultados ya filtrados
 *    - Menos datos transferidos, mejor rendimiento
 *
 * 5. MANEJO DE ERRORES
 *    - catchError convierte error a array vacío para no romper UI
 *    - Mensaje de error disponible en signal error()
 *    - Componente puede mostrar toast/snackbar con el error
 */
