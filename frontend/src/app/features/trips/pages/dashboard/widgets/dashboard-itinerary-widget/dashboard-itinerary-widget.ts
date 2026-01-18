import { Component, Input, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ItineraryDay } from '../../../../models/dashboard.model';
import { ItineraryStateService } from '../../../../services/itinerary-state.service';

@Component({
  selector: 'app-dashboard-itinerary-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-itinerary-widget.html',
  styleUrl: './dashboard-itinerary-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardItineraryWidgetComponent implements OnInit, OnDestroy {
  @Input() days: ItineraryDay[] = [];
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private itineraryStateService = inject(ItineraryStateService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private tripId: number = 0;

  ngOnInit(): void {
    // Obtener el tripId de la ruta
    this.route.parent?.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.tripId = parseInt(params['id'], 10);
        // Suscribirse a los cambios del itinerario cuando obtenemos el tripId
        this.itineraryStateService.getItineraryState(this.tripId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(itineraryStates => {
            // Convertir estados a formato ItineraryDay
            this.days = itineraryStates.map(state => ({
              date: state.date,
              activities: state.activities || [],
              isCompleted: state.isCompleted,
              dayNumber: state.dayIndex + 1
            }));
            // Marcar el componente como modificado para detectar cambios
            this.cdr.markForCheck();
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToDay(index: number): void {
    // Navegar a la vista de itinerario del viaje actual
    this.router.navigate(['../itinerario'], {
      relativeTo: this.route
    });
  }

  getDayNumber(dateString: string): string {
    const date = new Date(dateString);
    return date.getDate().toString();
  }

  getMonth(dateString: string): string {
    const date = new Date(dateString);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return months[date.getMonth()];
  }

  toggleDayCompletion(index: number): void {
    if (index >= 0 && index < this.days.length && this.tripId) {
      // Usar el servicio de estado para actualizar
      this.itineraryStateService.toggleDayCompletion(this.tripId, index);
    }
  }
}
