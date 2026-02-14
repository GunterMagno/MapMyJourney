import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommonModule as CommonAngularModule } from '@angular/common';

// Importar componentes
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';
import { GalleryComponent } from '../../shared/gallery/gallery.component';

// ✅ FASE 6: Importar stores y modelos
import { TripStore, ExpenseStore } from '../../../core/store';
import { Trip, ExpenseWithDetails } from '../../../core/models';
import { DateFormatService, PollingService } from '../../../core/services';

// Interfaces locales para secciones que no son de estado global
interface Activity {
  icon: string;
  title: string;
  time: string;
  location: string;
}

interface ItineraryDay {
  date: Date;
  title: string;
  description: string;
  activities: Activity[];
}

interface VotingOption {
  label: string;
  votes: number;
  userVoted: boolean;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  options: VotingOption[];
  totalVotes: number;
}

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document' | 'spreadsheet';
  uploadedBy: string;
  date: Date;
}

interface Participant {
  id: string;
  name: string;
}

/**
 * FASE 6: Trip Detail Component - Gestión de Gastos Reactiva
 *
 * Refactorizado para usar:
 * - ExpenseStore: Gestión reactiva de gastos
 * - Computed Signals: totalBudgetUsed se recalcula automáticamente
 * - OnPush ChangeDetection: Mejor rendimiento
 *
 * Features:
 * - ✅ Carga gastos del viaje actual
 * - ✅ Totalización automática con computed signal
 * - ✅ Eliminar gasto con actualización inmediata
 * - ✅ Filtrado por categoría/pagador
 * - ✅ Infinite Scroll para gastos
 */
@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, GalleryComponent],
  templateUrl: './trip-detail.html',
  styleUrl: './trip-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // ✅ OnPush para mejor rendimiento
})
export class TripDetailComponent implements OnInit, OnDestroy {
  // ============================================================================
  // INYECCIONES
  // ============================================================================

  private route = inject(ActivatedRoute);
  private dateFormatService = inject(DateFormatService);
  private pollingService = inject(PollingService);
  tripStore = inject(TripStore);
  expenseStore = inject(ExpenseStore);

  // ============================================================================
  // REFERENCIAS AL DOM (para Infinite Scroll de gastos)
  // ============================================================================

  @ViewChild('expenseScrollAnchor', { static: false }) expenseScrollAnchor?: ElementRef<HTMLElement>;

  // ============================================================================
  // STATE LOCAL (que no está en store global)
  // ============================================================================

  tripId: string = '';
  activeSection: 'itinerary' | 'gallery' | 'voting' | 'documents' | 'expenses' = 'itinerary';
  mobileMenuOpen: boolean = false;

  // Datos lokales
  itineraryDays: ItineraryDay[] = [];
  proposals: Proposal[] = [];
  documents: Document[] = [];

  // ============================================================================
  // OBSERVABLES DEL STORE
  // ============================================================================

  // ✅ Acceso a señales del store de viajes
  // (para mostrar info del viaje actual)
  currentTrip: Trip | undefined;

  // ✅ Acceso a señales del store de gastos
  expenses = this.expenseStore.expenses;
  expenseLoading = this.expenseStore.loading;
  expenseError = this.expenseStore.error;

  // ✅ CLAVE: Computed signals que se recalculan automáticamente
  totalBudgetUsed = this.expenseStore.totalBudgetUsed;
  expensesByCategory = this.expenseStore.expensesByCategory;
  expensesByPayer = this.expenseStore.expensesByPayer;
  averageExpense = this.expenseStore.averageExpense;
  maxExpense = this.expenseStore.maxExpense;

  // Para uso en template
  expenseTotalTrips = this.expenseStore.totalExpenses;

  // ============================================================================
  // PROPIEDADES DERIVADAS PARA TEMPLATE (FASE 6) 
  // ============================================================================

