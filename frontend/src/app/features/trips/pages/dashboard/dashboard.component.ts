import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LoadingSpinnerComponent } from '../../../../components/shared/loading-spinner/loading-spinner';
import { TripService } from '../../../../services/trip.service';
import { ExpenseService } from '../../../../core/services/expense.service';
import { ItineraryStateService } from '../../services/itinerary-state.service';

import { DashboardData, ItineraryDay } from '../../models/dashboard.model';
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
  private itineraryStateService = inject(ItineraryStateService);

  ngOnInit(): void {
    // Obtener tripId de la ruta actual o del parent
    const id = this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id');
    this.tripId = Number(id);
    
    if (this.tripId) {
      this.loadDashboardData();
    } else {
      this.error = 'No se especificó un ID de viaje';
      this.isLoading = false;
    }
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
      trip: this.tripService.getTripById(this.tripId),
      expenses: this.expenseService.getExpensesByTrip(this.tripId.toString())
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          // Inicializar el itinerario en el servicio de estado
          this.itineraryStateService.initializeItinerary(
            this.tripId,
            data.trip.startDate,
            data.trip.endDate
          );
          
          // Combinar datos del backend
          this.dashboardData = this.buildDashboardData(data.trip, data.expenses);
          this.isLoading = false;
          
          // Suscribirse a cambios en el itinerario
          this.itineraryStateService.getItineraryState(this.tripId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(itineraryDays => {
              if (this.dashboardData) {
                this.dashboardData.itinerary = this.convertToItineraryDays(itineraryDays);
              }
            });
        },
        error: (err: any) => {
          console.error('Error loading dashboard data:', err);
          this.error = 'Error al cargar los datos del dashboard';
          this.isLoading = false;
        }
      });
  }

  /**
   * Construye los datos del dashboard a partir de los datos del backend
   */
  private buildDashboardData(trip: any, expensesResponse: any): DashboardData {
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

    // Generar días del itinerario desde el servicio de estado
    const itineraryStates = this.itineraryStateService.getCurrentItinerary(this.tripId);
    const itineraryDays = this.convertToItineraryDays(itineraryStates);

    return {
      itinerary: itineraryDays,
      documents: [], // Sin documentos por ahora
      expenses: {
        total: totalExpenses,
        budget: trip.budget || 0,
        remaining: (trip.budget || 0) - totalExpenses,
        items: expenseItems
      },
      polls: [] // Sin votaciones por ahora
    };
  }

  /**
   * Convierte los estados del itinerario a formato ItineraryDay para el dashboard
   */
  private convertToItineraryDays(states: any[]): ItineraryDay[] {
    return states.map(state => ({
      date: state.date,
      activities: state.activities || [],
      isCompleted: state.isCompleted,
      dayNumber: state.dayIndex + 1
    }));
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

}
