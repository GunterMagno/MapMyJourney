import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interfaz para datos de pedido
 */
interface Order {
  id: string;
  date: string;
  destination: string;
  status: 'completed' | 'pending' | 'cancelled';
  total: number;
}

/**
 * UserOrdersComponent - Página de pedidos del usuario
 *
 * Lista los pedidos realizados por el usuario con estado y detalles.
 */
@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="orders">
      <h2 class="orders__title">Mis Pedidos</h2>

      <article class="orders__container">
        <div *ngIf="orders.length === 0" class="orders__empty">
          <p>No tienes pedidos aún. ¡Comienza tu próxima aventura!</p>
          <a href="/trips" class="orders__cta">Explorar Viajes</a>
        </div>

        <div *ngIf="orders.length > 0" class="orders__list">
          <article *ngFor="let order of orders" class="order-card">
            <header class="order-card__header">
              <h3 class="order-card__destination">{{ order.destination }}</h3>
              <span class="order-card__status" [ngClass]="'order-card__status--' + order.status">
                {{ getStatusLabel(order.status) }}
              </span>
            </header>

            <section class="order-card__details">
              <div class="order-card__field">
                <span class="order-card__label">ID Pedido:</span>
                <span class="order-card__value">#{{ order.id }}</span>
              </div>
              <div class="order-card__field">
                <span class="order-card__label">Fecha:</span>
                <span class="order-card__value">{{ order.date }}</span>
              </div>
              <div class="order-card__field">
                <span class="order-card__label">Total:</span>
                <span class="order-card__value order-card__value--highlight">$ {{ order.total }}</span>
              </div>
            </section>

            <footer class="order-card__actions">
              <a href="javascript:void(0)" class="order-card__link">📋 Ver Detalles</a>
              <a href="javascript:void(0)" class="order-card__link">🗑️ Cancelar</a>
            </footer>
          </article>
        </div>
      </article>
    </section>
  `,
  styles: [`
    .orders {
      max-width: 800px;
      margin: 0 auto;
    }

    .orders__title {
      font-size: var(--font-size-tittle-h3);
      font-weight: var(--font-weight-bold);
      color: var(--text-main);
      margin: 0 0 var(--spacing-6) 0;
      font-family: var(--font-primary);
    }

    .orders__container {
      display: flex;
      flex-direction: column;
    }

    .orders__empty {
      text-align: center;
      padding: var(--spacing-8);
      background-color: var(--hover-bg);
      border-radius: var(--border-radius-medium);
      color: var(--text-secondary);

      p {
        margin: 0 0 var(--spacing-4) 0;
        font-size: var(--font-size-medium);
      }
    }

    .orders__cta {
      display: inline-block;
      padding: var(--spacing-3) var(--spacing-6);
      background-color: var(--quinary-color);
      color: var(--text-inverse);
      text-decoration: none;
      border-radius: var(--border-radius-small);
      font-weight: var(--font-weight-semibold);
      transition: all var(--transition-fast);

      &:hover {
        background-color: var(--quinary-color-hover);
        transform: translateY(-2px);
      }
    }

    .orders__list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .order-card {
      background-color: var(--bg-body);
      border: var(--border-thin) solid var(--border-color);
      border-radius: var(--border-radius-medium);
      padding: var(--spacing-6);
      transition: all var(--transition-fast);

      &:hover {
        box-shadow: var(--shadow-md);
        border-color: var(--quinary-color);
      }
    }

    .order-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-4);
      padding-bottom: var(--spacing-4);
      border-bottom: var(--border-thin) solid var(--border-color);
    }

    .order-card__destination {
      font-size: var(--font-size-tittle-h4);
      font-weight: var(--font-weight-semibold);
      color: var(--text-main);
      margin: 0;
      font-family: var(--font-tertiary);
    }

    .order-card__status {
      padding: var(--spacing-2) var(--spacing-4);
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-small);
      font-weight: var(--font-weight-semibold);

      &--completed {
        background-color: rgba(141, 204, 82, 0.2);
        color: var(--correct-color);
      }

      &--pending {
        background-color: rgba(243, 119, 72, 0.2);
        color: var(--warning-color);
      }

      &--cancelled {
        background-color: rgba(235, 53, 26, 0.2);
        color: var(--error-color);
      }
    }

    .order-card__details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-4);
    }

    .order-card__field {
      display: flex;
      flex-direction: column;
    }

    .order-card__label {
      font-size: var(--font-size-small);
      color: var(--text-secondary);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-1);
    }

    .order-card__value {
      font-size: var(--font-size-medium);
      color: var(--text-main);
      font-weight: var(--font-weight-semibold);
      font-family: var(--font-secondary);

      &--highlight {
        color: var(--quinary-color);
      }
    }

    .order-card__actions {
      display: flex;
      gap: var(--spacing-4);
      flex-wrap: wrap;
    }

    .order-card__link {
      color: var(--quinary-color);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-small);
      padding: var(--spacing-2) var(--spacing-3);
      border-radius: var(--border-radius-small);
      transition: all var(--transition-fast);

      &:hover {
        color: var(--principal-color);
        background-color: var(--hover-bg);
      }
    }

    @media (max-width: 640px) {
      .order-card__header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-2);
      }

      .order-card__details {
        grid-template-columns: 1fr;
      }

      .order-card__actions {
        flex-direction: column;
      }

      .order-card__link {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class UserOrdersComponent {
  orders: Order[] = [
    {
      id: '001',
      date: '2025-11-15',
      destination: 'Barcelona, España',
      status: 'completed',
      total: 1299
    },
    {
      id: '002',
      date: '2025-12-01',
      destination: 'Machu Picchu, Perú',
      status: 'pending',
      total: 2199
    },
    {
      id: '003',
      date: '2025-10-20',
      destination: 'Safari, Kenya',
      status: 'completed',
      total: 1899
    }
  ];

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      completed: '✅ Completado',
      pending: '⏳ Pendiente',
      cancelled: '❌ Cancelado'
    };
    return labels[status] || status;
  }
}
