import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LoadingSpinnerComponent } from '../../../../components/shared/loading-spinner/loading-spinner';
import { TripService } from '../../../../services/trip.service';
import { ExpenseService } from '../../../../core/services/expense.service';

import { DashboardData } from '../../models/dashboard.model';
import { DashboardItineraryWidgetComponent } from './widgets/dashboard-itinerary-widget/dashboard-itinerary-widget';
import { DashboardDocumentsWidgetComponent } from './widgets/dashboard-documents-widget/dashboard-documents-widget';
import { DashboardExpensesWidgetComponent } from './widgets/dashboard-expenses-widget/dashboard-expenses-widget';
import { DashboardPollsWidgetComponent } from './widgets/dashboard-polls-widget/dashboard-polls-widget';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    DashboardItineraryWidgetComponent,
    DashboardDocumentsWidgetComponent,
    DashboardExpensesWidgetComponent,
    DashboardPollsWidgetComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData?: DashboardData;
  isLoading = false;
  error?: string;
  tripId: number = 0;

  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  private expenseService = inject(ExpenseService);

  ngOnInit(): void {
    // Obtener tripId de la ruta padre
    this.tripId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los datos del dashboard
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = undefined;

    // Cargar datos en paralelo desde el backend
    forkJoin({
      expenses: this.expenseService.getExpensesByTrip(this.tripId.toString())
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          // Combinar datos del backend con datos mock
          this.dashboardData = this.buildDashboardData(data.expenses);
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading dashboard data:', err);
          // Si falla la carga del backend, usar solo datos mock
          this.dashboardData = this.getMockData();
          this.isLoading = false;
          // No mostrar error para no romper la UX
        }
      });
  }

  /**
   * Construye los datos del dashboard a partir de los datos del backend
   */
  private buildDashboardData(expensesResponse: any): DashboardData {
    // Procesar gastos del backend
    const expenses = Array.isArray(expensesResponse) 
      ? expensesResponse 
      : expensesResponse?.content || [];

    let totalExpenses = 0;
    const expenseItems = expenses.slice(0, 3).map((expense: any) => {
      totalExpenses += expense.amount || 0;
      return {
        description: expense.description || 'Gasto sin descripción',
        paidBy: expense.paidByUserName || 'Usuario desconocido',
        date: this.formatDate(expense.expenseDate),
        amount: expense.amount || 0
      };
    });

    return {
      itinerary: this.getMockData().itinerary, // Mock por ahora
      documents: this.getMockData().documents, // Mock por ahora
      expenses: {
        total: totalExpenses,
        items: expenseItems
      },
      polls: this.getMockData().polls // Mock por ahora
    };
  }

  /**
   * Formatea una fecha al formato deseado
   */
  private formatDate(dateString: string): string {
    if (!dateString) return 'Fecha desconocida';
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('es-ES', options);
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Retorna datos mock para desarrollo
   */
  private getMockData(): DashboardData {
    return {
      itinerary: [
        {
          date: '17 OCT',
          activities: ['Llegada', 'Visita Museo', 'Big Ben'],
          isCompleted: true,
          dayNumber: 1
        },
        {
          date: '18 OCT',
          activities: ['London Eye', 'Apocalipsis'],
          isCompleted: false,
          dayNumber: 2
        },
        {
          date: '19 OCT',
          activities: [],
          isCompleted: false,
          dayNumber: 3
        },
        {
          date: '19 OCT',
          activities: [],
          isCompleted: false,
          dayNumber: 4
        },
        {
          date: '19 OCT',
          activities: [],
          isCompleted: false,
          dayNumber: 5
        }
      ],
      documents: [
        { name: 'Billetes de vuelo ida', isComplete: true, count: '4/4' },
        { name: 'Reserva de hotel', isComplete: false, count: '0/1' },
        { name: 'Entradas para museo', isComplete: true, count: '4/4' },
        { name: 'Billetes de vuelo vuelta', isComplete: false, count: '3/4' }
      ],
      expenses: {
        total: 2081.25,
        items: [
          {
            description: 'Billetes del vuelo',
            paidBy: 'Ale Magno',
            date: 'Mayo 10, 2024',
            amount: 1250.75
          },
          {
            description: 'Pago Alojamiento',
            paidBy: 'Luque',
            date: 'Mayo 15, 2024',
            amount: 450.0
          },
          {
            description: 'Coche de alquiler',
            paidBy: 'Fran Talita',
            date: 'Mayo 20, 2024',
            amount: 380.5
          }
        ]
      },
      polls: [
        {
          question: 'A que deberíamos ir primero el día 1?',
          options: [
            { name: 'Torre Eiffel', votes: 3 },
            { name: 'Arco del Triunfo', votes: 1 },
            { name: 'Museo del Louvre', votes: 2 }
          ]
        },
        {
          question: 'A que deberíamos ir por la tarde el día 2?',
          options: [
            { name: 'Canal de San Martín', votes: 2 },
            { name: 'Musée d\'Orsay', votes: 3 }
          ]
        }
      ]
    };
  }
}
