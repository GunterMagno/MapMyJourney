import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SidebarComponent, SidebarNavLink, TripSidebarInfo } from '../../../../components/layout/sidebar/sidebar';
import { TripService, Trip } from '../../../../services/trip.service';
import { LoadingService } from '../../../../services/loading.service';

@Component({
  selector: 'app-trip-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './trip-layout.html',
  styleUrl: './trip-layout.scss'
})
export class TripLayoutComponent implements OnInit, OnDestroy {
  tripInfo?: TripSidebarInfo;
  navLinks: SidebarNavLink[] = [];
  tripId?: number;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.initializeNavLinks();
    this.loadTripData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa los enlaces de navegación del sidebar
   */
  private initializeNavLinks(): void {
    this.navLinks = [
      { 
        label: 'Dashboard', 
        route: 'dashboard', 
        icon: '/assets/icons/sidebar/dashboard.svg' 
      },
      { 
        label: 'Itinerario', 
        route: 'itinerario', 
        icon: '/assets/icons/sidebar/itinerary.svg' 
      },
      { 
        label: 'Gastos', 
        route: 'gastos', 
        icon: '/assets/icons/sidebar/expenses.svg' 
      },
      { 
        label: 'Documentos', 
        route: 'documentos', 
        icon: '/assets/icons/sidebar/documents.svg',
        badge: 0
      },
      { 
        label: 'Votaciones', 
        route: 'votaciones', 
        icon: '/assets/icons/sidebar/votes.svg' 
      },
      { 
        label: 'Compartir', 
        route: 'compartir', 
        icon: '/assets/icons/sidebar/share.svg' 
      }
    ];
  }

  /**
   * Carga la información del viaje desde el backend
   */
  private loadTripData(): void {
    this.tripId = this.route.snapshot.paramMap.get('id') 
      ? Number(this.route.snapshot.paramMap.get('id'))
      : undefined;

    if (!this.tripId) {
      console.error('Trip ID not found in route parameters');
      this.isLoading = false;
      return;
    }

    this.loadingService.show();
    
    this.tripService.getTripById(this.tripId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trip: Trip) => {
          this.tripInfo = {
            id: trip.id,
            title: trip.title,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate
          };
          this.isLoading = false;
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error loading trip:', error);
          this.isLoading = false;
          this.loadingService.hide();
          // TODO: Mostrar mensaje de error y redirigir
        }
      });
  }
}
