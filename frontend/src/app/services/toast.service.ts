import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // milliseconds, undefined = no auto-close
  dismissible?: boolean;
}

/**
 * Singleton service for managing toast notifications across the app.
 * Emits toast events that are consumed by ToastComponent.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toast$ = this.toastSubject.asObservable();

  private dismissSubject = new Subject<string>();
  public dismiss$ = this.dismissSubject.asObservable();

  constructor() {}

  /**
   * Shows a success toast.
   */
  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Shows an error toast.
   */
  error(message: string, duration: number = 4000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Shows a warning toast.
   */
  warning(message: string, duration: number = 3500): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Shows an info toast.
   */
  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Shows a custom toast.
   */
  show(message: string, type: ToastType = 'info', duration: number = 3000): void {
    const id = this.generateId();
    const toast: Toast = {
      id,
      message,
      type,
      duration,
      dismissible: true
    };
    this.toastSubject.next(toast);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismissSubject.next(id);
      }, duration);
    }
  }

  /**
   * Manually dismiss a toast by ID.
   */
  dismiss(id: string): void {
    this.dismissSubject.next(id);
  }

  /**
   * Generates unique toast ID.
   */
  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
