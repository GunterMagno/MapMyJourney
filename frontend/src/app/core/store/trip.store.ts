/**
 * Trip Store - Gestión de estado reactiva para viajes
 *
 * Patrón: Service-based Store con Signals (Angular 17+)
 * Responsabilidades:
 * - Mantener el estado de viajes en memoria (signal privado)
 * - Exponer señales de lectura (readonly signals)
 * - Manejar operaciones CRUD con actualización inmutable
 * - Gestionar paginación e infinite scroll
 * - Filtrado local de búsqueda
 *
 * Ventajas de Signals vs BehaviorSubject:
 * - Integración nativa con Angular 17+
 * - Mejor rendimiento (fine-grained reactivity)
 * - TypeScript puro, menos boilerplate
 * - Automático: no requiere unsubscribe en componentes
 */

import { Injectable, computed, signal, inject } from '@angular/core';
import { TripService } from '../services/trip.service';
import { ToastService } from '../../services/toast.service';
import { Trip, ApiPaginatedResponse } from '../models';

interface TripStoreState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TripStore {
  // ============================================================================
  // STATE SIGNALS (PRIVADOS)
  // ============================================================================

  private readonly initialState: TripStoreState = {
    trips: [],
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    hasMore: true
  };

  private _state = signal<TripStoreState>(this.initialState);

  // ============================================================================
  // EXPOSED SIGNALS (PÚBLICO - READONLY)
  // ============================================================================

  /**
   * Lista de viajes actual
   * @example
   * trips = this.store.trips;
   * <div>{{ trips().length }} viajes</div>
   */
  trips = computed(() => this._state().trips);

  /**
   * Estado de carga
   */
  loading = computed(() => this._state().loading);

  /**
   * Mensaje de error (null si no hay error)
   */
  error = computed(() => this._state().error);

  /**
   * Página actual
   */
  currentPage = computed(() => this._state().currentPage);

  /**
   * Indica si hay más datos para cargar (para infinite scroll)
   */
  hasMore = computed(() => this._state().hasMore);

  // ============================================================================
  // COMPUTED SIGNALS (DERIVADAS)
  // ============================================================================

  /**
   * Total de viajes cargados
   * Se actualiza automáticamente cuando cambia trips
   */
  totalTrips = computed(() => this.trips().length);

  /**
   * Índice de progreso de paginación (0-100)
   */
  loadProgress = computed(() => {
    const total = this._state().totalItems;
    if (total === 0) return 100;
    return Math.round((this.trips().length / total) * 100);
  });

  /**
   * Primera página cargada
   */
  isFirstPage = computed(() => this.currentPage() === 1);

  /**
   * Mensaje de estado para mostraren UI
   */
  statusMessage = computed(() => {
    if (this.loading()) return 'Cargando viajes...';
    if (this.error()) return `Error: ${this.error()}`;
    if (this.totalTrips() === 0) return 'No hay viajes disponibles';
    return `${this.totalTrips()} viajes cargados`;
  });

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  private toastService = inject(ToastService);