  tripName = computed(() => 'París - Viaje memorable');
  tripStartDate = computed(() => new Date(2024, 5, 10));
  tripEndDate = computed(() => new Date(2024, 5, 17));
  tripLocation = computed(() => 'París, Francia');
  participantsCount = computed(() => 4);
  participants = computed(() => [
    { id: '1', name: 'Juan Pérez' },
    { id: '2', name: 'María García' },
    { id: '3', name: 'Carlos López' },
    { id: '4', name: 'Ana Martínez' }
  ]);

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getDocumentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      pdf: '📕',
      image: '🖼️',
      document: '📄',
      spreadsheet: '📊'
    };
    return icons[type] || '📄';
  }

  private observer?: IntersectionObserver;

  // ============================================================================
  // CICLO DE VIDA
  // ============================================================================

  ngOnInit(): void {
    // LEER DATOS DEL RESOLVER
    // Los datos ya fueron precargados por tripResolver
    // No hay parpadeo porque el componente espera hasta que estén listos
    
    const tripData = this.route.snapshot.data['trip'];
    
    if (tripData) {
      console.log('Datos del viaje cargados por resolver (SIN PARPADEO):', tripData);
      this.tripId = tripData.id;
      
      // Cargar gastos asociados al viaje
      this.expenseStore.loadExpensesByTrip(this.tripId);

      // FASE 6 - REALTIME: Iniciar polling de gastos cada 30 segundos
      // Solo actualiza si la pestaña está visible
      this.pollingService.poll(30000, () => {
        console.debug('[TripDetailComponent] Actualizando gastos (polling)');
        this.expenseStore.loadExpensesByTrip(this.tripId);
      });
    } else {
      // Fallback: obtener ID de paramMap (si resolver falla)
      this.tripId = this.route.snapshot.paramMap.get('id') || '';
      console.warn('No se recibieron datos del resolver, usando paramMap como fallback');
      
      if (this.tripId) {
        this.expenseStore.loadExpensesByTrip(this.tripId);

        // FASE 6 - REALTIME: Iniciar polling (fallback también)
        this.pollingService.poll(30000, () => {
          console.debug('[TripDetailComponent] Actualizando gastos (polling - fallback)');
          this.expenseStore.loadExpensesByTrip(this.tripId);
        });
      }
    }

    // Cargar otros datos (itinerario, votaciones, documentos)
    this.loadMockData();
  }

  ngOnDestroy(): void {
    // Limpieza de IntersectionObserver
    if (this.observer) {
      this.observer.disconnect();
    }

    // FASE 6 - REALTIME: Detener polling al destruir componente
    if (this.pollingService.isActive()) {
      this.pollingService.stop();
      console.debug('[TripDetailComponent] Polling detenido (componente destruido)');
    }
  }

  ngAfterViewInit(): void {
    // Inicializar IntersectionObserver para infinite scroll de gastos
    if (this.expenseScrollAnchor) {
      this._initializeExpenseScrollObserver();
    }
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Cambiar sección activa
   */
  switchSection(section: 'itinerary' | 'gallery' | 'voting' | 'documents' | 'expenses'): void {
    this.activeSection = section;
    this.mobileMenuOpen = false;

    // Scroll suave a la sección
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  /**
   * Cargar datos simulados (itinerario, votaciones, documentos)
   */
  loadMockData(): void {
    // Itinerario
    this.itineraryDays = [
      {
        date: new Date(2024, 5, 10),
        title: 'Día 1 - Llegada',
        description: 'Llegada a París',
        activities: [
          { icon: '✈️', title: 'Llegada al aeropuerto', time: '10:00 AM', location: 'CDG' },
          { icon: '🏨', title: 'Check-in hotel', time: '02:00 PM', location: 'Hotel Paris' }
        ]
      },
      {
        date: new Date(2024, 5, 11),
        title: 'Día 2 - Exploración',
        description: 'Tour por los monumentos',
        activities: [
          { icon: '🗼', title: 'Tour por la Torre Eiffel', time: '09:00 AM', location: 'Torre Eiffel' },
          { icon: '🍽️', title: 'Cena en el Sena', time: '07:00 PM', location: 'Crucero Sena' }
        ]
      }
    ];

    // Votaciones
    this.proposals = [
      {
        id: '1',
        title: 'Museo del Louvre',
        description: 'Visita al museo',
        options: [
          { label: 'Sí, ir', votes: 3, userVoted: true },
          { label: 'No, pasar', votes: 1, userVoted: false }
        ],
        totalVotes: 4
      },
      {
        id: '2',
        title: 'Castillos del Loire',
        description: 'Excursión de un día',
        options: [
          { label: 'Sí, ir', votes: 2, userVoted: false },
          { label: 'No, pasar', votes: 2, userVoted: false }
        ],
        totalVotes: 4
      }
    ];

    // Documentos
    this.documents = [
      {
        id: '1',
        name: 'Itinerario.pdf',
        type: 'pdf',
        uploadedBy: 'Juan Pérez',
        date: new Date(2024, 4, 1)
      },
      {
        id: '2',
        name: 'Presupuesto.xlsx',
        type: 'spreadsheet',
        uploadedBy: 'María García',
        date: new Date(2024, 4, 5)
      }
    ];
  }

  /**
   * Eliminar un gasto (Optimistic UI)
   */
  deleteExpense(expenseId: string): void {
    if (confirm('¿Eliminar este gasto?')) {
      const currentExpenses = this.expenses();
      const deletedExpense = currentExpenses.find(e => e.id === expenseId);

      // Optimistic UI: eliminar inmediatamente
      this.expenseStore.removeExpense(expenseId);
    }
  }

  /**
   * Inicializar IntersectionObserver para infinite scroll de gastos
   */
  private _initializeExpenseScrollObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.expenseLoading()) {
            // Intentar llamar loadMore si existe en el store
            const loadMore = (this.expenseStore as any).loadMore;
            if (typeof loadMore === 'function') {
              loadMore.call(this.expenseStore);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    if (this.expenseScrollAnchor) {
      this.observer.observe(this.expenseScrollAnchor.nativeElement);
    }
  }

  /**
   * Toggle menú móvil
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  /**
   * Descargar documento
   */
  downloadDocument(docId: string): void {
    console.log('Descargar documento:', docId);
    // Implementar descarga
  }

  /**
   * Votar en una propuesta
   */
  vote(proposalId: string, optionIndex: number): void {
    console.log('Votando:', proposalId, optionIndex);
    // Implementar votación
  }

  // ============================================================================
  // TRACKBY FUNCTIONS
  // ============================================================================

  /**
   * Formatea una fecha en formato DD-MM-YYYY
   */
  formatDate(date: Date | string): string {
    return this.dateFormatService.formatDisplayDate(date);
  }

  /**
   * Formatea el rango de fechas del viaje
   */
  formatTripDateRange(): string {
    const start = this.formatDate(this.tripStartDate());
    const end = this.formatDate(this.tripEndDate());
    return `${start} - ${end}`;
  }

  /**
   * TrackBy para lista de gastos
   */
  trackExpenseById(expense: ExpenseWithDetails): string {
    return expense.id;
  }
}
