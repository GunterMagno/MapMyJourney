import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interfaz para actividad diaria
 */
interface DayActivity {
  time: string;
  activity: string;
  description: string;
}

/**
 * Interfaz para día del itinerario
 */
interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  overview: string;
  activities: DayActivity[];
}

/**
 * Interfaz para itinerario completo
 */
interface Itinerary {
  id: string;
  trip: string;
  startDate: string;
  endDate: string;
  duration: number;
  days: ItineraryDay[];
}

/**
 * ItineraryComponent - Página de resumen del itinerario
 *
 * Muestra resumen general del viaje y permite expandir cada día
 * para ver actividades sin cambiar de página (accordion).
 */
@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="itinerary">
      <h2 class="itinerary__title">Itinerario de tu Viaje</h2>

      <section class="itinerary__header">
        <div class="itinerary__info">
          <div class="itinerary__field">
            <span class="itinerary__label">Destino</span>
            <h3 class="itinerary__destination">{{ currentItinerary.trip }}</h3>
          </div>
          <div class="itinerary__field">
            <span class="itinerary__label">Fechas</span>
            <p class="itinerary__dates">
              {{ currentItinerary.startDate }} - {{ currentItinerary.endDate }}
            </p>
          </div>
          <div class="itinerary__field">
            <span class="itinerary__label">Duración</span>
            <p class="itinerary__duration">{{ currentItinerary.duration }} días</p>
          </div>
        </div>
      </section>

      <section class="itinerary__days">
        <h3 class="itinerary__subtitle">Plan de tu viaje</h3>

        <div class="days__container">
          <article
            *ngFor="let day of currentItinerary.days"
            class="day-card"
            [class.day-card--expanded]="expandedDayId === day.day"
          >
            <button
              class="day-card__header"
              (click)="toggleDay(day.day)"
              [attr.aria-expanded]="expandedDayId === day.day"
              [attr.aria-controls]="'day-' + day.day"
            >
              <div class="day-card__day-number">
                <span class="day-card__number">Día {{ day.day }}</span>
              </div>
              <div class="day-card__summary">
                <h4 class="day-card__title">{{ day.title }}</h4>
                <p class="day-card__overview">{{ day.overview }}</p>
              </div>
              <span class="day-card__toggle" [class.day-card__toggle--open]="expandedDayId === day.day">
                ▼
              </span>
            </button>

            <div
              *ngIf="expandedDayId === day.day"
              [attr.id]="'day-' + day.day"
              class="day-card__content"
            >
              <div class="day-card__activities">
                <div *ngFor="let activity of day.activities" class="activity">
                  <div class="activity__time">{{ activity.time }}</div>
                  <div class="activity__details">
                    <h5 class="activity__title">{{ activity.activity }}</h5>
                    <p class="activity__description">{{ activity.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </article>
  `,
  styles: [`
    .itinerary {
      max-width: 900px;
      margin: 0 auto;
    }

    .itinerary__title {
      font-size: var(--font-size-tittle-h3);
      font-weight: var(--font-weight-bold);
      color: var(--text-main);
      margin: 0 0 var(--spacing-8) 0;
      font-family: var(--font-primary);
    }

    .itinerary__header {
      background: linear-gradient(135deg, var(--quinary-color), var(--principal-color));
      border-radius: var(--border-radius-medium);
      padding: var(--spacing-6);
      margin-bottom: var(--spacing-8);
      color: var(--text-inverse);
    }

    .itinerary__info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-6);
    }

    .itinerary__field {
      display: flex;
      flex-direction: column;
    }

    .itinerary__label {
      font-size: var(--font-size-small);
      font-weight: var(--font-weight-semibold);
      opacity: 0.9;
      margin-bottom: var(--spacing-1);
    }

    .itinerary__destination {
      font-size: var(--font-size-tittle-h4);
      font-weight: var(--font-weight-bold);
      margin: 0;
      font-family: var(--font-primary);
    }

    .itinerary__dates,
    .itinerary__duration {
      font-size: var(--font-size-medium);
      margin: 0;
      font-family: var(--font-secondary);
    }

    .itinerary__subtitle {
      font-size: var(--font-size-tittle-h4);
      font-weight: var(--font-weight-semibold);
      color: var(--text-main);
      margin: 0 0 var(--spacing-4) 0;
      font-family: var(--font-primary);
    }

    .days__container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .day-card {
      background-color: var(--bg-body);
      border: var(--border-thin) solid var(--border-color);
      border-radius: var(--border-radius-medium);
      overflow: hidden;
      transition: all var(--transition-fast);

      &--expanded {
        box-shadow: var(--shadow-md);
        border-color: var(--quinary-color);
      }
    }

    .day-card__header {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: var(--spacing-4);
      align-items: center;
      width: 100%;
      padding: var(--spacing-4) var(--spacing-6);
      background-color: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: all var(--transition-fast);

      &:hover {
        background-color: var(--hover-bg);
      }
    }

    .day-card__day-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, var(--quinary-color), var(--principal-color));
      border-radius: var(--border-radius-small);
      color: var(--text-inverse);
    }

    .day-card__number {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-medium);
      text-align: center;
    }

    .day-card__summary {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .day-card__title {
      font-size: var(--font-size-tittle-h5);
      font-weight: var(--font-weight-semibold);
      color: var(--text-main);
      margin: 0;
      font-family: var(--font-primary);
    }

    .day-card__overview {
      font-size: var(--font-size-small);
      color: var(--text-secondary);
      margin: 0;
      line-height: var(--line-height-relaxed);
    }

    .day-card__toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: var(--quinary-color);
      transition: transform var(--transition-fast);
      font-size: var(--font-size-small);
      font-weight: var(--font-weight-bold);

      &--open {
        transform: rotate(180deg);
      }
    }

    .day-card__content {
      border-top: var(--border-thin) solid var(--border-color);
      background-color: var(--bg-surface);
      padding: var(--spacing-6);
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
      }
      to {
        opacity: 1;
        max-height: 500px;
      }
    }

    .day-card__activities {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
    }

    .activity {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: var(--spacing-4);
      padding-bottom: var(--spacing-4);
      border-bottom: var(--border-thin) solid var(--border-color);

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    .activity__time {
      font-weight: var(--font-weight-semibold);
      color: var(--quinary-color);
      font-size: var(--font-size-medium);
      font-family: var(--font-secondary);
    }

    .activity__details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .activity__title {
      font-size: var(--font-size-medium);
      font-weight: var(--font-weight-semibold);
      color: var(--text-main);
      margin: 0;
      font-family: var(--font-primary);
    }

    .activity__description {
      font-size: var(--font-size-small);
      color: var(--text-secondary);
      margin: 0;
      line-height: var(--line-height-relaxed);
    }

    @media (max-width: 768px) {
      .itinerary__info {
        grid-template-columns: 1fr;
      }

      .day-card__header {
        grid-template-columns: 60px 1fr auto;
        gap: var(--spacing-3);
        padding: var(--spacing-3) var(--spacing-4);
      }

      .day-card__day-number {
        width: 60px;
        height: 60px;
      }

      .activity {
        grid-template-columns: 70px 1fr;
        gap: var(--spacing-3);
      }
    }

    @media (max-width: 640px) {
      .day-card__header {
        grid-template-columns: 1fr;
      }

      .day-card__day-number {
        width: 100%;
      }

      .day-card__toggle {
        position: absolute;
        right: var(--spacing-4);
        top: 50%;
        transform: translateY(-50%);
      }

      .activity {
        grid-template-columns: 1fr;
      }

      .activity__time {
        order: -1;
      }
    }
  `]
})
export class ItineraryComponent {
  expandedDayId: number | null = null;

  currentItinerary: Itinerary = {
    id: 'itinerary-001',
    trip: 'Barcelona, España',
    startDate: '15 de Noviembre, 2025',
    endDate: '18 de Noviembre, 2025',
    duration: 4,
    days: [
      {
        day: 1,
        date: '15 de Noviembre',
        title: 'Llegada y exploración del Barrio Gótico',
        overview: 'Recepción en hotel, tour guiado por las calles medievales del Barrio Gótico',
        activities: [
          {
            time: '14:00',
            activity: 'Check-in Hotel',
            description: 'Llegada al hotel 4 estrellas en el centro de Barcelona'
          },
          {
            time: '16:00',
            activity: 'Tour Barrio Gótico',
            description: 'Paseo guiado por las calles medievales, Catedral Gótica y plazas históricas'
          },
          {
            time: '19:00',
            activity: 'Cena tradicional',
            description: 'Cena en restaurante local con platos típicos catalanes'
          }
        ]
      },
      {
        day: 2,
        date: '16 de Noviembre',
        title: 'Sagrada Familia y Parque Güell',
        overview: 'Visita a los monumentos más icónicos de Gaudí en Barcelona',
        activities: [
          {
            time: '09:00',
            activity: 'Sagrada Familia',
            description: 'Tour completo a la Basílica de la Sagrada Familia con audioguía'
          },
          {
            time: '12:30',
            activity: 'Almuerzo',
            description: 'Pausa para almuerzo en café cercano'
          },
          {
            time: '14:00',
            activity: 'Parque Güell',
            description: 'Visita a los jardines del Parque Güell con vistas a la ciudad'
          },
          {
            time: '18:00',
            activity: 'Espectáculo flamenco',
            description: 'Show de flamenco tradicional en tablao barcelonés'
          }
        ]
      },
      {
        day: 3,
        date: '17 de Noviembre',
        title: 'Playa y vida nocturna',
        overview: 'Relajación en playas barcelonesas y experiencia gastronómica',
        activities: [
          {
            time: '08:00',
            activity: 'Desayuno en hotel',
            description: 'Buffet completo en la terraza del hotel'
          },
          {
            time: '10:00',
            activity: 'Playa Barceloneta',
            description: 'Tiempo libre en una de las playas más populares de Barcelona'
          },
          {
            time: '13:00',
            activity: 'Paella a orilla de playa',
            description: 'Almuerzo con paella marinera y vistas al Mediterráneo'
          },
          {
            time: '20:00',
            activity: 'Cena en Port Vell',
            description: 'Cena gourmet en restaurante con vistas al puerto'
          }
        ]
      },
      {
        day: 4,
        date: '18 de Noviembre',
        title: 'Última mañana y retorno',
        overview: 'Compras, despedida y traslado al aeropuerto',
        activities: [
          {
            time: '09:00',
            activity: 'Compras en La Rambla',
            description: 'Tiempo libre para comprar souvenirs en la famosa avenida'
          },
          {
            time: '12:00',
            activity: 'Almuerzo de despedida',
            description: 'Últimas compras en Paseo de Gracia'
          },
          {
            time: '14:00',
            activity: 'Check-out y traslado',
            description: 'Salida del hotel con traslado privado al aeropuerto'
          }
        ]
      }
    ]
  };

  toggleDay(dayId: number): void {
    this.expandedDayId = this.expandedDayId === dayId ? null : dayId;
  }
}
