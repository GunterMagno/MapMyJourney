import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-textarea.html',
  styleUrl: './form-textarea.scss',
})
export class FormTextareaComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() textareaId: string = '';
  @Input() rows: number = 4;
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
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    return 'Campo inválido';
  }
}