  constructor(private tripService: TripService) {
    // Carga inicial de la primera página
    this.loadTrips();
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS - CARGA Y ACTUALIZACIÓN
  // ============================================================================

  /**
   * Cargar la primera página de viajes
   * Reemplaza completamente la lista anterior
   */
  loadTrips(): void {
    this._setLoading(true);
    this._setError(null);

    this.tripService.getMyTrips(1, this._state().pageSize).subscribe({
      next: (response) => {
        this._state.update(s => ({
          ...s,
          trips: response.items,
          totalItems: response.total,
          currentPage: 1,
          hasMore: response.items.length < response.total,
          loading: false
        }));
      },
      error: (err) => {
        const errorMsg = 'No se pudieron cargar los viajes';
        this._setError(errorMsg);
        this._setLoading(false);
        this.toastService.error(errorMsg);
        console.error('TripStore.loadTrips error:', err);
      }
    });
  }

  /**
   * Cargar la siguiente página (para infinite scroll)
   * Acumula viajes a la lista existente
   */
  loadMore(): void {
    const state = this._state();

    // No cargar si ya está cargando, no hay más datos o ya mostró error
    if (state.loading || !state.hasMore || state.error) {
      return;
    }

    const nextPage = state.currentPage + 1;
    this._setLoading(true);

    this.tripService.getMyTrips(nextPage, state.pageSize).subscribe({
      next: (response) => {
        this._state.update(s => ({
          ...s,
          trips: [...s.trips, ...response.items], // INMUTABLE: acumular
          totalItems: response.total,
          currentPage: nextPage,
          hasMore: s.trips.length + response.items.length < response.total,
          loading: false
        }));
      },
      error: (err) => {
        this._setError('Error al cargar más viajes');
        this._setLoading(false);
        console.error('TripStore.loadMore error:', err);
      }
    });
  }

  /**
   * Agregar un viaje nuevo (Optimistic UI)
   * Actualiza la UI inmediatamente, revierte si hay error
   *
   * @param trip Viaje a agregar
   * @example
   * const newTrip = { id: 'new', destination: 'París', ... };
   * this.tripStore.addTrip(newTrip);
   * // La UI se actualiza al instante sin esperar a la API
   */
  addTrip(trip: Trip): void {
    // Actualizar estado inmediatamente (optimistic)
    this._state.update(s => ({
      ...s,
      trips: [trip, ...s.trips], // Agregar al inicio
      totalItems: s.totalItems + 1
    }));

    // Nota: La llamada HTTP real debería manejarse en el componente que lo llamó
    // Este método solo actualiza el estado local
  }

  /**
   * Actualizar un viaje existente
   * Busca por ID y reemplaza inmutablemente
   *
   * @param id ID del viaje a actualizar
   * @param changes Propiedades a cambiar
   */
  updateTrip(id: number, changes: Partial<Trip>): void {
    this._state.update(s => ({
      ...s,
      trips: s.trips.map(trip =>
        trip.id === id ? { ...trip, ...changes } : trip
      )
    }));
  }

  /**
   * Eliminar un viaje
   * Filtra la lista inmutablemente
   *
   * @param id ID del viaje a eliminar
   */
  removeTrip(id: number): void {
    this._state.update(s => ({
      ...s,
      trips: s.trips.filter(trip => trip.id !== id),
      totalItems: Math.max(0, s.totalItems - 1)
    }));
  }

  /**
   * Buscar viajes localmente por término
   * Filtra la lista completa sin hacer petición a la API
   * Para búsquedas remotas, ver SearchStore
   *
   * @param term Término de búsqueda
   * @returns Lista filtrada
   */
  searchLocal(term: string): Trip[] {
    if (!term.trim()) {
      return this.trips();
    }

    const lowerTerm = term.toLowerCase();
    return this.trips().filter((trip: Trip) =>
      trip.destination.toLowerCase().includes(lowerTerm) ||
      trip.description?.toLowerCase().includes(lowerTerm)
    );
  }

  /**
   * Resetear el estado al inicial
   * Útil al desconectar usuario o cambiar de vista
   */
  reset(): void {
    this._state.set(this.initialState);
  }

  /**
   * Limpia el mensaje de error
   */
  clearError(): void {
    this._setError(null);
  }

  /**
   * Recarga los viajes desde la primera página
   */
  reloadTrips(): void {
    this.reset();
    this.loadTrips();
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - UTILIDADES
  // ============================================================================

  private _setLoading(loading: boolean): void {
    this._state.update(s => ({ ...s, loading }));
  }

  private _setError(error: string | null): void {
    this._state.update(s => ({ ...s, error }));
  }

  // ============================================================================
  // MÉTODOS PARA TESTING
  // ============================================================================

  /**
   * Obtener el estado completo (solo para debugging/testing)
   * NO usar en componentes normales - acceder a señales individuales
   */
  debugState(): TripStoreState {
    return this._state();
  }
}

/**
 * NOTAS DE ARQUITECTURA:
 *
 * 1. INMUTABILIDAD
 *    - Nunca mutar arrays/objetos directamente
 *    - Usar spread operator: [...arr, newItem]
 *    - Usar map() para actualizar un item: arr.map(item => item.id === id ? {...} : item)
 *    - Usar filter() para eliminar: arr.filter(item => item.id !== id)
 *
 * 2. SIGNALS vs OBSERVABLES
 *    - Signals: lectura con () función, reactividad automática
 *    - No requieren async pipe ni unsubscribe
 *    - Mejor para state management
 *
 * 3. COMPUTED SIGNALS
 *    - Se recalculan automáticamente cuando sus dependencias cambian
 *    - Útiles para derived state (totalTrips, loadProgress)
 *    - Memoizados: no se recalculan si la entrada no cambió
 *
 * 4. OPTIMISTIC UI
 *    - Actualizar estado local ANTES de enviar HTTP
 *    - Si la API falla, el componente maneja el rollback
 *    - Mejora percepción de velocidad
 *
 * 5. ERROR HANDLING
 *    - Siempre settear loading=false en error y success
 *    - Loguear errores para debugging
 *    - Mostrar mensaje amigable al usuario
 */
