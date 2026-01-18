import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TripService } from '../../../../core/services/trip.service';
import { Trip } from '../../../../core/models/trip.model';
import { ItineraryStateService } from '../../services/itinerary-state.service';

interface ItineraryDay {
  date: Date;
  activities: string[];
  isCompleted: boolean;
  dayIndex?: number;
}

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itinerary.component.html',
  styleUrl: './itinerary.component.scss'
})
export class ItineraryComponent implements OnInit, OnDestroy {
  trip: Trip | null = null;
  days: ItineraryDay[] = [];
  tripId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private tripService: TripService,
    private route: ActivatedRoute,
    private itineraryStateService: ItineraryStateService
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      if (params['id']) {
        this.tripId = parseInt(params['id'], 10);
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

    this.tripService.getTripById(this.tripId).subscribe({
      next: (trip: Trip) => {
        this.trip = trip;
        
        // Inicializar el itinerario en el servicio de estado
        this.itineraryStateService.initializeItinerary(
          this.tripId!,
          trip.startDate,
          trip.endDate
        );
        
        // Suscribirse a los cambios del itinerario
        this.itineraryStateService.getItineraryState(this.tripId!)
          .pipe(takeUntil(this.destroy$))
          .subscribe(itineraryDays => {
            this.days = itineraryDays.map(day => ({
              date: new Date(day.date),
              activities: day.activities,
              isCompleted: day.isCompleted,
              dayIndex: day.dayIndex
            }));
          });
      },
      error: (error: any) => {
        console.error('Error loading trip:', error);
      }
    });
  }

  toggleDayCompletion(dayIndex: number): void {
    if (this.tripId && dayIndex >= 0 && dayIndex < this.days.length) {
      // Usar el día index almacenado o el índice del array
      const actualDayIndex = this.days[dayIndex].dayIndex ?? dayIndex;
      this.itineraryStateService.toggleDayCompletion(this.tripId, actualDayIndex);
    }
  }

  getDayNumber(day: ItineraryDay): number {
    return day.date.getDate();
  }

  getMonth(day: ItineraryDay): string {
    const monthNames = ['ene', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return monthNames[day.date.getMonth()];
  }

  getStatusButtonText(day: ItineraryDay): string {
    return day.isCompleted ? 'Completado' : 'No Completado';
  }

  getStatusIcon(day: ItineraryDay): string {
    return day.isCompleted ? '✓' : '✕';
  }
}
