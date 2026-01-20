import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div [class]="'toast toast--' + toast.type">
          <div class="toast__content">
            <div class="toast__message">{{ toast.message }}</div>
          </div>
          <button class="toast__close" (click)="toastService.remove(toast.id)">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--spacing-4, 1.5rem);
      right: var(--spacing-4, 1.5rem);
      z-index: 9999;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: white;
      border-radius: 8px;
      padding: var(--spacing-3, 1rem);
      margin-bottom: var(--spacing-2, 0.75rem);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      min-width: 300px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast--success {
      border-left: 4px solid #4caf50;
      background: linear-gradient(to right, rgba(76, 175, 80, 0.05), white);
    }

    .toast--error {
      border-left: 4px solid #f44336;
      background: linear-gradient(to right, rgba(244, 67, 54, 0.05), white);
    }

    .toast--info {
      border-left: 4px solid #2196f3;
      background: linear-gradient(to right, rgba(33, 150, 243, 0.05), white);
    }

    .toast--warning {
      border-left: 4px solid #ff9800;
      background: linear-gradient(to right, rgba(255, 152, 0, 0.05), white);
    }

    .toast__content {
      flex: 1;
      margin-right: var(--spacing-2, 0.75rem);
    }

    .toast__message {
      color: #333;
      font-size: 14px;
      line-height: 1.5;
    }

    .toast--success .toast__message {
      color: #2e7d32;
    }

    .toast--error .toast__message {
      color: #c62828;
    }

    .toast--info .toast__message {
      color: #1565c0;
    }

    .toast--warning .toast__message {
      color: #e65100;
    }

    .toast__close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: #999;
      transition: color 0.2s;
      flex-shrink: 0;
    }

    .toast__close:hover {
      color: #333;
    }

    .toast__close svg {
      width: 100%;
      height: 100%;
    }
  `]
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(public toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.getToasts().subscribe((toasts: Toast[]) => {
      this.toasts = toasts;
    });
  }
}
