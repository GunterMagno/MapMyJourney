import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray
} from '@angular/forms';
import { FormInputComponent } from '../../shared/form-input/form-input';
import { ButtonComponent } from '../../shared/button/button';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { TripService } from '../../../services/trip.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomValidators } from '../../../services/custom-validators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Signup form component with advanced Reactive Forms.
 * FASE 3: Advanced Reactive Forms with:
 * - FormBuilder and strong typing
 * - Synchronous validators (required, email, patterns, custom)
 * - Asynchronous validators (uniqueEmail, uniqueNif)
 * - Cross-field validation (password match)
 * - Dynamic FormArray for phone numbers
 * - Proper error feedback
 */
@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormInputComponent,
    ButtonComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss'
})
export class SignupFormComponent implements OnInit, OnDestroy {
  @ViewChild('formElement') formElement!: ElementRef;

  signupForm!: FormGroup;
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tripService: TripService,
    private toastService: ToastService,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initializes the signup form with all validators.
   */
  private initializeForm(): void {
    this.signupForm = this.fb.group(
      {
        // Basic info - synchronous validators
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50)
          ]
        ],
        email: [
          '',
          {
            validators: [Validators.required, Validators.email],
            asyncValidators: [CustomValidators.uniqueEmail()],
            updateOn: 'blur'
          }
        ],

        // Passwords - with custom validator and cross-field validator
        password: [
          '',
          [Validators.required, CustomValidators.passwordStrength()]
        ],
        confirmPassword: [
          '',
          [Validators.required, CustomValidators.passwordStrength()]
        ],

        // Optional: Terms acceptance
        acceptTerms: [false, Validators.requiredTrue],

        // Optional: Bio
        bio: [
          '',
          [Validators.maxLength(500)]
        ],

        // FormArray: Dynamic phone numbers
        phoneNumbers: this.fb.array([
          this.createPhoneControl()
        ])
      },
      {
        validators: [
          // Cross-field validators
          CustomValidators.matchPassword('password', 'confirmPassword')
        ]
      }
    );
  }

  /**
   * Creates a single phone control for FormArray.
   */
  private createPhoneControl() {
    return this.fb.group({
      phone: ['', [
        Validators.pattern(/^[+]?[0-9\s\-\(\)]{9,15}$/)
      ]]
    });
  }

  /**
   * Gets the phone numbers FormArray.
   */
  get phoneNumbers(): FormArray {
    return this.signupForm.get('phoneNumbers') as FormArray;
  }

  /**
   * Adds a new phone number field to the FormArray.
   */
  addPhoneNumber(): void {
    this.phoneNumbers.push(this.createPhoneControl());
  }

  /**
   * Removes a phone number field from the FormArray.
   */
  removePhoneNumber(index: number): void {
    if (this.phoneNumbers.length > 0) {
      this.phoneNumbers.removeAt(index);
    }
  }

  /**
   * Handles form submission.
   * Shows loading state, validates form, and calls AuthService.
   * 
   * Después del registro + login exitoso:
   * 1. Verifica si existe un viaje en borrador en sessionStorage
   * 2. Si existe: Crea el viaje y borra del storage
   * 3. Navega al viaje creado o a /trips
   */
  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.toastService.error('Por favor completa el formulario correctamente');
      this.markFormGroupTouched(this.signupForm);
      return;
    }

    this.isSubmitting = true;
    const formValue = this.signupForm.getRawValue();

    this.authService.signup(formValue.name, formValue.email, formValue.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.toastService.success('Registro exitoso. ¡Bienvenido!');
          
          // Verificar si existe un viaje guardado como borrador
          const guestTrip = this.tripService.getGuestTrip();
          
          if (guestTrip) {
            // Crear el viaje con los datos guardados
            this.tripService.createTrip(guestTrip)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (createdTrip) => {
                  // Borrar el borrador del storage
                  this.tripService.clearGuestTrip();
                  this.toastService.success('✓ Tu viaje ha sido creado');
                  
                  // Navegar al viaje creado
                  this.router.navigate(['/trips', createdTrip.id]);
                  this.isSubmitting = false;
                },
                error: (error) => {
                  console.error('Error creating trip:', error);
                  this.toastService.error('Error al crear el viaje. Intenta de nuevo.');
                  this.isSubmitting = false;
                  // Aún así navega a /trips (el borrador sigue guardado)
                  this.router.navigate(['/trips']);
                }
              });
          } else {
            // No hay viaje en borrador, solo navega a /trips
            this.router.navigate(['/trips']);
            this.isSubmitting = false;
          }
        },
        error: (err) => {
          console.warn('=== SIGNUP ERROR HANDLER TRIGGERED ===');
          console.error('Full error object:', err);
          console.warn('Error extracted message:', err.error?.message);
          const message = err.error?.message || err.message || 'Error en el registro. Intenta de nuevo.';
          console.warn('Toast message to show:', message);
          this.toastService.error(message);
          console.warn('Toast.error() called');
          this.isSubmitting = false;
        }
      });
  }

  /**
   * Marks all controls as touched to show validation errors.
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Toggles password visibility.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggles confirm password visibility.
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Checks if form is ready for submission.
   */
  get canSubmit(): boolean {
    return this.signupForm.valid && !this.isSubmitting;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

