import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-input.html',
  styleUrl: './form-input.scss',
})
export class FormInputComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() inputId: string = '';
  @Input() required: boolean = false;
  @Input() hasError: boolean = false;
  @Input() errorMessage: string = '';

  isValid: boolean = false;

  onInput(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (this.type === 'email') {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.isValid = emailRegex.test(value) && value.length > 0;
    } else if (this.required) {
      this.isValid = value.length > 0;
    }
  }
}
