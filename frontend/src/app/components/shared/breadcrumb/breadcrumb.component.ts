import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbService, BreadcrumbItem } from '../../../services/breadcrumb.service';

/**
 * BreadcrumbComponent - Navío de migas dinámico
 *
 * Muestra la ruta de navegación actual de forma dinámica.
 * Escucha el servicio BreadcrumbService para actualizar cuando cambia la ruta.
 *
 * Uso en layout:
 * <app-breadcrumb></app-breadcrumb>
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb" *ngIf="(breadcrumbs$ | async) as items">
      <ol class="breadcrumb__list">
        <!-- Inicio (siempre presente) -->
        <li class="breadcrumb__item">
          <a routerLink="/demo" class="breadcrumb__link">Inicio</a>
        </li>

        <!-- Items dinámicos -->
        <li
          *ngFor="let item of items"
          class="breadcrumb__item"
          [attr.aria-current]="isLastItem(items, item) ? 'page' : null"
        >
          <a
            *ngIf="!isLastItem(items, item)"
            [routerLink]="item.url"
            class="breadcrumb__link"
          >
            {{ item.label }}
          </a>
          <span
            *ngIf="isLastItem(items, item)"
            class="breadcrumb__link breadcrumb__link--active"
          >
            {{ item.label }}
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb {
      background-color: var(--bg-surface);
      padding: var(--spacing-2) var(--spacing-6);
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 0;
    }

    .breadcrumb__list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-1);
      list-style: none;
      margin: 0;
      padding: 0;
      max-width: 1024px;
      margin-left: auto;
      margin-right: auto;
    }

    .breadcrumb__item {
      display: flex;
      align-items: center;

      &:not(:last-child)::after {
        content: '/';
        margin-left: var(--spacing-1);
        color: var(--text-secondary);
        font-size: var(--font-size-extra-small);
      }
    }

    .breadcrumb__link {
      color: var(--quinary-color-hover);
      text-decoration: none;
      font-size: var(--font-size-extra-small);
      font-weight: var(--font-weight-medium);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--border-radius-small);
      transition: all var(--transition-fast);

      &:hover {
        color: var(--principal-color);
        background-color: var(--hover-bg);
      }

      &--active {
        color: var(--text-main);
        font-weight: var(--font-weight-semibold);
        cursor: default;

        &:hover {
          background-color: transparent;
        }
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .breadcrumb {
        padding: var(--spacing-2) var(--spacing-4);
        margin-bottom: 0;
      }

      .breadcrumb__list {
        gap: var(--spacing-1);
      }

      .breadcrumb__link {
        font-size: var(--font-size-extra-small);
        padding: var(--spacing-1);
      }
    }
  `]
})
export class BreadcrumbComponent implements OnInit {
  private breadcrumbService = inject(BreadcrumbService);
  breadcrumbs$ = this.breadcrumbService.breadcrumbs$;

  ngOnInit(): void {
    // El servicio ya está escuchando NavigationEnd automáticamente
  }

  /**
   * Verifica si un item es el último de la lista
   */
  isLastItem(items: BreadcrumbItem[], item: BreadcrumbItem): boolean {
    return items[items.length - 1] === item;
  }
}
