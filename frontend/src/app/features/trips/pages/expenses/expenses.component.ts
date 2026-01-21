import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ExpenseStore, TripStore } from '../../../../core/store';
import { Expense, Participant } from '../../../../core/models';
import { AuthService } from '../../../../services/auth.service';
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

  // Signals
  tripId = signal<string>('');
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  showAddExpenseModal = signal<boolean>(false);
  currentUserId = signal<string>('');
  currentUserName = signal<string>('');

  // Computed signals
  expenses = this.expenseStore.expenses;
  totalExpenses = this.expenseStore.totalBudgetUsed;
  participants = computed(() => this.tripStore.tripDetail()?.participants || []);

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
    if (!trip?.startDate || !trip?.endDate) {
      return [];
    }

    const dates: string[] = [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates.reverse(); // Mostrar en orden descendente
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
      const [debtor, creditor] = key.split('|');
      const debtorName = participants.find(p => p.id === debtor)?.name || 'Desconocido';
      const creditorName = participants.find(p => p.id === creditor)?.name || 'Desconocido';
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
   * Formatear fecha para mostrar en selector
   */
  formatDateForSelector(dateStr: string): { day: number; month: string } {
    const date = new Date(dateStr + 'T00:00:00');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return {
      day: date.getDate(),
      month: months[date.getMonth()]
    };
  }

  /**
   * Seleccionar una fecha
   */
  selectDate(date: string): void {
    this.selectedDate.set(date);
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
