import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() message: string = '';
  @Input() closeable: boolean = true;

  isVisible: boolean = true;

  closeAlert(): void {
    this.isVisible = false;
  }

  get alertClasses(): string {
    return `alert alert--${this.type}`;
  }
}
