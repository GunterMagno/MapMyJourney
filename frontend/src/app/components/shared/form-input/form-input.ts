import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-input.html',
  styleUrl: './form-input.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormInputComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() inputId: string = '';
  @Input() control: AbstractControl | null = null;
  @Input() parentForm: FormGroup | null = null;

  // Toggle password visibility
  isPasswordVisible: boolean = false;

  /**
   * Cast control to FormControl for template usage
   */
  get formControl(): FormControl {
    return this.control as FormControl;
  }
  
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
   * Also checks parent form errors (matchPassword)
   */
  get isInvalid(): boolean {
    const controlInvalid = !!this.control && this.control.invalid && (this.control.dirty || this.control.touched);
    
    // Check for matchPassword error on confirmPassword field
    if (this.inputId === 'confirmPassword' && this.parentForm?.hasError('matchPassword') && this.control?.touched) {
      return true;
    }
    
    return controlInvalid;
  }

  /**
   * Checks if field is valid (accounting for parent form errors)
   */
  get isValid(): boolean {
    if (!this.control || !this.control.value) {
      return false;
    }
    
    // If it's confirmPassword field, check matchPassword error
    if (this.inputId === 'confirmPassword' && this.parentForm?.hasError('matchPassword')) {
      return false;
    }
    
    return this.control.valid && !this.isInvalid;
  }

  /**
   * Gets appropriate error message based on validation error type.
   */
  get errorMessage(): string {
    if (!this.control?.errors || !this.isTouched) {
      // Check matchPassword error on form level
      if (this.inputId === 'confirmPassword' && this.parentForm?.hasError('matchPassword') && this.control?.touched) {
        return 'Las contraseñas no coinciden';
      }
      return '';
    }

    const errors = this.control.errors;
    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['min']) {
      return `Valor mínimo: ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `Valor máximo: ${errors['max'].max}`;
    }
    if (errors['pattern']) return 'Formato inválido';
    if (errors['passwordStrength']) return errors['passwordStrength'];
    if (errors['nif']) return errors['nif'];
    if (errors['emailTaken']) return 'Este email ya está registrado';
    if (errors['nifTaken']) return 'Este NIF ya está registrado';
    
    return 'Campo inválido';
  }

  /**
   * Toggle password visibility for password fields
   */
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}

