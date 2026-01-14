import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

export type SortOrder = 'fecha_asc' | 'fecha_desc' | 'precio_asc' | 'precio_desc';

/**
 * Componente de Filtros de Ordenamiento
 * 
 * Botones pequeños para ordenar viajes por:
 * - Fecha (ascendente/descendente)
 * - Precio (ascendente/descendente)
 * 
 * Emite el ordenamiento elegido y navega con queryParams
 */
@Component({
  selector: 'app-trips-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trips-filters">
      <div class="trips-filters__group">
        <label class="trips-filters__label">Ordenar por:</label>
        <div class="trips-filters__buttons">
          <button 
            class="trips-filters__btn"
            [class.trips-filters__btn--active]="currentSort === 'fecha_asc'"
            (click)="applySort('fecha_asc')"
            title="Fecha más antigua primero">
            📅 Fecha ↑
          </button>
          <button 
            class="trips-filters__btn"
            [class.trips-filters__btn--active]="currentSort === 'fecha_desc'"
            (click)="applySort('fecha_desc')"
            title="Fecha más reciente primero">
            📅 Fecha ↓
          </button>
          <button 
            class="trips-filters__btn"
            [class.trips-filters__btn--active]="currentSort === 'precio_asc'"
            (click)="applySort('precio_asc')"
            title="Precio menor primero">
            💰 Precio ↑
          </button>
          <button 
            class="trips-filters__btn"
            [class.trips-filters__btn--active]="currentSort === 'precio_desc'"
            (click)="applySort('precio_desc')"
            title="Precio mayor primero">
            💰 Precio ↓
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .trips-filters {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
    }

    .trips-filters__group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .trips-filters__label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .trips-filters__buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .trips-filters__btn {
      padding: 6px 10px;
      font-size: 11px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .trips-filters__btn:hover {
      border-color: #2196f3;
      background: #e3f2fd;
      color: #2196f3;
    }

    .trips-filters__btn--active {
      background: #2196f3;
      color: white;
      border-color: #2196f3;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .trips-filters {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .trips-filters__buttons {
        width: 100%;
      }
    }
  `]
})
export class TripsFiltersComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  // Output para notificar al padre
  sortChanged = output<SortOrder>();

  // Track de ordenamiento actual
  currentSort: SortOrder = 'fecha_desc';

  constructor() {
    // Leer ordenamiento actual desde queryParams
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['orden']) {
        this.currentSort = params['orden'] as SortOrder;
      }
    });
  }

  /**
   * Aplicar ordenamiento y navegar con queryParams
   * 
   * Implementa navegación avanzada (PROMPT 3):
   * - Ruta: /trips
   * - QueryParams: orden=fecha_asc|fecha_desc|precio_asc|precio_desc
   * - State: { origen: 'filtro_ordenamiento' }
   */
  applySort(sort: SortOrder): void {
    this.currentSort = sort;
    this.sortChanged.emit(sort);

    // Navegación con queryParams (visible en URL)
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { orden: sort },
      queryParamsHandling: 'merge', // Mantener otros params
      state: {
        origen: 'filtro_ordenamiento',
        timestamp: new Date().getTime()
      }
    });

    console.log('Ordenamiento aplicado:', sort);
  }
}
