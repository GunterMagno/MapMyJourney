import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Toast notification component.
 * Features:
 * - Auto-dismisses based on duration set in ToastService
 * - Secure DOM manipulation with Renderer2
 * - Unidirectional Data Flow: subscribes to ToastService
 * - Displays success, error, warning, info notifications
 * - FASE 2: Services and RxJS implementation
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class ToastComponent implements OnInit, OnDestroy {
  @ViewChild('toastContainer') toastContainer!: ElementRef;

  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private toastService: ToastService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Subscribe to new toast events
    this.toastService.toast$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toast => {
        this.addToast(toast);
      });

    // Subscribe to dismiss events
    this.toastService.dismiss$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toastId => {
        this.removeToast(toastId);
      });
  }

  /**
   * Adds a toast to the list.
   */
  addToast(toast: Toast): void {
    this.toasts.push(toast);
  }

  /**
   * Removes a toast by ID.
   */
  removeToast(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  /**
   * Manually dismiss a toast.
   */
  dismissToast(id: string): void {
    this.toastService.dismiss(id);
  }

  /**
   * Gets CSS class for toast type.
   */
  getToastClass(toast: Toast): string {
    return `toast toast--${toast.type}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
