import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FormComponent } from '../../../core/guards/pending-changes.guard';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Validador personalizado para confirmar contraseñas
 */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword');
  const newPasswordConfirm = control.get('newPasswordConfirm');

  if (!newPassword || !newPasswordConfirm) {
    return null;
  }

  return newPassword.value === newPasswordConfirm.value ? null : { passwordMismatch: true };
}

/**
 * UserProfileComponent - Página de perfil del usuario
 *
 * Forma editable para el perfil del usuario. Implementa FormComponent
 * para que el pendingChangesGuard pueda verificar cambios sin guardar.
 * 
 * Funcionalidades:
 * - Carga datos reales del usuario autenticado
 * - Permite editar nombre y email
 * - Permite cambiar contraseña (requiere contraseña actual y confirmación)
 * - Sección de avatar con modal para seleccionar foto de perfil
 * - Guarda cambios en el backend
 * - Actualiza el estado en AuthService tras cambios exitosos
 */
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <article class="profile">
      <h2 class="profile__title">Mi Perfil</h2>

      <!-- SECCIÓN DE AVATAR -->
      <section class="profile__avatar-section">
        <div class="profile__avatar-container">
          <div class="profile__avatar">
            <img [src]="getAvatarUrl()" alt="Avatar" class="profile__avatar-image" />
          </div>
          <button
            type="button"
            class="profile__avatar-button"
            (click)="openAvatarModal()"
          >
            🎨 Cambiar Foto
          </button>
        </div>
      </section>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="profile__form">
        <!-- DATOS BÁSICOS -->
        <section class="profile__section">
          <h3 class="profile__section-title">Datos Básicos</h3>
          
          <div class="profile__field">
            <label class="profile__label" for="name">Nombre Completo</label>
            <input
              id="name"
              class="profile__input"
              type="text"
              formControlName="name"
              placeholder="Tu nombre"
              [disabled]="isSubmitting"
            />
            <span *ngIf="isNameInvalid" class="profile__error">
              Por favor ingresa un nombre válido (2-20 caracteres)
            </span>
          </div>

          <div class="profile__field">
            <label class="profile__label" for="email">Email</label>
            <input
              id="email"
              class="profile__input"
              type="email"
              formControlName="email"
              placeholder="tu@email.com"
              [disabled]="isSubmitting"
            />
            <span *ngIf="isEmailInvalid" class="profile__error">
              Por favor ingresa un email válido
            </span>
          </div>
        </section>

        <!-- CAMBIAR CONTRASEÑA -->
        <section class="profile__section profile__section--password">
          <h3 class="profile__section-title">Cambiar Contraseña</h3>
          <p class="profile__section-hint">Déjalo en blanco si no deseas cambiar la contraseña</p>
          
          <div class="profile__field">
            <label class="profile__label" for="currentPassword">Contraseña Actual</label>
            <div class="profile__password-wrapper">
              <input
                id="currentPassword"
                class="profile__input"
                [type]="showCurrentPassword ? 'text' : 'password'"
                formControlName="currentPassword"
                placeholder="Tu contraseña actual"
                [disabled]="isSubmitting"
              />
              <button
                type="button"
                class="profile__password-toggle"
                (click)="togglePasswordVisibility('current')"
                [attr.aria-label]="showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                [disabled]="isSubmitting"
              >
                @if (showCurrentPassword) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                }
              </button>
            </div>
            <span *ngIf="form.get('newPassword')?.value && !form.get('currentPassword')?.value" class="profile__error">
              Debes proporcionar tu contraseña actual para cambiarla
            </span>
          </div>

          <div class="profile__field">
            <label class="profile__label" for="newPassword">Nueva Contraseña</label>
            <div class="profile__password-wrapper">
              <input
                id="newPassword"
                class="profile__input"
                [type]="showNewPassword ? 'text' : 'password'"
                formControlName="newPassword"
                placeholder="Nueva contraseña (mín. 8 caracteres)"
                [disabled]="isSubmitting"
              />
              <button
                type="button"
                class="profile__password-toggle"
                (click)="togglePasswordVisibility('new')"
                [attr.aria-label]="showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                [disabled]="isSubmitting"
              >
                @if (showNewPassword) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                }
              </button>
            </div>
            <span *ngIf="form.get('newPassword')?.hasError('minlength')" class="profile__error">
              La contraseña debe tener al menos 8 caracteres
            </span>
          </div>

          <div class="profile__field">
            <label class="profile__label" for="newPasswordConfirm">Confirmar Nueva Contraseña</label>
            <div class="profile__password-wrapper">
              <input
                id="newPasswordConfirm"
                class="profile__input"
                [type]="showNewPasswordConfirm ? 'text' : 'password'"
                formControlName="newPasswordConfirm"
                placeholder="Confirma tu nueva contraseña"
                [disabled]="isSubmitting"
              />
              <button
                type="button"
                class="profile__password-toggle"
                (click)="togglePasswordVisibility('confirm')"
                [attr.aria-label]="showNewPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                [disabled]="isSubmitting"
              >
                @if (showNewPasswordConfirm) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                }
              </button>
            </div>
            <span *ngIf="form.hasError('passwordMismatch') && form.get('newPasswordConfirm')?.touched" class="profile__error">
              Las contraseñas no coinciden
            </span>
          </div>
        </section>

        <section class="profile__actions">
          <button
            type="submit"
            class="profile__button profile__button--primary"
            [disabled]="!form.dirty || form.invalid || isSubmitting"
          >
            {{ isSubmitting ? '💾 Guardando...' : '💾 Guardar Cambios' }}
          </button>
          <button
            type="button"
            class="profile__button profile__button--secondary"
            (click)="onCancel()"
            [disabled]="isSubmitting"
          >
            ✕ Cancelar
          </button>
        </section>

        <section *ngIf="form.dirty && !isSubmitting" class="profile__notice-container">
          <p class="profile__notice">
            ℹ️ Tienes cambios sin guardar. Si sales sin guardar, se perderán.
          </p>
        </section>
      </form>

      <!-- MODAL DE AVATARES -->
      <div *ngIf="showAvatarModal" class="profile__modal-overlay" (click)="closeAvatarModal()">
        <div class="profile__modal" (click)="$event.stopPropagation()">
          <div class="profile__modal-header">
            <h3 class="profile__modal-title">Selecciona tu foto de perfil</h3>
            <button
              type="button"
              class="profile__modal-close"
              (click)="closeAvatarModal()"
            >
              ✕
            </button>
          </div>

          <div class="profile__modal-content">
            <p class="profile__modal-hint">Haz click en un icono para seleccionarlo</p>
            <div class="profile__avatars-grid">
              <button
                *ngFor="let avatar of availableAvatars"
                type="button"
                class="profile__avatar-option"
                [class.profile__avatar-option--selected]="selectedAvatar === avatar"
                (click)="selectAvatar(avatar)"
              >
                <img [src]="avatar" [alt]="'Avatar ' + avatar" class="profile__avatar-grid-img" />
              </button>
            </div>
          </div>

          <div class="profile__modal-actions">
            <button
              type="button"
              class="profile__button profile__button--primary"
              (click)="confirmAvatar()"
              [disabled]="!selectedAvatar"
            >
              ✓ Confirmar
            </button>
            <button
              type="button"
              class="profile__button profile__button--secondary"
              (click)="closeAvatarModal()"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .profile {
      max-width: 600px;
      margin: 0 auto;
    }

    .profile__title {
      font-size: var(--font-size-tittle-h3);
      font-weight: var(--font-weight-bold);
      color: var(--text-main);
      margin: 0 0 var(--spacing-6) 0;
      font-family: var(--font-primary);
    }

    .profile__avatar-section {
      background-color: var(--bg-surface);
      padding: var(--spacing-6);
      border-radius: var(--border-radius-medium);
      margin-bottom: var(--spacing-6);
      text-align: center;
    }

    .profile__avatar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-4);
    }

    .profile__avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 3px solid var(--quinary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-body);
      overflow: hidden;
    }

    .profile__avatar-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      font-size: 60px;
    }

    .profile__avatar-button {
      padding: var(--spacing-3) var(--spacing-6);
      background-color: var(--quinary-color);
      color: var(--text-inverse);
      border: none;
      border-radius: var(--border-radius-small);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: var(--font-size-medium);

      &:hover {
        background-color: var(--quinary-color-hover);
        transform: translateY(-2px);
      }
    }

    .profile__form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
    }

    .profile__section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);

      &--password {
        background-color: var(--bg-surface);
        padding: var(--spacing-6);
        border-radius: var(--border-radius-medium);
      }
    }

    .profile__section-title {
      font-size: var(--font-size-tittle-h4);
      font-weight: var(--font-weight-semibold);
      color: var(--text-main);
      margin: 0;
    }

    .profile__section-hint {
      font-size: var(--font-size-small);
      color: var(--text-secondary);
      margin: 0;
    }

    .profile__field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .profile__label {
      font-weight: var(--font-weight-medium);
      color: var(--text-main);
      font-size: var(--font-size-medium);
    }

    .profile__password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .profile__password-wrapper .profile__input {
      padding-right: 40px;
    }

    .profile__input {
      padding: var(--spacing-3) var(--spacing-4);
      border: var(--border-thin) solid var(--border-color);
      border-radius: var(--border-radius-small);
      font-family: var(--font-tertiary);
      font-size: var(--font-size-medium);
      color: var(--text-main);
      background-color: var(--bg-body);
      transition: all var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--quinary-color);
        box-shadow: 0 0 0 3px rgba(17, 138, 178, 0.1);
      }

      &:disabled {
        background-color: var(--bg-surface);
        cursor: not-allowed;
        opacity: 0.6;
      }
    }

    .profile__password-toggle {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      color: var(--text-secondary);
      transition: opacity var(--transition-fast), color var(--transition-fast);
      z-index: 10;
      width: 28px;
      height: 28px;

      svg {
        width: 20px;
        height: 20px;
        stroke: currentColor;
        flex-shrink: 0;
      }

      &:hover:not(:disabled) {
        opacity: 0.8;
        color: var(--principal-color);
      }

      &:active:not(:disabled) {
        opacity: 0.5;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      &:focus {
        outline: none;
      }
    }

    .profile__error {
      color: var(--error-color);
      font-size: var(--font-size-small);
      font-weight: var(--font-weight-medium);
    }

    .profile__actions {
      display: flex;
      gap: var(--spacing-4);
      flex-wrap: wrap;
    }

    .profile__button {
      padding: var(--spacing-3) var(--spacing-6);
      border: none;
      border-radius: var(--border-radius-small);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: var(--font-tertiary);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &--primary {
        background-color: var(--quinary-color);
        color: var(--text-inverse);

        &:hover:not(:disabled) {
          background-color: var(--quinary-color-hover);
        }
      }

      &--secondary {
        background-color: var(--bg-surface);
        color: var(--text-main);
        border: var(--border-thin) solid var(--border-color);

        &:hover:not(:disabled) {
          background-color: var(--hover-bg);
        }
      }
    }

    .profile__notice-container {
      display: flex;
      flex-direction: column;
    }

    .profile__notice {
      background-color: rgba(17, 138, 178, 0.08);
      padding: var(--spacing-4);
      border-radius: var(--border-radius-small);
      border-left: 4px solid var(--quinary-color);
      margin: 0;
      font-size: var(--font-size-small);
      color: var(--text-main);
    }

    /* MODAL STYLES */
    .profile__modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .profile__modal {
      background-color: var(--bg-body);
      border-radius: var(--border-radius-medium);
      box-shadow: var(--shadow-lg);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .profile__modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-6);
      border-bottom: var(--border-thin) solid var(--border-color);
    }

    .profile__modal-title {
      margin: 0;
      font-size: var(--font-size-tittle-h4);
      font-weight: var(--font-weight-bold);
      color: var(--text-main);
    }

    .profile__modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--border-radius-small);
      transition: all var(--transition-fast);

      &:hover {
        background-color: var(--bg-surface);
        color: var(--text-main);
      }
    }

    .profile__modal-content {
      padding: var(--spacing-6);
      flex: 1;
    }

    .profile__modal-hint {
      color: var(--text-secondary);
      font-size: var(--font-size-small);
      margin: 0 0 var(--spacing-4) 0;
      text-align: center;
    }

    .profile__avatars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-6);
    }

    .profile__avatar-option {
      aspect-ratio: 1;
      border: 3px solid var(--border-color);
      border-radius: var(--border-radius-small);
      background-color: var(--bg-surface);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      padding: 0;
      overflow: hidden;

      &:hover {
        border-color: var(--quinary-color);
        transform: scale(1.05);
      }

      &--selected {
        border-color: var(--quinary-color);
        background-color: rgba(17, 138, 178, 0.1);
        box-shadow: 0 0 0 3px rgba(17, 138, 178, 0.2);
      }
    }

    .profile__avatar-grid-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: var(--spacing-2);
    }

    .profile__modal-actions {
      display: flex;
      gap: var(--spacing-4);
      padding: var(--spacing-6);
      border-top: var(--border-thin) solid var(--border-color);
      background-color: var(--bg-surface);

      button {
        flex: 1;
      }
    }

    @media (max-width: 640px) {
      .profile__actions {
        flex-direction: column;
      }

      .profile__button {
        width: 100%;
      }

      .profile__avatars-grid {
        grid-template-columns: repeat(4, 1fr);
      }

      .profile__modal {
        width: 95%;
        max-height: 90vh;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit, OnDestroy, FormComponent {
  form: FormGroup;
  isSubmitting = false;
  showAvatarModal = false;
  selectedAvatar: string | null = null;
  showCurrentPassword = false;
  showNewPassword = false;
  showNewPasswordConfirm = false;
  availableAvatars = [
    'assets/profile-picture.webp',
    'assets/profile-picture2.webp',
    'assets/profile-picture3.webp',
    'assets/profile-picture4.webp',
    'assets/profile-picture5.webp',
    'assets/avatar-1.svg',
    'assets/avatar-2.svg',
    'assets/avatar-3.svg'
  ];
  private destroy$ = new Subject<void>();

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['', Validators.minLength(8)],
      newPasswordConfirm: ['']
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    // Cargar datos del usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.form.patchValue({
            name: user.name || '',
            email: user.email || '',
            currentPassword: '',
            newPassword: '',
            newPasswordConfirm: ''
          });
          this.form.markAsPristine();
          this.selectedAvatar = user.profilePicture || 'assets/profile-picture.webp';
        }
      });
  }

  /**
   * Obtiene la URL del avatar actual
   */
  getAvatarUrl(): string {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.profilePicture || 'assets/profile-picture.webp';
  }

  /**
   * Alterna la visibilidad de un campo de contraseña
   */
  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirm') {
      this.showNewPasswordConfirm = !this.showNewPasswordConfirm;
    }
  }

  /**
   * Abre el modal de selección de avatares
   */
  openAvatarModal(): void {
    this.showAvatarModal = true;
    this.selectedAvatar = this.getAvatarUrl();
  }

  /**
   * Cierra el modal de avatares
   */
  closeAvatarModal(): void {
    this.showAvatarModal = false;
    this.selectedAvatar = null;
  }

  /**
   * Selecciona un avatar
   */
  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  /**
   * Confirma y guarda el avatar seleccionado
   */
  confirmAvatar(): void {
    if (!this.selectedAvatar) return;

    this.isSubmitting = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.toastService.error('Error: No se encontró información del usuario');
      this.isSubmitting = false;
      return;
    }

    const updateData = {
      profilePicture: this.selectedAvatar
    };

    this.userService.updateUser(currentUser.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          this.isSubmitting = false;
          this.closeAvatarModal();
          
          // Actualizar el estado en AuthService (esto actualiza el header también)
          this.authService['currentUserSubject'].next(updatedUser);
          localStorage.setItem('current_user', JSON.stringify(updatedUser));
          
          this.toastService.success('Avatar actualizado exitosamente');
        },
        error: (error) => {
          this.isSubmitting = false;
          const message = error.error?.message || 'Error al actualizar el avatar';
          this.toastService.error(message);
        }
      });
  }

  /**
   * Guarda los cambios del perfil en el backend
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.toastService.error('Por favor completa el formulario correctamente');
      return;
    }

    // Validar que si hay nueva contraseña, se proporcione la actual
    if (this.form.value.newPassword && !this.form.value.currentPassword) {
      this.toastService.error('Debes proporcionar tu contraseña actual para cambiarla');
      return;
    }

    this.isSubmitting = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.toastService.error('Error: No se encontró información del usuario');
      this.isSubmitting = false;
      return;
    }

    const updateData: any = {
      name: this.form.value.name,
      email: this.form.value.email
    };

    // Solo incluir cambio de contraseña si se está intentando cambiar
    if (this.form.value.newPassword) {
      updateData.currentPassword = this.form.value.currentPassword;
      updateData.newPassword = this.form.value.newPassword;
      updateData.newPasswordConfirm = this.form.value.newPasswordConfirm;
    }

    this.userService.updateUser(currentUser.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          this.isSubmitting = false;
          
          // Actualizar el estado en AuthService
          this.authService['currentUserSubject'].next(updatedUser);
          localStorage.setItem('current_user', JSON.stringify(updatedUser));
          
          // Limpiar campos de contraseña
          this.form.patchValue({
            currentPassword: '',
            newPassword: '',
            newPasswordConfirm: ''
          });
          
          this.form.markAsPristine();
          this.toastService.success('Perfil actualizado exitosamente');
        },
        error: (error) => {
          this.isSubmitting = false;
          const message = error.error?.message || 'Error al actualizar el perfil';
          this.toastService.error(message);
        }
      });
  }

  /**
   * Cancela los cambios y revierte el formulario
   */
  onCancel(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.form.patchValue({
        name: currentUser.name || '',
        email: currentUser.email || '',
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
      });
      this.form.markAsPristine();
    }
  }

  /**
   * Getters para validación
   */
  get isNameInvalid(): boolean {
    const control = this.form.get('name');
    return !!(control && control.invalid && control.touched);
  }

  get isEmailInvalid(): boolean {
    const control = this.form.get('email');
    return !!(control && control.invalid && control.touched);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

