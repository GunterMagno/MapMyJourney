import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';

/**
 * UserLayoutComponent - Layout para sección de usuario
 *
 * Componente contenedor para las subpáginas del usuario.
 * Contiene el router-outlet donde se renderizarán las rutas hijas.
 *
 * Rutas hijas:
 * - /usuario/perfil -> UserProfileComponent
 * - /usuario/itinerario -> ItineraryComponent
 */
@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <section class="user-layout">
      <aside class="user-layout__sidebar">
        <nav class="user-layout__nav">
          <h3 class="user-layout__title">Mi Cuenta</h3>
          <ul class="user-layout__menu">
            <li>
              <a
                routerLink="perfil"
                routerLinkActive="user-layout__link--active"
                class="user-layout__link"
              >
                👤 Perfil
              </a>
            </li>
            <li>
              <a
                routerLink="itinerario"
                routerLinkActive="user-layout__link--active"
                class="user-layout__link"
              >
                🗺️ Mi Itinerario
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <main class="user-layout__content">
        <router-outlet></router-outlet>
      </main>
    </section>
    <app-footer></app-footer>
  `,
  styles: [`
    .user-layout {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--spacing-6);
      padding: var(--spacing-6);
      max-width: 1024px;
      margin: 0 auto;
    }

    .user-layout__sidebar {
      background-color: var(--bg-surface);
      padding: var(--spacing-4);
      border-radius: var(--border-radius-medium);
      height: fit-content;
      box-shadow: var(--shadow-sm);
    }

    .user-layout__title {
      font-size: var(--font-size-tittle-h4);
      font-weight: var(--font-weight-bold);
      color: var(--text-main);
      margin: 0 0 var(--spacing-4) 0;
      font-family: var(--font-primary);
    }

    .user-layout__nav {
      display: flex;
      flex-direction: column;
    }

    .user-layout__menu {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);

      li {
        margin: 0;
        padding: 0;
      }
    }

    .user-layout__link {
      display: block;
      padding: var(--spacing-3) var(--spacing-4);
      color: var(--text-color);
      text-decoration: none;
      border-radius: var(--border-radius-small);
      transition: all var(--transition-fast);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-medium);

      &:hover {
        background-color: var(--hover-bg);
        color: var(--principal-color);
      }

      &--active {
        background-color: var(--quinary-color);
        color: var(--text-inverse);
        font-weight: var(--font-weight-semibold);

        &:hover {
          background-color: var(--quinary-color-hover);
        }
      }
    }

    .user-layout__content {
      background-color: var(--bg-surface);
      padding: var(--spacing-6);
      border-radius: var(--border-radius-medium);
      box-shadow: var(--shadow-sm);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .user-layout {
        grid-template-columns: 1fr;
        gap: var(--spacing-4);
        padding: var(--spacing-4);
      }

      .user-layout__sidebar {
        order: 2;
      }

      .user-layout__content {
        order: 1;
      }

      .user-layout__menu {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .user-layout__link {
        flex: 1 1 calc(50% - var(--spacing-1));
        text-align: center;
      }
    }

    @media (max-width: 640px) {
      .user-layout__link {
        flex: 1 1 100%;
      }
    }
  `]
})
export class UserLayoutComponent {}
