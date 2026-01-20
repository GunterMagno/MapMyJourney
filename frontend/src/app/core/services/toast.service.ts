import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private timeoutMap = new Map<string, any>();

  constructor(private ngZone: NgZone) {}

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = {
      id,
      message,
      type,
      duration
    };

    const currentToasts = this.toasts$.getValue();
    this.toasts$.next([...currentToasts, toast]);

    // Auto-remove after duration (FUERA de Angular para mayor control)
    if (duration > 0) {
      this.ngZone.runOutsideAngular(() => {
        const timeoutId = setTimeout(() => {
          this.ngZone.run(() => {
            this.remove(id);
          });
        }, duration);
        
        this.timeoutMap.set(id, timeoutId);
      });
    }
  }

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  remove(id: string): void {
    // Limpiar timeout si existe
    const timeoutId = this.timeoutMap.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutMap.delete(id);
    }

    const currentToasts = this.toasts$.getValue();
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  clear(): void {
    // Limpiar todos los timeouts
    this.timeoutMap.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeoutMap.clear();
    this.toasts$.next([]);
  }
}

