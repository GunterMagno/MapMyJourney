import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Importar componentes
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';
import { ButtonComponent } from '../../shared/button/button';
import { CardComponent } from '../../shared/card/card';
import { FormSelectComponent } from '../../shared/form-select/form-select';
import { FormInputComponent } from '../../shared/form-input/form-input';

// Importar modelos (ajustar la ruta según tu estructura)
interface Trip {
  id: string;
  name: string;
  description: string;
  image: string;
  startDate: Date;
  endDate: Date;
  participants: { id: string; name: string }[];
  totalExpense: number;
  status: 'planning' | 'ongoing' | 'completed';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
    ButtonComponent,
    CardComponent,
    FormSelectComponent,
    FormInputComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Control de datos
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];

  // Formularios y controles
  statusFilterControl = new FormControl('');
  searchControl = new FormControl('');

  // Opciones de filtro
  statusFilterOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'planning', label: 'En Planificación' },
    { value: 'ongoing', label: 'En Progreso' },
    { value: 'completed', label: 'Completados' }
  ];

  // Estadísticas
  upcomingTripsCount = 0;
  totalSpent = 0;
  totalParticipants = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrips();
    this.setupFilters();
  }

  /**
   * Carga los viajes desde el servicio
   */
  private loadTrips(): void {
    // TODO: Reemplazar con llamada real al servicio
    // this.tripService.getTrips().pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe(trips => {
    //   this.trips = trips;
    //   this.applyFilters();
    //   this.updateStatistics();
    // });

    // MOCK DATA
    this.trips = [
      {
        id: '1',
        name: 'Viaje a París',
        description: 'Experiencia increíble visitando los monumentos más icónicos de Francia. Duracion: 7 dias',
        image: 'images/paris.jpg',
        startDate: new Date(2024, 5, 10),
        endDate: new Date(2024, 5, 17),
        participants: [{ id: '1', name: 'Juan' }, { id: '2', name: 'María' }],
        totalExpense: 2500,
        status: 'planning'
      },
      {
        id: '2',
        name: 'Viaje a Japón',
        description: 'Exploración de cultura ancestral y tecnología moderna en Tokio y Kioto. Duracion: 14 dias',
        image: 'images/japan.jpg',
        startDate: new Date(2024, 7, 1),
        endDate: new Date(2024, 7, 15),
        participants: [{ id: '1', name: 'Juan' }, { id: '3', name: 'Carlos' }, { id: '4', name: 'Ana' }],
        totalExpense: 5000,
        status: 'planning'
      },
      {
        id: '3',
        name: 'Viaje a Nueva York',
        description: 'La ciudad que nunca duerme: Broadway, Central Park y compras en 5ta Avenida. Duracion: 5 dias',
        image: 'images/newyork.jpg',
        startDate: new Date(2024, 3, 15),
        endDate: new Date(2024, 3, 20),
        participants: [{ id: '1', name: 'Juan' }],
        totalExpense: 1800,
        status: 'completed'
      }
    ];

    this.filteredTrips = [...this.trips];
    this.updateStatistics();
  }

  /**
   * Configura los filtros y búsqueda
   */
  private setupFilters(): void {
    // Filtro por estado
    this.statusFilterControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyFilters());

    // Búsqueda en tiempo real
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyFilters());
  }

  /**
   * Aplica los filtros actuales
   */
  private applyFilters(): void {
    let filtered = [...this.trips];

    // Filtrar por estado
    const statusFilter = this.statusFilterControl.value;
    if (statusFilter) {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    // Filtrar por búsqueda
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.name.toLowerCase().includes(searchTerm) ||
        trip.description.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredTrips = filtered;
  }

  /**
   * Actualiza las estadísticas
   */
  private updateStatistics(): void {
    const now = new Date();

    this.upcomingTripsCount = this.trips.filter(
      trip => new Date(trip.startDate) > now
    ).length;

    this.totalSpent = this.trips.reduce(
      (sum, trip) => sum + trip.totalExpense,
      0
    );

    // Contar participantes únicos
    const participantsSet = new Set<string>();
    this.trips.forEach(trip => {
      trip.participants.forEach(p => participantsSet.add(p.id));
    });
    this.totalParticipants = participantsSet.size;
  }

  /**
   * Maneja el clic en un viaje
   */
  onTripClick(tripId: string): void {
    this.router.navigate(['/trip', tripId]);
  }

  /**
   * Abre el modal para crear un nuevo viaje
   */
  onCreateTrip(): void {
    this.router.navigate(['/trip/new']);
  }

  /**
   * TrackBy para el *ngFor
   */
  trackByTripId(_index: number, trip: Trip): string {
    return trip.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
