import { Component, OnInit, inject, computed, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ExpenseStore, TripStore } from '../../../../core/store';
import { Expense, Participant } from '../../../../core/models';
import { AuthService } from '../../../../services/auth.service';
import { DateFormatService } from '../../../../core/services/date-format.service';
import { AddExpenseModalComponent } from './modals/add-expense-modal.component';

// Interfaz para un día con fecha
interface DayWithDate {
  date: Date;
  dayIndex: number;
}

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, AddExpenseModalComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpensesComponent implements OnInit {
  private readonly expenseStore = inject(ExpenseStore);
  private readonly tripStore = inject(TripStore);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly dateFormatService = inject(DateFormatService);

  // Colores cíclicos para los días
  readonly DAY_COLORS = [
    'var(--principal-color)',
    'var(--secondary-color)',
    'var(--quinary-color)',
    'var(--quaternary-color)',
    '#9C27B0'
  ];

  // Signals
  tripId = signal<string>('');
  selectedDate = signal<string>('');
  showAddExpenseModal = signal<boolean>(false);
  currentUserId = signal<string>('');
  currentUserName = signal<string>('');
  preselectedDate = signal<string>('');
  settledPayments = signal<Set<string>>(new Set());

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
   * Computed: Todos los días del viaje (Similar a Itinerario)
   */
  days = computed(() => {
    const trip = this.tripStore.tripDetail();
    if (!trip?.startDate || !trip?.endDate) {
      return [];
    }

    const daysList: DayWithDate[] = [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    // Asegurarse de que la fecha final sea inclusiva
    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(adjustedEnd.getDate() + 1);

    let dayIndex = 0;
    for (let d = new Date(start); d < adjustedEnd; d.setDate(d.getDate() + 1)) {
      daysList.push({
        date: new Date(d),
        dayIndex: dayIndex
      });
      dayIndex++;
    }

    return daysList;
  });

  /**
   * Mantener la fecha seleccionada dentro del rango del viaje
   */
  readonly clampSelectedDate = effect(() => {
    const daysList = this.days();
    
    if (daysList.length === 0) {
      return;
    }

    const current = this.selectedDate();
    const validDates = daysList.map(d => d.date.toISOString().split('T')[0]);
    
    if (!current || !validDates.includes(current)) {
      const fallback = daysList[0].date.toISOString().split('T')[0];
      this.selectedDate.set(fallback);
    }
  });

  /**
   * Gastos agregados por categoría (para la sección 1)
   */
  aggregatedExpenses = computed(() => {
    const expensesByCategory = new Map<string, {
      category: string;
      description: string;
      payerIds: string[];
      total: number;
      latestDate: string;
    }>();

    this.expenses().forEach(expense => {
      const key = expense.category;
      const existing = expensesByCategory.get(key);

      if (existing) {
        existing.total += expense.amount;
        if (!existing.payerIds.includes(expense.payerId)) {
          existing.payerIds.push(expense.payerId);
        }
        if (new Date(expense.date) > new Date(existing.latestDate)) {
          existing.latestDate = expense.date;
        }
      } else {
        expensesByCategory.set(key, {
          category: expense.category,
          description: this.getCategoryDescription(expense.category),
          payerIds: [expense.payerId],
          total: expense.amount,
          latestDate: expense.date
        });
      }
    });

    return Array.from(expensesByCategory.values()).map(item => ({
      ...item,
      payerNames: item.payerIds
        .map(id => this.getParticipantName(id))
        .join(' / ')
    }));
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
   * Obtener todas las fechas únicas con gastos
   */
  uniqueDates = computed(() => {
    const daysList = this.days();
    const expenseDates = new Set(this.expenses().map(e => e.date));
    
    // Combinar fechas del viaje con fechas con gastos
    const allDates = new Set(
      daysList.map(d => d.date.toISOString().split('T')[0])
    );
    expenseDates.forEach(date => allDates.add(date));
    
    return Array.from(allDates).sort();
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
   * Obtener color cíclico para un día según su índice
   */
  getDayColor = (date: string): string => {
    const index = this.tripDateRange().indexOf(date);
    return index >= 0 ? this.DAY_COLORS[index % this.DAY_COLORS.length] : 'var(--principal-color)';
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

  /**
   * Pagos pendientes (para la sección 4)
   */
  pendingPayments = computed(() => {
    return this.debts()
      .filter(debt => !this.settledPayments().has(`${debt.debtor}|${debt.creditor}`))
      .map((debt, index) => ({
        id: `${debt.debtor}|${debt.creditor}|${index}`,
        debtor: debt.debtor,
        creditor: debt.creditor,
        amount: debt.amount
      }));
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
  formatDateForSelector(dateStr: string): { day: number; month: string; dayName: string } {
    return this.dateFormatService.getDateParts(dateStr);
  }

  /**
   * Formatea fecha completa en formato legible
   */
  formatDateComplete(dateStr: string): string {
    if (!dateStr) return '';
    return this.dateFormatService.formatDisplayDate(dateStr);
  }

  /**
   * Seleccionar una fecha (convertir Date a string)
   */
  selectDate(dateOrString: Date | string): void {
    let dateStr: string;
    if (dateOrString instanceof Date) {
      dateStr = dateOrString.toISOString().split('T')[0];
    } else {
      dateStr = dateOrString;
    }
    
    const validDates = this.days().map(d => d.date.toISOString().split('T')[0]);
    if (validDates.includes(dateStr)) {
      this.selectedDate.set(dateStr);
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
    console.log(`Saldando deuda de ${debtor} a ${creditor}`);
  }

  /**
   * Obtener descripción de categoría
   */
  getCategoryDescription(category: string): string {
    const categoryMap: Record<string, string> = {
      'TRANSPORT': 'Billetes del vuelo',
      'ACCOMMODATION': 'Pago Alojamiento',
      'FOOD': 'Comida',
      'ACTIVITIES': 'Actividades',
      'OTHER': 'Otros gastos'
    };
    return categoryMap[category] || category;
  }

  /**
   * Obtener icono para una categoría
   */
  getCategoryIcon(category: string): string {
    const categoryIcons: Record<string, string> = {
      'TRANSPORT': '✈️',
      'ACCOMMODATION': '🏨',
      'FOOD': '🍽️',
      'ACTIVITIES': '🎭',
      'OTHER': '📦'
    };
    return categoryIcons[category] || '📦';
  }

  /**
   * Obtener texto con participantes divididos
   */
  getSplitParticipantsText(participantIds: string[]): string {
    return participantIds
      .map(id => this.getParticipantName(id))
      .join(', ');
  }

  /**
   * Capitalizar primera letra de una cadena
   */
  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Abrir modal para editar un gasto
   */
  openEditExpenseModal(expense: Expense): void {
    console.log('Editar gasto:', expense);
    // TODO: Implementar edición de gastos
    this.openAddExpenseModal();
  }

  /**
   * Abrir modal para añadir gasto para una fecha específica
   */
  openAddExpenseModalForDate(date: string): void {
    this.preselectedDate.set(date);
    this.showAddExpenseModal.set(true);
  }

  /**
   * Manejador cuando se crea un gasto exitosamente
   */
  onExpenseAdded(expense: any): void {
    // El gasto ya fue guardado por el store
    // Solo cerramos el modal (que se cierra automáticamente por el evento close)
  }

  /**
   * Verificar si un gasto está marcado como pagado
   */
  isExpensePaid(expenseId: string): boolean {
    // Aquí puedes implementar lógica para verificar si el gasto está pagado
    // Por ahora retorna false, pero puede ser expandido
    return false;
  }

  /**
   * Abrir detalles de un gasto
   */
  openExpenseDetails(expense: Expense): void {
    // Implementar modal o navegación para ver detalles del gasto
    console.log('Abriendo detalles del gasto:', expense);
  }

  /**
   * Marcar un pago como saldado
   */
  markPaymentAsSettled(paymentId: string): void {
    const settled = new Set(this.settledPayments());
    settled.add(paymentId);
    this.settledPayments.set(settled);
  }
}
