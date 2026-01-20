import { Injectable } from '@angular/core';
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

  constructor() {}

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000): void {
    // Evitar duplicados: Si ya existe un toast con el mismo mensaje, no hacer nada
    const currentToasts = this.toasts$.getValue();
    
    // Comparar mensajes normalizados (ignorar espacios extra y mayúsculas iniciales)
    const normalizedNewMessage = message.trim().toLowerCase();
    const isDuplicate = currentToasts.some(t => t.message.trim().toLowerCase() === normalizedNewMessage);
    
    if (isDuplicate) {
      return;
    }

    const id = `toast-${Date.now()}`;
    const toast: Toast = {
      id,
      message,
      type,
      duration
    };

    this.toasts$.next([...currentToasts, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 3000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 3000): void {
    this.show(message, 'warning', duration);
  }

  remove(id: string): void {
    const currentToasts = this.toasts$.getValue();
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts$.next([]);
  }
}
