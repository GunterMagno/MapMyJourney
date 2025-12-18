import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal';
import { TabsComponent, TabItem } from '../../shared/tabs/tabs';
import { TooltipComponent } from '../../shared/tooltip/tooltip';
import { ButtonComponent } from '../../shared/button/button';
import { CommunicationService } from '../../../services/communication.service';
import { ToastService } from '../../../services/toast.service';

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
    ButtonComponent
  ],
  templateUrl: './demo-page.html',
  styleUrl: './demo-page.scss'
})
export class DemoPageComponent implements OnInit {
  tabItems: TabItem[] = [];

  constructor(
    private communicationService: CommunicationService,
    private toastService: ToastService
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
}
