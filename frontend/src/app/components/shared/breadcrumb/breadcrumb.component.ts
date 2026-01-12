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
      background-color: transparent;
      padding: 4px 0;
      border-bottom: none;
      margin-bottom: 8px;
      min-height: 20px;
    }

    .breadcrumb__list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
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
        margin-left: 4px;
        color: var(--text-secondary);
        font-size: 11px;
      }
    }

    .breadcrumb__link {
      color: var(--quinary-color-hover);
      text-decoration: none;
      font-size: 11px;
      font-weight: var(--font-weight-medium);
      padding: 2px 4px;
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
        padding: 4px 0;
        margin-bottom: 8px;
      }

      .breadcrumb__list {
        gap: 4px;
      }

      .breadcrumb__link {
        font-size: 11px;
        padding: 2px 4px;
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
