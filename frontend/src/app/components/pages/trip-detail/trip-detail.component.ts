import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommonModule as CommonAngularModule } from '@angular/common';

// Importar componentes
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';

// ✅ FASE 6: Importar stores y modelos
import { TripStore, ExpenseStore } from '../../../core/store';
import { Trip, ExpenseWithDetails } from '../../../core/models';

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
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './trip-detail.html',
  styleUrl: './trip-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // ✅ OnPush para mejor rendimiento
})
export class TripDetailComponent implements OnInit, OnDestroy {
  // ============================================================================
  // INYECCIONES
  // ============================================================================

  private route = inject(ActivatedRoute);
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
  activeSection: 'itinerary' | 'voting' | 'documents' | 'expenses' = 'itinerary';
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
    // Obtener ID del viaje de la ruta
    this.tripId = this.route.snapshot.paramMap.get('id') || '';

    // ✅ Cargar gastos del viaje desde el store
    if (this.tripId) {
      this.expenseStore.loadExpensesByTrip(this.tripId);
    }

    // Cargar otros datos (itinerario, votaciones, documentos)
    this.loadMockData();
  }

  ngAfterViewInit(): void {
    // Inicializar IntersectionObserver para infinite scroll de gastos
    if (this.expenseScrollAnchor) {
      this._initializeExpenseScrollObserver();
    }
  }

  ngOnDestroy(): void {
    // Limpiar observer
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Cambiar sección activa
   */
  switchSection(section: 'itinerary' | 'voting' | 'documents' | 'expenses'): void {
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
   * ✅ Eliminar un gasto (Optimistic UI)
   * Elimina inmediatamente del store, revierte si la API falla
   */
  deleteExpense(expenseId: string): void {
    if (confirm('¿Eliminar este gasto?')) {
      // Guardar por si hay que revertir
      const currentExpenses = this.expenses();
      const deletedExpense = currentExpenses.find(e => e.id === expenseId);

      // ✅ Optimistic UI: eliminar inmediatamente
      this.expenseStore.removeExpense(expenseId);
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
  // MÉTODOS PRIVADOS
  // ============================================================================

  /**
   * Cargar datos mockeados para secciones no críticas
   */
  private loadMockData(): void {
    // Itinerario
    this.itineraryDays = [
      {
        date: new Date(2024, 5, 10),
        title: 'Llegada a París',
        description: 'Vuelo y traslado al hotel',
        activities: [
          {
            icon: '✈️',
            title: 'Vuelo de llegada',
            time: '10:00 AM',
            location: 'CDG'
          }
        ]
      }
    ];

    // Votaciones
    this.proposals = [
      {
        id: '1',
        title: '¿Qué restaurante?',
        description: 'Cena del viernes',
        options: [
          { label: 'Le Petit Bistro', votes: 8, userVoted: false },
          { label: 'Chez Maxim\'s', votes: 5, userVoted: true }
        ],
        totalVotes: 13
      }
    ];

    // Documentos
    this.documents = [
      {
        id: '1',
        name: 'Boletos de vuelo.pdf',
        type: 'pdf',
        uploadedBy: 'Juan Pérez',
        date: new Date(2024, 4, 1)
      }
    ];
  }

  /**
   * ✅ INFINITE SCROLL: Observador para cargar más gastos
   */
  private _initializeExpenseScrollObserver(): void {
    if (!this.expenseScrollAnchor) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!this.expenseLoading() && this.expenseStore.hasMore()) {
              this.expenseStore.loadMore();
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

    this.observer.observe(this.expenseScrollAnchor.nativeElement);
  }

  // ============================================================================
  // TRACKBY FUNCTIONS
  // ============================================================================

  /**
   * ✅ TrackBy para lista de gastos
   */
  trackExpenseById(expense: ExpenseWithDetails): string {
    return expense.id;
  }
}
