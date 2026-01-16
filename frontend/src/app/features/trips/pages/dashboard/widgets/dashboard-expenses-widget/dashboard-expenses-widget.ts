import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../../../components/shared/button/button';
import { ExpenseSummary } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-expenses-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './dashboard-expenses-widget.html',
  styleUrl: './dashboard-expenses-widget.scss'
})
export class DashboardExpensesWidgetComponent {
  @Input() expenses: ExpenseSummary = { total: 0, budget: 0, remaining: 0, items: [] };

  addExpense(): void {
    console.log('Añadir nuevo gasto');
    // TODO: Abrir modal o navegar a formulario de gastos
  }

  getProgressPercentage(): number {
    if (this.expenses.budget === 0) return 0;
    const percentage = (this.expenses.total / this.expenses.budget) * 100;
    return Math.min(Math.round(percentage), 100);
  }
}
