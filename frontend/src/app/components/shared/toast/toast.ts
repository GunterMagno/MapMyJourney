import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Toast notification component.
 * Features:
 * - Auto-dismisses based on duration set in ToastService
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
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    // Subscribe to toast list from service
    this.toastService.getToasts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(toasts => {
        this.toasts = toasts;
      });
  }

  /**
   * Removes a toast by ID.
   */
  removeToast(id: string): void {
    this.toastService.remove(id);
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
