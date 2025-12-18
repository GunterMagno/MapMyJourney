import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-select.html',
  styleUrl: './form-select.scss',
})
export class FormSelectComponent {
  @Input() label: string = '';
  @Input() selectId: string = '';
  @Input() placeholder: string = 'Selecciona una opción';
  @Input() options: SelectOption[] = [];
  @Input() control: FormControl | null = null;

  /**
   * Gets all validation errors from FormControl.
   */
  get errors(): any {
    return this.control?.errors || {};
  }

  /**
   * Checks if field has been touched.
   */
  get isTouched(): boolean {
    return this.control?.touched || false;
  }

  /**
   * Checks if field is invalid and has been touched or is dirty.
   */
  get isInvalid(): boolean {
    return !!this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }

  /**
   * Gets appropriate error message based on validation error type.
   */
  get errorMessage(): string {
    if (!this.control?.errors || !this.isTouched) {
      return '';
    }

    const errors = this.control.errors;
    if (errors['required']) return 'Este campo es requerido';
    
    return 'Campo inválido';
  }
}

