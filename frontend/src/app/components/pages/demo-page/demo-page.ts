import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal';
import { TabsComponent, TabItem } from '../../shared/tabs/tabs';
import { TooltipComponent } from '../../shared/tooltip/tooltip';
import { ButtonComponent } from '../../shared/button/button';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';
import { CommunicationService } from '../../../services/communication.service';
import { ToastService } from '../../../services/toast.service';
import { LoadingService } from '../../../services/loading.service';

/**
 * Demo component showcasing FASE 1: DOM and Events
 * Features interactive components: Modal, Tabs, Tooltips
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
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './demo-page.html',
  styleUrl: './demo-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoPageComponent implements OnInit {
  tabItems: TabItem[] = [];
  
  // Loading states
  isSaving = false;
  isCreating = false;
  isDeleting = false;

  constructor(
    private communicationService: CommunicationService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeTabs();
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
}
