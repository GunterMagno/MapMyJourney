import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ItineraryStore } from '../../../../core/store/itinerary.store';
import { TripService } from '../../../../core/services/trip.service';
import { ItineraryDay, ItineraryItem } from '../../../../core/models/itinerary.model';
import { CreateActivityModalComponent } from './create-activity-modal/create-activity-modal.component';

// Colores cíclicos para los días (5 colores alternados)
const DAY_COLORS = [
  'var(--principal-color)',      // Rosa
  'var(--secondary-color)',      // Naranja
  'var(--quinary-color-disabled)',  // Amarillo
  'var(--quaternary-color)',     // Verde Agua
  '#9C27B0'                      // Morado
];

@Component({
  selector: 'app-itinerary-page',
  standalone: true,
  imports: [CommonModule, DragDropModule, CreateActivityModalComponent],
  templateUrl: './itinerary-page.component.html',
  styleUrl: './itinerary-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItineraryPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  
  constructor(
    private itineraryStore: ItineraryStore
  ) {}

  /**
   * Señales locales
   */
  showAddActivityModal = signal<boolean>(false);
  activityToEdit = signal<ItineraryItem | null>(null);

  /**
   * Computed: Todos los días del itinerario
   */
  days = computed(() => this.itineraryStore.days());

  /**
   * Computed: Día seleccionado actualmente
   */
  selectedDay = computed(() => this.itineraryStore.selectedDay());

  /**
   * Computed: Items del día seleccionado
   */
  selectedDayItems = computed(() => this.itineraryStore.selectedDayItems());

  /**
   * Computed: Índice del día seleccionado
   */
  selectedDayIndex = computed(() => this.itineraryStore.selectedDayIndex());

  /**
   * Computed: Progreso del día seleccionado
   */
  dayProgress = computed(() => this.itineraryStore.selectedDayProgress());

  /**
   * Computed: Progreso total del viaje
   */
  totalProgress = computed(() => this.itineraryStore.getTotalProgress());

  ngOnInit(): void {
    // Obtener ID del viaje desde la ruta
    const tripId = this.route.parent?.snapshot.paramMap.get('id');
    
    if (tripId) {
      // Cargar datos del viaje desde el servicio
      this.tripService.getTripById(parseInt(tripId)).subscribe({
        next: (trip) => {
          // Inicializar días basado en las fechas del viaje
          this.itineraryStore.initializeDays(trip.startDate, trip.endDate);
          
          // Asegurar que el primer día está seleccionado
          if (this.days().length > 0 && this.selectedDayIndex() < 0) {
            this.selectDay(0);
          }
        },
        error: (err) => {
          console.error('Error cargando datos del viaje:', err);
          // Fallback: inicializar con fechas por defecto
          const today = new Date();
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          this.itineraryStore.initializeDays(today, nextWeek);
          this.selectDay(0);
        }
      });
    } else {
      // Sin ID de viaje, crear días de demostración
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      this.itineraryStore.initializeDays(today, nextWeek);
      this.selectDay(0);
    }
  }

  /**
   * Toggle del tema oscuro
   */
  toggleDarkMode(): void {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  }

  /**
   * Manejador para el evento drop de CDK
   * @param event Evento del drop
   */
  onDrop(event: CdkDragDrop<ItineraryItem[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      this.itineraryStore.moveItem(event.previousIndex, event.currentIndex);
    }
  }

  /**
   * Seleccionar un día
   * @param dayIndex Índice del día a seleccionar
   */
  selectDay(dayIndex: number): void {
    this.itineraryStore.selectDay(dayIndex);
  }

  /**
   * Toggle de completitud de un item
   * @param itemId ID del item
   */
  toggleItemCompletion(itemId: string): void {
    this.itineraryStore.toggleItemCompletion(itemId);
  }

  /**
   * Toggle de completitud del día completo
   */
  toggleDayCompletion(): void {
    const currentDay = this.selectedDay();
    if (currentDay) {
      this.itineraryStore.toggleDayCompletion(
        this.selectedDayIndex(),
        !currentDay.isCompleted
      );
    }
  }

  /**
   * Abrir modal para agregar actividad
   */
  openAddActivityModal(): void {
    this.showAddActivityModal.set(true);
  }

  /**
   * Abrir modal para editar una actividad
   * @param item Item a editar
   */
  openEditActivityModal(item: ItineraryItem): void {
    this.activityToEdit.set(item);
    this.showAddActivityModal.set(true);
  }

  /**
   * Cerrar modal
   */
  closeActivityModal(result: ItineraryItem | null): void {
    this.showAddActivityModal.set(false);
    this.activityToEdit.set(null);
    // No llamar a saveActivity aquí - el modal ya lo hizo
  }

  /**
   * Guardar una nueva actividad
   * @param item Actividad a guardar
   */
  saveActivity(item: ItineraryItem): void {
    this.itineraryStore.addItem(item);
  }

  /**
   * Eliminar una actividad
   * @param itemId ID del item a eliminar
   */
  deleteActivity(itemId: string): void {
    this.itineraryStore.removeItem(itemId);
  }

  /**
   * Obtener clase CSS para el tipo de item
   * @param type Tipo de item
   */
  getItemTypeClass(type: string): string {
    return `item--${type.toLowerCase()}`;
  }

  /**
   * Formato para mostrar la duración
   * @param minutes Duración en minutos
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  /**
   * Obtener hora final estimada
   * @param startTime Hora de inicio (HH:mm)
   * @param duration Duración en minutos
   */
  calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Capitalizar la primera letra de un string
   */
  capitalize(str: string | null): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}
