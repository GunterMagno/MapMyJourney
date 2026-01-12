/**
 * Expense Store - Gestión de estado reactiva para gastos
 *
 * Patrón: Service-based Store con Signals (Angular 17+)
 * Responsabilidades:
 * - Mantener lista de gastos del viaje activo
 * - Calcular automáticamente gastos totales con computed signal
 * - Operaciones CRUD con actualización inmutable
 * - Cálculos derivados: total, por persona, por categoría
 *
 * CLAVE: Las computed signals se actualizan automáticamente
 * cuando los expenses cambian. Perfect para presupuestos dinámicos.
 *
 * @example
 * // En componente
 * expenseStore = inject(ExpenseStore);
 * totalSpent = this.expenseStore.totalBudgetUsed;
 * // Template
 * <p>Gastado: {{ totalSpent() }}</p>
 * // Al agregar gasto, totalSpent() se actualiza automáticamente
 */

import { Injectable, computed, signal } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { Expense, ExpenseWithDetails, ApiPaginatedResponse } from '../models';

interface ExpenseStoreState {
  expenses: ExpenseWithDetails[];
  loading: boolean;
  error: string | null;
  currentTripId: string | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseStore {
  // ============================================================================
  // STATE SIGNALS (PRIVADOS)
  // ============================================================================

  private readonly initialState: ExpenseStoreState = {
    expenses: [],
    loading: false,
    error: null,
    currentTripId: null,
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    hasMore: true
  };

  private _state = signal<ExpenseStoreState>(this.initialState);

  // ============================================================================
  // EXPOSED SIGNALS (PÚBLICO - READONLY)
  // ============================================================================

  /**
   * Lista de gastos del viaje actual
   */
  expenses = computed(() => this._state().expenses);

  /**
   * Estado de carga
   */
  loading = computed(() => this._state().loading);

  /**
   * Mensaje de error
   */
  error = computed(() => this._state().error);

  /**
   * ID del viaje del que se están viendo gastos
   */
  currentTripId = computed(() => this._state().currentTripId);

  /**
   * Indica si hay más gastos para cargar
   */
  hasMore = computed(() => this._state().hasMore);

  // ============================================================================
  // COMPUTED SIGNALS (DERIVADAS) - CÁLCULOS AUTOMÁTICOS
  // ============================================================================

  /**
   * CLAVE: Total de gastos - se recalcula automáticamente
   * Cualquier cambio en expenses trigger esta actualización
   *
   * @example
   * totalSpent = this.expenseStore.totalBudgetUsed;
   * <progress [value]="totalSpent()" max="1000"></progress>
   * // Se actualiza al instante sin intervención manual
   */
  totalBudgetUsed = computed(() => {
    return this.expenses().reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
  });

  /**
   * Cantidad de gastos únicos
   */
  totalExpenses = computed(() => this.expenses().length);

  /**
   * Promedio de gasto por persona en el viaje
   */
  averageExpense = computed(() => {
    const expenses = this.expenses();
    if (expenses.length === 0) return 0;
    return this.totalBudgetUsed() / expenses.length;
  });

  /**
   * Gastos agrupados por categoría
   * Útil para gráficos de distribución
   */
  expensesByCategory = computed(() => {
    const grouped: Record<string, number> = {};
    this.expenses().forEach((expense: Expense) => {
      grouped[expense.category] = (grouped[expense.category] || 0) + expense.amount;
    });
    return grouped;
  });

  /**
   * Gastos agrupados por usuario que pagó
   * Útil para cálculos de deuda
   */
  expensesByPayer = computed(() => {
    const grouped: Record<string, number> = {};
    this.expenses().forEach((expense: Expense) => {
      const payerId = expense.payerId;
      grouped[payerId] = (grouped[payerId] || 0) + expense.amount;
    });
    return grouped;
  });

  /**
   * Gasto más alto en el viaje
   */
  maxExpense = computed(() => {
    const expenses = this.expenses();
    if (expenses.length === 0) return 0;
    return Math.max(...expenses.map((e: Expense) => e.amount));
  });

  /**
   * Gasto más bajo en el viaje
   */
  minExpense = computed(() => {
    const expenses = this.expenses();
    if (expenses.length === 0) return 0;
    return Math.min(...expenses.map((e: Expense) => e.amount));
  });

  /**
   * Mensaje de estado para UI
   */
  statusMessage = computed(() => {
    if (this.loading()) return 'Cargando gastos...';
    if (this.error()) return `Error: ${this.error()}`;
    if (this.totalExpenses() === 0) return 'Sin gastos registrados';
    return `${this.totalExpenses()} gastos - Total: €${this.totalBudgetUsed().toFixed(2)}`;
  });

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(private expenseService: ExpenseService) {}

  // ============================================================================
  // MÉTODOS PÚBLICOS - CARGA Y ACTUALIZACIÓN
  // ============================================================================

  /**
   * Cargar gastos de un viaje específico
   * Reemplaza completamente la lista anterior
   *
   * @param tripId ID del viaje
   */
  loadExpensesByTrip(tripId: string): void {
    if (tripId === this._state().currentTripId && this.expenses().length > 0) {
      // Ya cargados para este viaje
      return;
    }

    this._setLoading(true);
    this._setError(null);

    this.expenseService.getExpensesByTrip(tripId, 1, this._state().pageSize).subscribe({
      next: (response) => {
        this._state.update(s => ({
          ...s,
          expenses: response.items,
          totalItems: response.total,
          currentTripId: tripId,
          currentPage: 1,
          hasMore: response.items.length < response.total,
          loading: false
        }));
      },
      error: (err) => {
        this._setError('No se pudieron cargar los gastos');
        this._setLoading(false);
        console.error('ExpenseStore.loadExpensesByTrip error:', err);
      }
    });
  }

  /**
   * Cargar más gastos (infinite scroll)
   * Acumula a la lista existente
   */
  loadMore(): void {
    const state = this._state();

    if (state.loading || !state.hasMore || !state.currentTripId || state.error) {
      return;
    }

    const nextPage = state.currentPage + 1;
    this._setLoading(true);

    this.expenseService.getExpensesByTrip(state.currentTripId, nextPage, state.pageSize).subscribe({
      next: (response) => {
        this._state.update(s => ({
          ...s,
          expenses: [...s.expenses, ...response.items],
          totalItems: response.total,
          currentPage: nextPage,
          hasMore: s.expenses.length + response.items.length < response.total,
          loading: false
        }));
      },
      error: (err) => {
        this._setError('Error al cargar más gastos');
        this._setLoading(false);
        console.error('ExpenseStore.loadMore error:', err);
      }
    });
  }

  /**
   * Agregar un nuevo gasto (Optimistic UI)
   * Actualiza la UI inmediatamente
   *
   * @param expense Gasto a agregar (debe tener los detalles del pagador)
   *
   * @example
   * const newExpense: ExpenseWithDetails = {
   *   id: 'new',
   *   amount: 50,
   *   // ... resto de datos
   * };
   * this.expenseStore.addExpense(newExpense);
   * // totalBudgetUsed() se actualiza automáticamente
   */
  addExpense(expense: ExpenseWithDetails): void {
    this._state.update(s => ({
      ...s,
      expenses: [expense, ...s.expenses],
      totalItems: s.totalItems + 1
    }));
  }

  /**
   * Actualizar un gasto existente
   * Se actualiza la lista inmutablemente
   *
   * @param id ID del gasto
   * @param changes Propiedades a cambiar
   *
   * @example
   * this.expenseStore.updateExpense('exp-123', { amount: 75 });
   * // totalBudgetUsed() se recalcula automáticamente
   */
  updateExpense(id: string, changes: Partial<ExpenseWithDetails>): void {
    this._state.update(s => ({
      ...s,
      expenses: s.expenses.map(expense =>
        expense.id === id ? { ...expense, ...changes } : expense
      )
    }));
  }

  /**
   * Eliminar un gasto
   * Filtra la lista inmutablemente
   *
   * @param id ID del gasto a eliminar
   *
   * @example
   * this.expenseStore.removeExpense('exp-123');
   * // totalBudgetUsed() se actualiza automáticamente (suma anterior - monto eliminado)
   */
  removeExpense(id: string): void {
    this._state.update(s => ({
      ...s,
      expenses: s.expenses.filter(expense => expense.id !== id),
      totalItems: Math.max(0, s.totalItems - 1)
    }));
  }

  /**
   * Filtrar gastos por categoría
   *
   * @param category Categoría a filtrar
   * @returns Lista filtrada
   */
  filterByCategory(category: string): ExpenseWithDetails[] {
    return this.expenses().filter((e: Expense) => e.category === category);
  }

  /**
   * Filtrar gastos por usuario pagador
   *
   * @param payerId ID del usuario
   * @returns Lista de gastos pagados por ese usuario
   */
  filterByPayer(payerId: string): ExpenseWithDetails[] {
    return this.expenses().filter((e: Expense) => e.payerId === payerId);
  }

  /**
   * Gastos dentro de un rango de fechas
   *
   * @param startDate Fecha de inicio (ISO 8601)
   * @param endDate Fecha de fin (ISO 8601)
   * @returns Lista filtrada
   */
  filterByDateRange(startDate: string, endDate: string): ExpenseWithDetails[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.expenses().filter((e: Expense) => {
      const expenseDate = new Date(e.date);
      return expenseDate >= start && expenseDate <= end;
    });
  }

  /**
   * Resetear el estado
   */
  reset(): void {
    this._state.set(this.initialState);
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
   * Obtener estado completo (solo debugging/testing)
   */
  debugState(): ExpenseStoreState {
    return this._state();
  }
}

/**
 * NOTAS ARQUITECTÓNICAS:
 *
 * 1. COMPUTED SIGNALS - LA MAGIA DE ESTA STORE
 *    Cuando un usuario agregar un gasto:
 *    1. expenseStore.addExpense(newExpense) actualiza _state
 *    2. Automáticamente se recalcula totalBudgetUsed (porque depende de expenses())
 *    3. Cualquier componente que use totalBudgetUsed() ve el valor nuevo
 *    4. Angular detec el cambio y actualiza la UI
 *    5. NO requiere notificación manual, NO requiere async pipe
 *
 * 2. CASOS DE USO
 *    - Barra de presupuesto: vinculada a totalBudgetUsed()
 *    - Desglose por categoría: vinculado a expensesByCategory()
 *    - Card individual: vinculado a expensesByPayer()
 *    - Todos se actualizan en cascada sin intervención
 *
 * 3. RENDIMIENTO
 *    - Computed signals son memoizados
 *    - Se recalculan solo si expenses() cambió
 *    - No hay cálculos redundantes
 *    - Mejor que hacer filter/map en cada binding
 *
 * 4. PATRÓN OPTIMISTIC UI
 *    - addExpense() actualiza local inmediatamente
 *    - El componente llama a API aparte
 *    - Si API falla, componente hace removeExpense(id) para rollback
 *    - Percepción de velocidad > esperar a API
 */
