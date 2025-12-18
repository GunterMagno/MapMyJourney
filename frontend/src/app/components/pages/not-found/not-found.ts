import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/button/button';

/**
 * Not Found (404) component
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <section class="not-found">
      <div class="not-found__content">
        <h1 class="not-found__title">404</h1>
        <h2 class="not-found__subtitle">Página no encontrada</h2>
        <p class="not-found__message">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div class="not-found__actions">
          <app-button
            label="Volver al inicio"
            variant="primary"
            size="lg"
            routerLink="/demo">
          </app-button>
          
          <app-button
            label="Mis Viajes"
            variant="secondary"
            size="lg"
            routerLink="/trips">
          </app-button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 80px);
      padding: var(--spacing-8);
      background: linear-gradient(135deg, var(--principal-color) 0%, var(--principal-dark) 100%);
    }

    .not-found__content {
      text-align: center;
      color: white;
    }

    .not-found__title {
      margin: 0;
      font-size: 120px;
      font-weight: var(--font-weight-bold);
      line-height: 1;
      color: var(--dark-color);
    }

    .not-found__subtitle {
      margin: var(--spacing-4) 0 var(--spacing-6) 0;
      font-size: var(--font-size-tittle-h1);
      color: var(--dark-color);
    }

    .not-found__message {
      margin: 0 0 var(--spacing-8) 0;
      font-size: var(--font-size-medium);
      opacity: 0.9;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      color: var(--dark-color);
    }

    .not-found__actions {
      display: flex;
      gap: var(--spacing-4);
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .not-found__title {
        font-size: 80px;
      }

      .not-found__subtitle {
        font-size: var(--font-size-tittle-h2);
      }

      .not-found__actions {
        flex-direction: column;
      }
    }
  `]
})
export class NotFoundComponent {}
