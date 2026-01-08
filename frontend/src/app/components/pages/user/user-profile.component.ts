import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormComponent } from '../../../core/guards/pending-changes.guard';

/**
 * UserProfileComponent - Página de perfil del usuario
 *
 * Forma editable para el perfil del usuario. Implementa FormComponent
 * para que el pendingChangesGuard pueda verificar cambios sin guardar.
 */
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <article class="profile">
      <h2 class="profile__title">Mi Perfil</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="profile__form">
        <section class="profile__section">
          <div class="profile__field">
            <label class="profile__label" for="name">Nombre Completo</label>
            <input
              id="name"
              class="profile__input"
              type="text"
              formControlName="name"
              placeholder="Tu nombre"
            />
          </div>

          <div class="profile__field">
            <label class="profile__label" for="email">Email</label>
            <input
              id="email"
              class="profile__input"
              type="email"
              formControlName="email"
              placeholder="tu@email.com"
            />
          </div>

          <div class="profile__field">
            <label class="profile__label" for="phone">Teléfono</label>
            <input
              id="phone"
              class="profile__input"
              type="tel"
              formControlName="phone"
              placeholder="+34 123 456 789"
            />
          </div>

          <div class="profile__field">
            <label class="profile__label" for="country">País</label>
            <input
              id="country"
              class="profile__input"
              type="text"
              formControlName="country"
              placeholder="Tu país"
            />
          </div>
        </section>

        <section class="profile__actions">
          <button
            type="submit"
            class="profile__button profile__button--primary"
            [disabled]="!form.dirty"
          >
            💾 Guardar Cambios
          </button>
          <button
            type="button"
            class="profile__button profile__button--secondary"
            (click)="onCancel()"
          >
            ✕ Cancelar
          </button>
        </section>

        <section *ngIf="form.dirty" class="profile__notice-container">
          <p class="profile__notice">
            ℹ️ Tienes cambios sin guardar. Si sales sin guardar, se perderán.
          </p>
        </section>
      </form>
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

    .profile__form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
    }

    .profile__section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
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
      }
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

    @media (max-width: 640px) {
      .profile__actions {
        flex-direction: column;
      }

      .profile__button {
        width: 100%;
      }
    }
  `]
})
export class UserProfileComponent implements FormComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['Juan Pérez', Validators.required],
      email: ['juan@example.com', [Validators.required, Validators.email]],
      phone: ['+34 612 345 678', Validators.required],
      country: ['España', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Perfil actualizado:', this.form.value);
      this.form.markAsPristine();
      alert('✅ Cambios guardados exitosamente');
    }
  }

  onCancel(): void {
    this.form.reset({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+34 612 345 678',
      country: 'España'
    });
    this.form.markAsPristine();
  }
}
