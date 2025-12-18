import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonComponent } from '../../shared/button/button';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { ToastService } from '../../../services/toast.service';

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  totalExpenses: number;
}

/**
 * Trips list page - FASE 2: Services and Communication
 * Features:
 * - Authentication guard (redirects if not logged in)
 * - Displays list of user trips
 * - Navigation to trip details
 * - Create new trip button
 * - Delete trip with confirmation
 */
@Component({
  selector: 'app-trips-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './trips-page.html',
  styleUrl: './trips-page.scss'
})
export class TripsPageComponent implements OnInit, OnDestroy {
  trips: Trip[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadTrips();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAuthentication(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['/auth/login']);
        }
      });
  }

  private loadTrips(): void {
    // Mock data - in FASE 3 would call TripService
    this.trips = [
      {
        id: '1',
        name: 'Viaje a Barcelona',
        destination: 'Barcelona, España',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-07'),
        totalExpenses: 850
      },
      {
        id: '2',
        name: 'Viaje a París',
        destination: 'París, Francia',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-22'),
        totalExpenses: 1200
      }
    ];
  }

  createTrip(): void {
    this.router.navigate(['/trips/create']);
  }

  viewTrip(tripId: string): void {
    this.router.navigate(['/trips', tripId]);
  }

  deleteTrip(tripId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este viaje?')) {
      this.toastService.success('Viaje eliminado correctamente');
      this.trips = this.trips.filter(t => t.id !== tripId);
    }
  }
}
