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
import { ToastService } from '../../../services/toast.service';
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
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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
          this.router.navigate(['/']);
          this.isSubmitting = false;
        },
        error: (err) => {
          this.toastService.error('Error en el registro. Intenta de nuevo.');
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

