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
      <ol class="breadcrumb__list" *ngIf="items.length > 0">
        <!-- Inicio (siempre presente excepto cuando items está vacío) -->
        <li class="breadcrumb__item">
          <a routerLink="/home" class="breadcrumb__link">Inicio</a>
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
      background-color: transparent;
      padding: 12px 24px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 0;
      min-height: 44px;
    }

    .breadcrumb__list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      list-style: none;
      margin: 0;
      padding: 0;
      max-width: 100%;
      margin-left: 0;
      margin-right: auto;
      justify-content: flex-start;
    }

    .breadcrumb__item {
      display: flex;
      align-items: center;

      &:not(:last-child)::after {
        content: '/';
        margin-left: 8px;
        color: var(--text-secondary);
        font-size: 14px;
        font-weight: 300;
      }
    }

    .breadcrumb__link {
      color: var(--quinary-color-hover);
      text-decoration: none;
      font-size: 14px;
      font-weight: var(--font-weight-medium);
      padding: 4px 8px;
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
        padding: 8px 16px;
        min-height: 36px;
      }

      .breadcrumb__list {
        gap: 6px;
      }

      .breadcrumb__link {
        font-size: 13px;
        padding: 3px 6px;
      }

      .breadcrumb__item:not(:last-child)::after {
        font-size: 13px;
        margin-left: 6px;
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
