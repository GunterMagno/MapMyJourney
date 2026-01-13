import { Component, OnInit, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Importar componentes compartidos
import { ButtonComponent } from '../../shared/button/button';
import { FormInputComponent } from '../../shared/form-input/form-input';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    FormInputComponent
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  activeTab: 'login' | 'register' = 'login';
  isLoading = false;

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  /**
   * Inicializa los formularios de login y registro
   */
  private initializeForms(): void {
    // Formulario de Login
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Formulario de Registro
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Cambia entre pestañas de login y registro
   */
  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
  }

  /**
   * Maneja el envío del formulario de login
   */
  onLogin(): void {
    console.log('Login form valid:', this.loginForm.valid);
    console.log('Login form value:', this.loginForm.value);
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      console.log('Attempting login with:', email);
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastService.success('¡Bienvenido de vuelta!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          const message = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
          this.toastService.error(message);
        }
      });
    }
  }

  /**
   * Maneja el envío del formulario de registro
   */
  onRegister(): void {
    console.log('Register form valid:', this.registerForm.valid);
    console.log('Register form value:', this.registerForm.value);
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      const { fullName, email, password } = this.registerForm.value;
      console.log('Attempting registration with:', email);
      
      this.authService.signup(fullName, email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastService.success('¡Cuenta creada exitosamente!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          const message = error.error?.message || 'Error en el registro. Intenta de nuevo.';
          this.toastService.error(message);
        }
      });
    }
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
