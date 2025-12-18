import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, map, switchMap, catchError } from 'rxjs/operators';

/**
 * Custom synchronous validators for FASE 3: Advanced Reactive Forms
 */
export class CustomValidators {
  /**
   * Validates password strength.
   * Requirements: At least 1 uppercase, 1 lowercase, 1 number, 1 special character, min 8 chars
   */
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null; // Don't validate empty values
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isLongEnough = value.length >= 8;

      const passwordValid =
        hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isLongEnough;

      if (!passwordValid) {
        const requirements = [];
        if (!hasUpperCase) requirements.push('mayúscula');
        if (!hasLowerCase) requirements.push('minúscula');
        if (!hasNumeric) requirements.push('número');
        if (!hasSpecialChar) requirements.push('carácter especial');
        if (!isLongEnough) requirements.push('mínimo 8 caracteres');

        return {
          passwordStrength: `Contraseña debe incluir: ${requirements.join(', ')}`
        };
      }

      return null;
    };
  }

  /**
   * Validates Spanish NIF (Número de Identificación Fiscal)
   * Format: 8 digits + 1 letter (with optional spaces and hyphens)
   */
  static nif(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let value = control.value;

      if (!value) {
        return null;
      }

      // Remove spaces and hyphens, convert to uppercase
      value = value.replace(/[\s\-]/g, '').toUpperCase();

      // Check format: 8 digits + 1 letter
      const nifRegex = /^[0-9]{8}[A-Z]$/;
      if (!nifRegex.test(value)) {
        return { nif: 'NIF debe tener formato: 8 dígitos + 1 letra (ej: 12345678Z)' };
      }

      // Validate with mod 23 algorithm
      const nifsLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
      const dniNumber = parseInt(value.substring(0, 8), 10);
      const expectedLetter = nifsLetters[dniNumber % 23];
      const providedLetter = value.charAt(8);

      if (expectedLetter !== providedLetter) {
        return { nif: 'Letra del NIF no válida según el algoritmo' };
      }

      return null;
    };
  }

  /**
   * Cross-field validator: Confirms password matches password field
   */
  static matchPassword(passwordField: string, confirmField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Get the form controls
      const passwordControl = control.get(passwordField);
      const confirmControl = control.get(confirmField);

      if (!passwordControl || !confirmControl) {
        return null;
      }

      // Only validate if both fields have values
      if (!passwordControl.value || !confirmControl.value) {
        return null;
      }

      // Check if passwords match
      if (passwordControl.value !== confirmControl.value) {
        return { matchPassword: true };
      }

      return null;
    };
  }

  /**
   * Cross-field validator: Validates date range (endDate >= startDate)
   */
  static dateRangeValidator(startField: string, endField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control.parent;
      if (!form) {
        return null;
      }

      const startControl = form.get(startField);
      const endControl = form.get(endField);

      if (!startControl || !endControl) {
        return null;
      }

      const startDate = new Date(startControl.value);
      const endDate = new Date(endControl.value);

      if (endDate < startDate) {
        endControl.setErrors({ ...endControl.errors, dateRange: true });
        return null;
      }

      // Remove the error if dates are valid
      if (endControl.errors) {
        delete endControl.errors['dateRange'];
        if (Object.keys(endControl.errors).length === 0) {
          endControl.setErrors(null);
        }
      }

      return null;
    };
  }

  /**
   * Async validator: Simulates checking if email already exists
   * Replace with actual HTTP call to backend
   */
  static uniqueEmail(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      // Simulates HTTP request with debounce to avoid excessive calls
      return of(control.value).pipe(
        debounceTime(500),
        switchMap(email => {
          // TODO: Replace with actual HTTP POST to backend
          // Example: this.http.post('/api/auth/check-email', { email })
          
          // Mock data: these emails are "taken"
          const takenEmails = ['admin@test.com', 'user@test.com', 'test@test.com'];
          
          if (takenEmails.includes(email.toLowerCase())) {
            return of({ emailTaken: true });
          }
          return of(null);
        }),
        catchError(() => of(null))
      );
    };
  }

  /**
   * Async validator: Simulates checking if NIF already exists
   */
  static uniqueNif(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        switchMap(nif => {
          // TODO: Replace with actual HTTP POST to backend
          // Valid NIFs: 12345678M, 87654321G
          const takenNifs = ['12345678M', '87654321G'];
          
          if (takenNifs.includes(nif.toUpperCase())) {
            return of({ nifTaken: true });
          }
          return of(null);
        }),
        catchError(() => of(null))
      );
    };
  }
}
