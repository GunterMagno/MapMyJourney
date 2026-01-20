import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewportScroller } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal';
import { TabsComponent, TabItem } from '../../shared/tabs/tabs';
import { TooltipComponent } from '../../shared/tooltip/tooltip';
import { ButtonComponent } from '../../shared/button/button';
import { AccordionComponent, AccordionItem } from '../../shared/accordion/accordion';
import { DynamicContentComponent } from '../../shared/dynamic-content/dynamic-content';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { CommunicationService } from '../../../services/communication.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../services/loading.service';
import { Router } from '@angular/router';

/**
 * Demo component showcasing all phases of MapMyJourney development
 * - FASE 1: DOM and Events (Modal, Tabs, Tooltips, Accordion, Dynamic Content)
 * - FASE 2: Services (Toast, Loading, Communication)
 * - FASE 3: Reactive Forms (Login, Signup with validation)
 * - FASE 4: Routing and Navigation (Guards, Resolvers, Breadcrumbs)
 * - FASE 5: HTTP Services (Real API integration with JWT)
 * - FASE 6: State Management and Dynamic Updates (Signals, Computed Signals, Infinite Scroll)
 */
@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    TabsComponent,
    TooltipComponent,
    ButtonComponent,
    AccordionComponent,
    DynamicContentComponent,
    HeaderComponent,
    FooterComponent,
    BreadcrumbComponent
  ],
  templateUrl: './demo-page.html',
  styleUrl: './demo-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoPageComponent implements OnInit, AfterViewInit, OnDestroy {
  tabItems: TabItem[] = [];
  accordionItems: AccordionItem[] = [];
  
  // Loading states
  isSaving = false;
  isCreating = false;
  isDeleting = false;

  // Active section tracking
  activeSection = signal<string>('fase1');
  private observer?: IntersectionObserver;

  constructor(
    private viewportScroller: ViewportScroller,
    private cdr: ChangeDetectorRef,
    private communicationService: CommunicationService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  scrollToSection(sectionId: string): void {
    this.activeSection.set(sectionId);
    this.viewportScroller.scrollToAnchor(sectionId);
  }

  ngOnInit(): void {
    this.initializeTabs();
    this.initializeAccordion();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id && id.startsWith('fase')) {
            this.activeSection.set(id);
            this.cdr.markForCheck();
          }
        }
      });
    }, options);

    // Observe all phase headers
    const phases = ['fase1', 'fase2', 'fase3', 'fase4', 'fase5', 'fase6'];
    phases.forEach(phaseId => {
      const element = document.getElementById(phaseId);
      if (element) {
        this.observer!.observe(element);
      }
    });
  }

  private initializeTabs(): void {
    this.tabItems = [
      {
        id: 'tab1',
        label: 'Modal Demo',
        content: 'Usa el botón abajo para abrir un modal con ESC'
      },
      {
        id: 'tab2',
        label: 'Tooltips Demo',
        content: 'Hovera los botones para ver tooltips en diferentes posiciones'
      },
      {
        id: 'tab3',
        label: 'Toast Demo',
        content: 'Muestra notificaciones que se auto-cierran'
      }
    ];
  }

  private initializeAccordion(): void {
    this.accordionItems = [
      {
        id: 'accordion-1',
        title: 'Funcionalidades de FASE 1',
        content: 'DOM Manipulation con ViewChild y ElementRef, Event Binding, @HostListener para teclado y mouse, Renderer2 para operaciones seguras'
      },
      {
        id: 'accordion-2',
        title: 'Funcionalidades de FASE 2',
        content: 'Servicios de comunicación, Observable/Subject para estado reactivo, ToastService, LoadingService, ThemeService con persistencia'
      },
      {
        id: 'accordion-3',
        title: 'Funcionalidades de FASE 3',
        content: 'Reactive Forms con FormBuilder, Validadores síncronos y asincronos, FormArray dinámico, Cross-field validation, Feedback visual completo'
      }
    ];
  }

  openModal(): void {
    this.communicationService.openModal('demo-modal');
  }

  closeModal(): void {
    this.communicationService.closeModal();
  }

  showSuccessToast(): void {
    this.toastService.success('¡Operación completada exitosamente!');
  }

  showErrorToast(): void {
    this.toastService.error('Algo salió mal. Intenta de nuevo.');
  }

  showWarningToast(): void {
    this.toastService.warning('Cuidado: Esta acción no se puede deshacer.');
  }

  showInfoToast(): void {
    this.toastService.info('Información: Aquí hay un mensaje informativo.');
  }

  // Loading button handlers
  handleSave(): void {
    this.isSaving = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.isSaving = false;
      this.cdr.markForCheck();
      this.toastService.success('¡Cambios guardados correctamente!');
    }, 2000);
  }

  handleCreate(): void {
    this.isCreating = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.isCreating = false;
      this.cdr.markForCheck();
      this.toastService.success('¡Elemento creado exitosamente!');
    }, 2000);
  }

  handleDelete(): void {
    this.isDeleting = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.isDeleting = false;
      this.cdr.markForCheck();
      this.toastService.success('¡Elemento eliminado correctamente!');
    }, 2000);
  }

  // Simulate page loading
  async simulatePageLoad(): Promise<void> {
    await this.loadingService.simulateLoading(2000);
    this.toastService.info('¡Página cargada completamente!');
  }

  /**
   * Navigate to login form
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigate to signup form
   */
  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  /**
   * Navigate to user profile (FASE 4)
   */
  goToProfile(): void {
    // First, set user as logged in for demo
    localStorage.setItem('auth_token', 'demo_token');
    localStorage.setItem('current_user', JSON.stringify({
      id: '1',
      name: 'Usuario Demo',
      email: 'demo@example.com',
      role: 'USER'
    }));
    this.router.navigate(['/usuario/perfil']);
  }

  /**
   * Navigate to user itinerary (FASE 4)
   */
  goToItinerary(): void {
    // First, set user as logged in for demo
    localStorage.setItem('auth_token', 'demo_token');
    localStorage.setItem('current_user', JSON.stringify({
      id: '1',
      name: 'Usuario Demo',
      email: 'demo@example.com',
      role: 'USER'
    }));
    this.router.navigate(['/usuario/itinerario']);
  }

  /**
   * Simulate getting trips from API (FASE 5)
   */
  simulateGetTrips(): void {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.toastService.success('Viajes obtenidos: Barcelona, Machu Picchu, Safari');
    }, 1500);
  }

  /**
   * Simulate creating a trip via API (FASE 5)
   */
  simulateCreateTrip(): void {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.toastService.success('Viaje "Venecia" creado exitosamente');
    }, 1500);
  }

  /**
   * Simulate getting expenses from API (FASE 5)
   */
  simulateGetExpenses(): void {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.toastService.success('Gastos obtenidos: $450 Hospedaje, $120 Comida, $80 Transporte');
    }, 1500);
  }

  /**
   * Simulate 401 Unauthorized error (FASE 5)
   */
  simulateError401(): void {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.toastService.error('Error 401: Sesión expirada. Por favor, inicia sesión nuevamente.');
    }, 1500);
  }

  /**
   * Simulate 404 Not Found error (FASE 5)
   */
  simulateError404(): void {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.toastService.error('Error 404: Recurso no encontrado.');
    }, 1500);
  }

  /**
   * Simulate 500 Server error (FASE 5)
   */
  simulateError500(): void {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.toastService.error('Error 500: Problema en el servidor. Intenta más tarde.');
    }, 1500);
  }

  /**
   * Show model structure information (FASE 5)
   */
  showModelStructure(): void {
    this.toastService.info(
      'Modelos tipados: User, Trip, Expense, ApiPaginatedResponse<T>. ' +
      'Ver /docs/frontend/fase5-http.md para detalles completos.'
    );
  }

  /**
   * Navigate to Trips page - demonstrates Signals, Infinite Scroll (FASE 6)
   */
  goToTrips(): void {
    this.router.navigate(['/trips']);
    this.toastService.success('Abriendo Mis Viajes - Demostración de Signals + Infinite Scroll');
  }

  /**
   * Navigate to Trip detail - demonstrates Computed Signals (FASE 6)
   */
  goToTrip(tripId: number): void {
    this.router.navigate(['/trip', tripId]);
    this.toastService.success('Abriendo Detalles del Viaje - Demostración de Computed Signals (totalBudgetUsed, expensesByCategory, etc)');
  }

  /**
   * Show Phase 6 documentation (FASE 6)
   */
  showPhase6Docs(): void {
    this.toastService.info(
      'FASE 6 Documentación: /docs/frontend/state_management.md (oficial) + ' +
      '/.oculto/resumen_fase6.md (técnica). ' +
      'Stores: TripStore (signal-based), ExpenseStore (computed signals), SearchStore (debounce).'
    );
  }
}
