import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * Componente de Búsqueda Avanzada
 *
 * Navegación Programática Completa
 *
 * Implementa navegación con:
 * ✅ Ruta dinámica
 * ✅ QueryParams (orden, página, filtros)
 * ✅ Fragment (scroll a sección)
 * ✅ State (datos ocultos entre componentes)
 *
 * Ejemplo de uso:
 * ```
 * this.buscar();
 * // URL: /trips?orden=fecha_asc&pag=1#top
 * // State: { origen: 'busqueda_avanzada', timestamp: Date }
 * ```
 */
@Component({
  selector: 'app-search-navigator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-navigator">
      <h3>Navegación Avanzada - Búsqueda</h3>
      
      <div class="search-form">
        <input
          [(ngModel)]="query"
          placeholder="Buscar viajes..."
          class="search-input"
        />
        
        <select [(ngModel)]="ordenamiento" class="sort-select">
          <option value="fecha_asc">Fecha (Más antigua primero)</option>
          <option value="fecha_desc">Fecha (Más reciente primero)</option>
          <option value="precio_asc">Precio (Menor primero)</option>
          <option value="precio_desc">Precio (Mayor primero)</option>
        </select>
        
        <input
          [(ngModel)]="pagina"
          type="number"
          min="1"
          placeholder="Página"
          class="page-input"
        />
        
        <button (click)="buscarConFiltros()" class="search-btn">
          Buscar
        </button>
      </div>
      
      <div class="info-box">
        <p><strong>Última búsqueda:</strong> {{ ultimaBusqueda | json }}</p>
      </div>
    </div>
  `,
  styles: [`
    .search-navigator {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin: 20px 0;
      background: #f9f9f9;
    }

    h3 {
      margin-top: 0;
      color: #333;
    }

    .search-form {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 15px 0;
    }

    .search-input,
    .sort-select,
    .page-input,
    .search-btn {
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }

    .search-input {
      flex: 1;
      min-width: 200px;
    }

    .sort-select {
      flex: 1;
      min-width: 200px;
    }

    .page-input {
      width: 80px;
    }

    .search-btn {
      background: #2196f3;
      color: white;
      border: none;
      cursor: pointer;
      font-weight: bold;
    }

    .search-btn:hover {
      background: #1976d2;
    }

    .info-box {
      background: white;
      padding: 10px;
      border-radius: 4px;
      margin-top: 15px;
      font-size: 12px;
      color: #666;
    }
  `]
})
export class SearchNavigatorComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  query: string = '';
  ordenamiento: string = 'fecha_asc';
  pagina: number = 1;
  ultimaBusqueda: any = null;

  /**
   * Navegación Programática Avanzada (PROMPT 3)
   *
   * Implementa:
   * ✅ Ruta dinámica: /trips
   * ✅ QueryParams: { orden, pag }
   * ✅ Fragment: #top (scroll a sección)
   * ✅ State: { origen, timestamp } (datos ocultos)
   *
   * El estado se puede leer en el componente destino:
   * ```typescript
   * constructor(private router: Router) {
   *   const state = this.router.getCurrentNavigation()?.extras?.state;
   *   console.log('Estado recibido:', state);
   * }
   * ```
   */
  buscarConFiltros(): void {
    if (!this.query.trim()) {
      alert('Ingresa una búsqueda');
      return;
    }

    // Registro para debugging
    this.ultimaBusqueda = {
      query: this.query,
      orden: this.ordenamiento,
      pagina: this.pagina,
      timestamp: new Date().toLocaleString()
    };

    // NAVEGACIÓN PROGRAMÁTICA COMPLETA
    this.router.navigate(
      ['/trips'], // Ruta dinámica
      {
        queryParams: {
          // QueryParams: Visibles en URL
          orden: this.ordenamiento,
          pag: this.pagina,
          q: this.query // Query de búsqueda
        },
        fragment: 'top', // Fragment: Scroll a #top después de navegar
        state: {
          // State: Datos ocultos (NO aparecen en URL)
          origen: 'busqueda_avanzada',
          timestamp: new Date().getTime(),
          filtros: {
            ordenamiento: this.ordenamiento,
            pagina: this.pagina,
            query: this.query
          }
        }
      }
    );

    console.log('🔍 Navegación avanzada ejecutada:', {
      destino: '/trips',
      queryParams: { orden: this.ordenamiento, pag: this.pagina, q: this.query },
      fragment: 'top',
      state: { origen: 'busqueda_avanzada' }
    });
  }
}
