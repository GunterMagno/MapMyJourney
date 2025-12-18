import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationService } from '../../../services/communication.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Modal component with secure DOM manipulation using Renderer2.
 * Features:
 * - Close on ESC key (HostListener)
 * - Close on backdrop click (event binding)
 * - Safe element creation/deletion via Renderer2
 * - Communication with CommunicationService for Unidirectional Data Flow
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() isDismissible: boolean = true;
  @ViewChild('modalContent') modalContent!: ElementRef;
  @ViewChild('backdrop') backdrop!: ElementRef;

  isOpen = false;
  private destroy$ = new Subject<void>();
  private keydownUnsubscribe: (() => void) | null = null;

  constructor(
    private communicationService: CommunicationService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {
    // ESC key listener is now handled by @HostListener
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isDismissible && this.isOpen) {
      this.closeModal();
    }
  }

  ngOnInit(): void {
    // Listen to modal events from CommunicationService
    this.communicationService.modal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event.type === 'close') {
          this.closeModal();
        } else if (event.type !== 'close') {
          // Any non-close event opens the modal
          this.openModal();
        }
      });
  }

  /**
   * Opens modal with secure DOM manipulation.
   */
  openModal(): void {
    this.isOpen = true;
    // Prevent body scroll when modal is open
    if (typeof window !== 'undefined') {
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
    }
  }

  /**
   * Closes modal and restores scroll.
   */
  closeModal(): void {
    this.isOpen = false;
    if (typeof window !== 'undefined') {
      this.renderer.removeStyle(document.body, 'overflow');
    }
  }

  /**
   * Handles backdrop click to close modal.
   */
  onBackdropClick(): void {
    if (this.isDismissible) {
      this.closeModal();
    }
  }

  /**
   * Prevents modal content clicks from closing modal.
   */
  onModalContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
