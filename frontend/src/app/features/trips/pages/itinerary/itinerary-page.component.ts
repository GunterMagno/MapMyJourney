import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TripService } from '../../../../core/services/trip.service';
import { Trip } from '../../../../core/models/trip.model';
import { Activity, CreateActivityDto, ItineraryDay } from '../../models/itinerary.model';
import { ItineraryService } from '../../services/itinerary.service';
import { DateFormatService } from '../../../../core/services/date-format.service';
import { CreateActivityModalComponent } from './create-activity-modal/create-activity-modal.component';

// Colores cíclicos para los días (5 colores alternados)
const DAY_COLORS = [
  'var(--principal-color)',      // Rosa
  'var(--secondary-color)',      // Naranja
  'var(--quinary-color-disabled)',  // Amarillo
  'var(--quaternary-color)',     // Verde Agua
  '#9C27B0'                      // Morado
];

@Component({
  selector: 'app-itinerary-page',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    CreateActivityModalComponent
  ],
  templateUrl: './itinerary-page.component.html',
  styleUrl: './itinerary-page.component.scss'
})
export class ItineraryPageComponent implements OnInit, OnDestroy {
  // Signals
  trip = signal<Trip | null>(null);
  days = signal<ItineraryDay[]>([]);
  activities = signal<Activity[]>([]);
  selectedDate = signal<string>('');
  isLoading = signal(false);
  showAddActivityModal = signal<boolean>(false);
  
  // Computed
  tripDateRange = computed(() => {
    const trip = this.trip();
    if (!trip?.startDate || !trip?.endDate) {
      return [];
    }

    const dates: string[] = [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(adjustedEnd.getDate() + 1);

    for (let d = new Date(start); d < adjustedEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dates.push(dateStr);
    }

    return dates.sort();
  });

  readonly clampSelectedDate = effect(() => {
    const range = this.tripDateRange();
    if (range.length === 0) return;

    const current = this.selectedDate();
    if (!current || !range.includes(current)) {
      this.selectedDate.set(range[0]);
    }
  });

  activitiesForSelectedDate = computed(() => {
    const selected = this.selectedDate();
    return this.activities()
      .filter(a => a.date === selected)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  private destroy$ = new Subject<void>();
  private tripId: string | null = null;

  constructor(
    private tripService: TripService,
    private itineraryService: ItineraryService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private dateFormatService: DateFormatService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.tripId = params['id'];
        this.loadTripData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTripData(): void {
    if (!this.tripId) return;

    this.isLoading.set(true);

    this.tripService.getTripById(+this.tripId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (trip: Trip) => {
        this.trip.set(trip);
        this.loadItineraryActivities();
      },
      error: (error) => {
        console.error('Error loading trip:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadItineraryActivities(): void {
    if (!this.tripId) return;

    this.itineraryService.getActivitiesByTrip(this.tripId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (activities: Activity[]) => {
        this.activities.set(activities);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.isLoading.set(false);
      }
    });
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
   * Obtener color del día según índice
   */
  getDayColor(index: number): string {
    return DAY_COLORS[index % DAY_COLORS.length];
  }

  /**
   * Formatea fecha para mostrar en selector
   */
  formatDateForSelector(dateStr: string): { day: number; month: string } {
    return this.dateFormatService.getDateParts(dateStr);
  }

  /**
   * Formatea fecha completa
   */
  formatDateComplete(dateStr: string): string {
    return this.dateFormatService.formatDisplayDate(dateStr);
  }

  /**
   * Abrir modal para añadir actividad
   */
  openAddActivityModal(): void {
    this.showAddActivityModal.set(true);
  }

  /**
   * Cerrar modal
   */
  closeAddActivityModal(): void {
    this.showAddActivityModal.set(false);
  }

  /**
   * Cuando se añade una actividad desde el modal
   */
  onActivityAdded(newActivity: Activity): void {
    const currentActivities = this.activities();
    this.activities.set([...currentActivities, newActivity]);
    this.closeAddActivityModal();
  }

  /**
   * Drag and drop: reordenar actividades
   */
  onDrop(event: CdkDropListDropped<Activity>): void {
    const activities = this.activitiesForSelectedDate();
    
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    // Reordenar en memoria
    const reordered = [...activities];
    const [removed] = reordered.splice(event.previousIndex, 1);
    reordered.splice(event.currentIndex, 0, removed);

    // Actualizar orden en todas las actividades
    const allActivities = [...this.activities()];
    reordered.forEach((activity, index) => {
      const idx = allActivities.findIndex(a => a.id === activity.id);
      if (idx !== -1) {
        allActivities[idx] = { ...activity, order: index };
      }
    });

    this.activities.set(allActivities);

    // Persistir cambios en backend
    if (this.tripId) {
      const reorderDto = reordered.map((activity, index) => ({
        id: activity.id,
        order: index
      }));

      this.http.put(`/api/trips/${this.tripId}/itinerary/reorder`, reorderDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (error) => console.error('Error reordering activities:', error)
        });
    }
  }

  /**
   * Marcar actividad como completada
   */
  toggleActivityComplete(activity: Activity): void {
    const updated = { ...activity, completed: !activity.completed };
    const allActivities = this.activities().map(a => a.id === activity.id ? updated : a);
    this.activities.set(allActivities);

    // Persistir en backend
    if (this.tripId && activity.id) {
      this.itineraryService.updateActivity(activity.id, updated)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (error) => console.error('Error updating activity:', error)
        });
    }
  }

  /**
   * Eliminar actividad
   */
  deleteActivity(activity: Activity): void {
    if (confirm('¿Eliminar esta actividad?')) {
      const filtered = this.activities().filter(a => a.id !== activity.id);
      this.activities.set(filtered);

      if (activity.id) {
        this.itineraryService.deleteActivity(activity.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            error: (error) => console.error('Error deleting activity:', error)
          });
      }
    }
  }

  /**
   * Obtener total de actividades para el día
   */
  getTotalActivitiesForDate(date: string): number {
    return this.activities().filter(a => a.date === date).length;
  }
}
