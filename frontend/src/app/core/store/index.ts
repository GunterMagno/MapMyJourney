/**
 * Store Index - Barril de exportación
 *
 * Centraliza la exportación de todos los stores
 * Simplifica importaciones en componentes
 *
 * @example
 * // Antes
 * import { TripStore } from '../store/trip.store';
 * import { ExpenseStore } from '../store/expense.store';
 * import { SearchStore } from '../store/search.store';
 *
 * // Después
 * import { TripStore, ExpenseStore, SearchStore } from '../store';
 */

export * from './trip.store';
export * from './expense.store';
export * from './search.store';
