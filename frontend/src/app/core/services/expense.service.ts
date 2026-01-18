/**
 * Expense Service - Lógica de negocio para Gastos
 * 
 * Responsabilidades:
 * - Obtener gastos de un viaje
 * - Crear, actualizar, eliminar gastos
 * - Calcular deuda entre participantes
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Expense, 
  CreateExpenseDto, 
  UpdateExpenseDto,
  ExpenseWithDetails,
  ApiPaginatedResponse 
} from '../models';

export interface Settlement {
  from: string; // ID del usuario que debe
  to: string;   // ID del usuario que recibe
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private api = inject(ApiService);
  private readonly endpoint = 'expenses';

  /**
   * Obtener todos los gastos de un viaje
   * @param tripId ID del viaje
   * @param page Número de página (default: 1)
   * @param pageSize Elementos por página (default: 20)
   */
  getExpensesByTrip(
    tripId: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiPaginatedResponse<ExpenseWithDetails>> {
    return this.api.get<ApiPaginatedResponse<ExpenseWithDetails>>(
      `trips/${tripId}/expenses`,
      { page, pageSize }
    );
  }

  /**
   * Obtener detalle de un gasto específico
   * @param expenseId ID del gasto
   */
  getExpenseDetails(expenseId: string): Observable<ExpenseWithDetails> {
    return this.api.get<ExpenseWithDetails>(`${this.endpoint}/${expenseId}`);
  }

  /**
   * Crear un nuevo gasto
   * @param expense Datos del gasto
   */
  addExpense(expense: CreateExpenseDto): Observable<Expense> {
    return this.api.post<Expense>(this.endpoint, expense);
  }

  /**
   * Actualizar un gasto existente
   * @param expenseId ID del gasto
   * @param updates Datos a actualizar
   */
  updateExpense(expenseId: string, updates: Partial<UpdateExpenseDto>): Observable<Expense> {
    return this.api.put<Expense>(`${this.endpoint}/${expenseId}`, updates);
  }

  /**
   * Eliminar un gasto
   * @param expenseId ID del gasto
   */
  deleteExpense(expenseId: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${expenseId}`);
  }

  /**
   * Obtener liquidaciones de un viaje (quién debe dinero a quién)
   * @param tripId ID del viaje
   */
  getSettlements(tripId: string): Observable<Settlement[]> {
    return this.api.get<Settlement[]>(`${this.endpoint}/settlements/${tripId}`);
  }

  /**
   * Obtener resumen de gastos por persona en un viaje
   * @param tripId ID del viaje
   */
  getExpenseSummary(tripId: string): Observable<Record<string, number>> {
    return this.api.get<Record<string, number>>(
      `${this.endpoint}/summary/${tripId}`
    );
  }

  /**
   * Marcar un gasto como pagado
   * @param expenseId ID del gasto
   */
  markAsPaid(expenseId: string): Observable<Expense> {
    return this.api.patch<Expense>(
      `${this.endpoint}/${expenseId}/paid`,
      {}
    );
  }
}
