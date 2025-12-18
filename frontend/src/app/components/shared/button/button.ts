import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class ButtonComponent {
  @Input() label: string = 'Button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() loadingText: string = 'Cargando...';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  get buttonClasses(): string {
    const classes = ['button', `button--${this.variant}`, `button--${this.size}`];
    if (this.disabled || this.loading) {
      classes.push('button--disabled');
    }
    if (this.loading) {
      classes.push('button--loading');
    }
    return classes.join(' ');
  }

  get displayLabel(): string {
    return this.loading ? this.loadingText : this.label;
  }
}
