import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormInputComponent } from '../../shared/form-input/form-input';
import { FormCheckboxComponent } from '../../shared/form-checkbox/form-checkbox';
import { ButtonComponent } from '../../shared/button/button';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { LoadingService } from '../../../services/loading.service';

/**
 * Login form component - FASE 3: Advanced Reactive Forms
 * Features:
 * - FormBuilder with validation
 * - Email validation (built-in)
 * - Password field
 * - Remember me checkbox
 * - Async login submission
 * - Error handling with ToastService
 * - Loading state from LoadingService
 */
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormInputComponent,
    FormCheckboxComponent,
    ButtonComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss'
})
export class LoginFormComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.email]
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(8)]
      ],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.toastService.error('Por favor completa el formulario correctamente');
      return;
    }

    this.isSubmitting = true;
    this.loadingService.show();

    const { email, password, rememberMe } = this.loginForm.value;
    
    // Debug: verificar que los valores no sean nulos
    console.log('Login attempt - Email:', email, 'Password:', password);

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.loadingService.hide();
        this.toastService.success('¡Bienvenido!');

        if (rememberMe) {
          localStorage.setItem('rememberMe', email);
        }

        this.router.navigate(['/trips']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.loadingService.hide();
        this.toastService.error(error.message || 'Error al iniciar sesión');
      }
    });
  }

  get emailControl() {
    return this.loginForm.get('email') as FormControl;
  }

  get passwordControl() {
    return this.loginForm.get('password') as FormControl;
  }

  get rememberMeControl() {
    return this.loginForm.get('rememberMe') as FormControl;
  }
}
