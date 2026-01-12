import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonComponent } from '../../shared/button/button';
import { CardComponent } from '../../shared/card/card';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { ToastService } from '../../../services/toast.service';
import { TripService } from '../../../core/services/trip.service';
import { TripStore } from '../../../core/store';
import { Trip } from '../../../core/models';

/**
 * FASE 6: Trips List Page - Gestión Reactiva y Infinite Scroll
 *
 * Refactorizado para usar:
 * - TripStore con Signals (gestión de estado)
 * - Infinite Scroll con IntersectionObserver
 * - OnPush ChangeDetection (rendimiento)
 * - Trackable @for loop (preservar DOM)
 *
 * Features:
 * - ✅ Carga inicial de viajes
 * - ✅ Infinite scroll: carga más viajes al bajar
 * - ✅ Eliminar con actualización inmediata (optimistic UI)
 * - ✅ Crear viaje vinculado al store
 * - ✅ Loading states y mensajes de error
 */
@Component({
  selector: 'app-trips-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, HeaderComponent, FooterComponent],
  templateUrl: './trips-page.html',
  styleUrl: './trips-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // ✅ Cambio detección solo cuando cambien señales o inputs
})
export class TripsPageComponent implements OnInit, OnDestroy {
  // ============================================================================
  // INYECCIONES
  // ============================================================================

  private authService = inject(AuthService);
  private tripService = inject(TripService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  tripStore = inject(TripStore); // ✅ Inyectar store

  // ============================================================================
  // REFERENCIAS AL DOM (para Infinite Scroll)
  // ============================================================================

  @ViewChild('scrollAnchor', { static: false }) scrollAnchor?: ElementRef<HTMLElement>;

  // ============================================================================
  // OBSERVABLES PARA LIMPIEZA (para BehaviorSubjects si se usan)
  // ============================================================================

  private destroy$ = new Subject<void>();
  private observer?: IntersectionObserver;

  // ============================================================================
  // SEÑALES DERIVADAS DEL STORE
  // ============================================================================

  // Acceso directo a las señales del store para usar en template
  trips = this.tripStore.trips;
  loading = this.tripStore.loading;
  hasMore = this.tripStore.hasMore;
  totalTrips = this.tripStore.totalTrips;
  error = this.tripStore.error;

  // ============================================================================
  // CICLO DE VIDA
  // ============================================================================

  ngOnInit(): void {
    this.checkAuthentication();
    // El TripStore ya carga en su constructor, aquí solo nos suscribimos
    this._setupInfiniteScroll();
  }

  ngAfterViewInit(): void {
    // Inicializar IntersectionObserver después de que la vista esté lista
    if (this.scrollAnchor) {
      this._initializeInfiniteScrollObserver();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Limpiar IntersectionObserver
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Crear nuevo viaje
   * Navega a la página de creación
   */
  createTrip(): void {
    this.router.navigate(['/trips/create']);
  }

  /**
   * Ver detalles de un viaje
   * Navega a la página de detalles
   */
  viewTrip(tripId: string): void {
    this.router.navigate(['/trips', tripId]);
  }

  /**
   * Eliminar un viaje
   * ✅ Optimistic UI: elimina del store inmediatamente
   * Revierte si la API falla
   */
  deleteTrip(tripId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este viaje?')) {
      // Guardar el viaje por si hay que revertir
      const currentTrips = this.tripStore.trips();
      const deletedTrip = currentTrips.find(t => t.id === tripId);

      // ✅ Actualización optimista: eliminar inmediatamente del store
      this.tripStore.removeTrip(tripId);
      this.toastService.success('Viaje eliminado');

      // Enviar petición a API
      this.tripService.deleteTrip(tripId).subscribe({
        next: () => {
          this.toastService.success('Cambios guardados');
        },
        error: (err) => {
          console.error('Error al eliminar viaje:', err);
          // Revertir si falla
          if (deletedTrip) {
            this.tripStore.addTrip(deletedTrip);
          }
          this.toastService.error('No se pudo eliminar el viaje');
        }
      });
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - AUTENTICACIÓN E INFINITE SCROLL
  // ============================================================================

  /**
   * Verificar que el usuario esté autenticado
   */
  private checkAuthentication(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['/auth/login']);
        }
      });
  }

  /**
   * Preparar el setup de infinite scroll
   */
  private _setupInfiniteScroll(): void {
    // Este método es llamado en ngOnInit
    // El observer se inicializa en ngAfterViewInit
  }

  /**
   * ✅ INFINITE SCROLL: Usar IntersectionObserver API
   *
   * Cuando el usuario hace scroll y el elemento sentinel se vuelve visible:
   * - Se llama a loadMore() del store
   * - El store carga la siguiente página
   * - Los viajes nuevos se acumulan (update: [...old, ...new])
   * - La UI se actualiza automáticamente sin parpadeos (trackBy preserva DOM)
   */
  private _initializeInfiniteScrollObserver(): void {
    if (!this.scrollAnchor) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Cuando el sentinel entra en viewport
          if (entry.isIntersecting) {
            // Verificar que no esté ya cargando y que haya más datos
            if (!this.loading() && this.hasMore()) {
              this.tripStore.loadMore();
            }
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '100px', // Cargar antes de llegar al final
        threshold: 0.1 // 10% visible
      }
    );

    // Observar el elemento sentinel
    this.observer.observe(this.scrollAnchor.nativeElement);
  }

  // ============================================================================
  // TRACKBY PARA @FOR (PRESERVA DOM Y MEJORA RENDIMIENTO)
  // ============================================================================

  /**
   * ✅ TrackBy: Indica a Angular que rastreé por ID, no por índice
   * Evita que se recrear todo el DOM cuando la lista cambia
   *
   * @example
   * @for (trip of trips(); track trackById(trip))
   */
  trackById(trip: Trip): string {
    return trip.id;
  }
}
