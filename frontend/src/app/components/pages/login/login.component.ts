import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Importar componentes compartidos
import { ButtonComponent } from '../../shared/button/button';
import { FormInputComponent } from '../../shared/form-input/form-input';

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
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  activeTab: 'login' | 'register' = 'login';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
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
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      console.log('Login attempt with:', credentials);
      
      // TODO: Llamar al servicio de autenticación
      // this.authService.login(credentials).subscribe(...)
      
      // Redireccionar al dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Maneja el envío del formulario de registro
   */
  onRegister(): void {
    if (this.registerForm.valid) {
      const userData = this.registerForm.value;
      console.log('Register attempt with:', userData);
      
      // TODO: Llamar al servicio de autenticación
      // this.authService.register(userData).subscribe(...)
      
      // Redirecccionar al dashboard
      this.router.navigate(['/dashboard']);
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
