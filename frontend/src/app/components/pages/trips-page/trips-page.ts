import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonComponent } from '../../shared/button/button';
import { CardComponent } from '../../shared/card/card';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';
import { TripsFiltersComponent } from '../../shared/trips-filters/trips-filters.component';
import { CreateTripModalComponent } from '../home/create-trip-modal/create-trip-modal';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { ToastService } from '../../../core/services/toast.service';
import { DateFormatService } from '../../../core/services/date-format.service';
import { CommunicationService } from '../../../services/communication.service';
import { TripFormData } from '../../../services/trip.service';
import { TripService } from '../../../core/services/trip.service';
import { TripStore } from '../../../core/store';
import { Trip } from '../../../core/models';

/**
 * Trips List Page - Gestión Reactiva y Infinite Scroll
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
  imports: [CommonModule, ButtonComponent, CardComponent, HeaderComponent, FooterComponent, TripsFiltersComponent, CreateTripModalComponent],
  templateUrl: './trips-page.html',
  styleUrl: './trips-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripsPageComponent implements OnInit, OnDestroy {
  // ============================================================================
  // INYECCIONES
  // ============================================================================

  private authService = inject(AuthService);
  private tripService = inject(TripService);
  private toastService = inject(ToastService);
  private dateFormatService = inject(DateFormatService);
  private communicationService = inject(CommunicationService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  tripStore = inject(TripStore);

  // ============================================================================
  // REFERENCIAS AL DOM (para Infinite Scroll)
  // ============================================================================

  @ViewChild('scrollAnchor', { static: false }) scrollAnchor?: ElementRef<HTMLElement>;
  @ViewChild('createTripModal') createTripModal?: CreateTripModalComponent;

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
    
    this._leerNavegacionAvanzada();
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
   * Abre el modal de creación
   */
  createTrip(): void {
    this.communicationService.openModal('create-trip');
  }

  /**
   * Ver detalles de un viaje
   * Navega a la página de detalles
   */
  viewTrip(tripId: number): void {
    this.router.navigate(['/trips', tripId]);
  }

  /**
   * Eliminar un viaje
   * ✅ Optimistic UI: elimina del store inmediatamente
   * Revierte si la API falla
   */
  deleteTrip(tripId: number): void {
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

  /**
   * Maneja la creación de un nuevo viaje desde el modal
   */
  onTripCreated(tripData: TripFormData): void {
    // Mapear TripFormData a CreateTripDto
    const createTripDto = {
      title: tripData.title,
      destination: tripData.destination,
      description: tripData.description,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      budget: tripData.budget || 0
    };

    this.tripService.createTrip(createTripDto).subscribe({
      next: (newTrip) => {
        this.tripStore.addTrip(newTrip);
        this.toastService.success('Viaje creado con éxito');
        this.createTripModal?.closeModal();
      },
      error: (err) => {
        console.error('Error al crear viaje:', err);
        this.toastService.error('No se pudo crear el viaje');
      }
    });
  }

  /**
   * Cierra el mensaje de error
   */
  dismissError(): void {
    this.tripStore.clearError();
  }

  /**
   * Reintenta la carga de viajes
   */
  retryLoadTrips(): void {
    this.tripStore.reloadTrips();
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
  trackById(trip: Trip): number {
    return trip.id;
  }

  /**
   * Calcula el porcentaje de presupuesto gastado
   */
  getProgressPercentage(trip: Trip): number {
    if (!trip.budget || trip.budget === 0) return 0;
    const spent = trip.totalExpenses || 0;
    return Math.min((spent / trip.budget) * 100, 100);
  }

  // ============================================================================
  // BLOQUE 4.2: LECTURA DE NAVEGACIÓN AVANZADA
  // ============================================================================

  /**
   * Lee y procesa los datos de navegación avanzada
   *
   * Navegación Programática Completa
   *
   * Lectura de:
   * ✅ QueryParams: orden, pag, q (visibles en URL)
   * ✅ Fragment: top, middle, etc. (scroll a sección)
   * ✅ State: origen, timestamp, filtros (datos ocultos)
   *
   * @example
   * URL recibida: /trips?orden=fecha_asc&pag=1&q=Barcelona#top
   * State recibido: { origen: 'busqueda_avanzada', timestamp: 1234567890 }
   *
   * Output console:
   * "📍 QueryParams recibidos: { orden: 'fecha_asc', pag: 1, q: 'Barcelona' }"
   * "📌 Fragment: top"
   * "📦 State: { origen: 'busqueda_avanzada', timestamp: 1234567890 }"
   */
  private _leerNavegacionAvanzada(): void {
    // 1️⃣ LEER QUERY PARAMS (visibles en URL: ?clave=valor)
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const orden = params['orden'] || 'fecha_desc';
        const pagina = params['pag'] || '1';
        const query = params['q'] || '';

        console.log('📍 QueryParams recibidos en TripsPageComponent:', {
          orden,
          pagina,
          query
        });

        // Aplicar filtros si existen
        if (query) {
          console.log(`🔍 Filtro de búsqueda activo: "${query}"`);
        }
      });

    // 2️⃣ LEER FRAGMENT (#sección)
    this.activatedRoute.fragment
      .pipe(takeUntil(this.destroy$))
      .subscribe(fragment => {
        if (fragment) {
          console.log('📌 Fragment recibido:', fragment);
          
          // Scroll programático al elemento
          setTimeout(() => {
            const element = document.getElementById(fragment);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              console.log(`✅ Scroll ejecutado a #${fragment}`);
            }
          }, 300);
        }
      });

    // 3️⃣ LEER STATE (datos ocultos en la navegación)
    const state = this.router.getCurrentNavigation()?.extras?.state;
    if (state) {
      console.log('📦 State recibido en TripsPageComponent:', state);
      console.log('   - Origen:', state['origen']);
      console.log('   - Timestamp:', new Date(state['timestamp']).toLocaleString());
      console.log('   - Filtros:', state['filtros']);
    } else {
      // Intenta leer desde window.history.state si no está en navigation
      const historyState = (window.history.state as any);
      if (historyState?.origen) {
        console.log('📦 State desde history.state:', historyState);
      }
    }
  }

  /**
   * Formatea las fechas de un viaje en formato DD-MM-YYYY
   */
  formatTripDates(startDate: Date | string, endDate: Date | string): string {
    const start = this.dateFormatService.formatDisplayDate(startDate);
    const end = this.dateFormatService.formatDisplayDate(endDate);
    return `${start} - ${end}`;
  }
}
