import { Component, OnInit, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ExpenseStore, TripStore } from '../../../../core/store';
import { Expense, Participant } from '../../../../core/models';
import { AuthService } from '../../../../services/auth.service';
import { DateFormatService } from '../../../../core/services/date-format.service';
import { AddExpenseModalComponent } from './modals/add-expense-modal.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, AddExpenseModalComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent implements OnInit {
  private readonly expenseStore = inject(ExpenseStore);
  private readonly tripStore = inject(TripStore);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly dateFormatService = inject(DateFormatService);

  // Signals
  tripId = signal<string>('');
  selectedDate = signal<string>('');
  showAddExpenseModal = signal<boolean>(false);
  currentUserId = signal<string>('');
  currentUserName = signal<string>('');

  // Computed signals
  expenses = this.expenseStore.expenses;
  totalExpenses = this.expenseStore.totalBudgetUsed;
  participants = computed(() => this.tripStore.tripDetail()?.participants || []);
  tripDateBounds = computed(() => {
    const trip = this.tripStore.tripDetail();
    const start = trip?.startDate ? this.normalizeDate(trip.startDate) : '';
    const end = trip?.endDate ? this.normalizeDate(trip.endDate) : '';
    return { start, end };
  });

  /**
   * Últimos 3 gastos
   */
  recentExpenses = computed(() => {
    return this.expenses()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  });

  /**
   * Obtener rango de fechas del viaje
   */
  tripDateRange = computed(() => {
    const trip = this.tripStore.tripDetail();
    console.log('[tripDateRange] Trip detail:', trip);
    
    if (!trip?.startDate || !trip?.endDate) {
      console.log('[tripDateRange] No trip or missing dates');
      return [];
    }

    const dates: string[] = [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    // Asegurarse de que la fecha final sea inclusiva
    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(adjustedEnd.getDate() + 1);

    for (let d = new Date(start); d < adjustedEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dates.push(dateStr);
    }

    const sorted = dates.sort(); // Orden ascendente
    console.log('[tripDateRange] Generated dates:', sorted);
    return sorted;
  });

  /**
   * Mantener la fecha seleccionada dentro del rango del viaje
   */
  readonly clampSelectedDate = effect(() => {
    const range = this.tripDateRange();
    console.log('[clampSelectedDate] Range:', range);
    
    if (range.length === 0) {
      console.log('[clampSelectedDate] No dates available yet');
      return;
    }

    const current = this.selectedDate();
    console.log('[clampSelectedDate] Current selected:', current);
    
    if (!current || !range.includes(current)) {
      const fallback = range[0];
      console.log('[clampSelectedDate] Setting fallback:', fallback);
      this.selectedDate.set(fallback);
    }
  });

  /**
   * Obtener todas las fechas únicas con gastos
   */
  uniqueDates = computed(() => {
    const expenseDates = new Set(
      this.expenses().map(e => e.date)
    );
    // Combinar fechas del viaje con fechas con gastos
    const allDates = new Set([
      ...this.tripDateRange(),
      ...Array.from(expenseDates)
    ]);
    return Array.from(allDates).sort().reverse();
  });

  /**
   * Gastos del día seleccionado
   */
  expensesForSelectedDate = computed(() => {
    const selected = this.selectedDate();
    return this.expenses()
      .filter(e => e.date === selected)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  /**
   * Total gastos del día seleccionado
   */
  totalForSelectedDate = computed(() => {
    return this.expensesForSelectedDate()
      .reduce((sum, expense) => sum + expense.amount, 0);
  });

  /**
   * Presupuesto del viaje
   */
  tripBudget = computed(() => {
    const trip = this.tripStore.tripDetail();
    return trip?.budget || 0;
  });

  /**
   * Presupuesto restante
   */
  remainingBudget = computed(() => {
    return Math.max(0, this.tripBudget() - this.totalExpenses());
  });

  /**
   * Porcentaje de presupuesto usado
   */
  budgetPercentage = computed(() => {
    const budget = this.tripBudget();
    if (budget === 0) return 0;
    return Math.min(100, (this.totalExpenses() / budget) * 100);
  });

  /**
   * Obtener total por día
   */
  getTotalForDate = (date: string): number => {
    return this.expenses()
      .filter(e => e.date === date)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  /**
   * Mapping de categorías a emojis/iconos
   */
  categoryIcons: Record<string, string> = {
    'TRANSPORT': '✈️',
    'ACCOMMODATION': '🏨',
    'FOOD': '🍽️',
    'ACTIVITIES': '🎭',
    'OTHER': '📦'
  };

  /**
   * Deudas pendientes (calculado desde los gastos)
   */
  debts = computed(() => {
    const debtsMap = new Map<string, number>();
    const participants = this.participants();
    const currentId = this.currentUserId();
    const currentName = this.currentUserName();

    this.expenses().forEach(expense => {
      const amountPerParticipant = expense.amount / expense.participants.length;

      expense.participants.forEach(participantId => {
        if (participantId !== expense.payerId) {
          const key = `${participantId}|${expense.payerId}`;
          debtsMap.set(key, (debtsMap.get(key) || 0) + amountPerParticipant);
        }
      });
    });

    return Array.from(debtsMap.entries()).map(([key, amount]) => {
      const [debtorId, creditorId] = key.split('|');
      
      // Buscar deudor
      let debtorName = 'Desconocido';
      if (debtorId === currentId) {
        debtorName = currentName;
      } else {
        debtorName = participants.find(p => p.id === debtorId)?.name || 'Desconocido';
      }
      
      // Buscar acreedor
      let creditorName = 'Desconocido';
      if (creditorId === currentId) {
        creditorName = currentName;
      } else {
        creditorName = participants.find(p => p.id === creditorId)?.name || 'Desconocido';
      }
      
      return { debtor: debtorName, creditor: creditorName, amount };
    });
  });

  ngOnInit(): void {
    // Obtener usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId.set(currentUser.id);
      this.currentUserName.set(currentUser.name);
    }

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.tripId.set(id);
        this.expenseStore.loadExpensesByTrip(id);
        this.tripStore.loadTripDetail(id);
      }
    });
  }

  /**
   * Formatea fecha para mostrar en formato DD-MM-YYYY
   */
  formatDateForSelector(dateStr: string): { day: number; month: string } {
    return this.dateFormatService.getDateParts(dateStr);
  }

  /**
   * Formatea fecha completa en formato DD-MM-YYYY
   */
  formatDateComplete(dateStr: string): string {
    return this.dateFormatService.formatDisplayDate(dateStr);
  }

  /**
   * Seleccionar una fecha
   */
  selectDate(date: string): void {
    if (this.tripDateRange().includes(date)) {
      this.selectedDate.set(date);
    }
  }

  /**
   * Abrir modal para añadir gasto
   */
  openAddExpenseModal(): void {
    this.showAddExpenseModal.set(true);
  }

  /**
   * Cerrar modal de añadir gasto
   */
  closeAddExpenseModal(): void {
    this.showAddExpenseModal.set(false);
  }

  /**
   * Normaliza fecha a formato interno DD-MM-YYYY
   */
  private normalizeDate(dateStr: string): string {
    return this.dateFormatService.normalizeDate(dateStr);
  }

  /**
   * Eliminar gasto
   */
  deleteExpense(expenseId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      this.expenseStore.deleteExpense(expenseId).subscribe({
        next: () => {
          // El store se actualizará automáticamente
        },
        error: (err) => {
          console.error('Error al eliminar gasto:', err);
          alert('Error al eliminar el gasto');
        }
      });
    }
  }

  /**
   * Obtener nombre de participante por ID
   */
  getParticipantName(id: string): string {
    return this.participants().find(p => p.id === id)?.name || 'Desconocido';
  }

  /**
   * Obtener avatar de participante por ID
   */
  getParticipantAvatar(id: string): string {
    return this.participants().find(p => p.id === id)?.avatar || 'assets/default-avatar.png';
  }

  /**
   * Saldar una deuda
   */
  settleDebt(debtor: string, creditor: string): void {
    // Implementar lógica de pago
    console.log(`Saldando deuda de ${debtor} a ${creditor}`);
  }
}
