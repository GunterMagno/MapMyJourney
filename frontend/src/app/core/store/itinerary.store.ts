/**
 * Itinerary Store - Gestión de estado global del itinerario con Signals
 * FASE 5: Drag & Drop
 */

import { Injectable, computed, signal } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ItineraryDay, ItineraryItem } from '../models/itinerary.model';

/**
 * Store centralizado para la gestión del estado del itinerario
 * Utiliza Signals de Angular para reactividad
 */
@Injectable({
  providedIn: 'root'
})
export class ItineraryStore {
  /**
   * Array de días con sus actividades
   */
  private readonly _days = signal<ItineraryDay[]>([]);
  days = this._days.asReadonly();

  /**
   * Índice del día seleccionado actualmente
   */
  private readonly _selectedDayIndex = signal<number>(0);
  selectedDayIndex = this._selectedDayIndex.asReadonly();

  /**
   * Computed Signal que devuelve los items del día seleccionado
   */
  selectedDayItems = computed(() => {
    const days = this.days();
    const index = this.selectedDayIndex();
    if (index >= 0 && index < days.length) {
      return days[index].items;
    }
    return [];
  });

  /**
   * Computed Signal para el día seleccionado completo
   */
  selectedDay = computed(() => {
    const days = this.days();
    const index = this.selectedDayIndex();
    if (index >= 0 && index < days.length) {
      return days[index];
    }
    return null;
  });

  /**
   * Computed Signal para el progreso de completitud del día seleccionado
   */
  selectedDayProgress = computed(() => {
    const items = this.selectedDayItems();
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.isCompleted).length;
    return Math.round((completed / items.length) * 100);
  });

  constructor() {
    // No inicializar datos en el constructor
    // Los datos se cargarán desde el componente con initializeDays()
  }

  /**
   * Inicializa los días del itinerario basado en las fechas del viaje
   * @param startDate Fecha de inicio del viaje
   * @param endDate Fecha de fin del viaje
   */
  initializeDays(startDate: Date | string, endDate: Date | string): void {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    // Generar todos los días entre start y end
    const days: ItineraryDay[] = [];
    const currentDate = new Date(start);
    let dayIndex = 0;

    while (currentDate <= end) {
      const dateKey = new Date(currentDate);
      
      // Formatear fecha en formato "Jueves, 17 Enero"
      const dayTitle = dateKey.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }).replace(/^\w/, char => char.toUpperCase());
      
      // Sin datos mock - array vacío que se llenará desde el modal
      const dayItems: ItineraryItem[] = [];

      days.push({
        date: dateKey,
        dayIndex: dayIndex,
        items: dayItems,
        isCompleted: false,
        title: dayTitle
      });

      // Avanzar un día
      currentDate.setDate(currentDate.getDate() + 1);
      dayIndex++;
    }

    this._days.set(days);
  }

  /**
   * Establecer días desde datos externos
   */
  setDays(days: ItineraryDay[]): void {
    this._days.set(days);
  }

  /**
   * Seleccionar un día por su índice
   */
  selectDay(dayIndex: number): void {
    const days = this.days();
    if (dayIndex >= 0 && dayIndex < days.length) {
      this._selectedDayIndex.set(dayIndex);
    }
  }

  /**
   * Reordena un item dentro del día seleccionado
   * @param previousIndex Índice anterior
   * @param currentIndex Nuevo índice
   */
  moveItem(previousIndex: number, currentIndex: number): void {
    const days = this._days();
    const dayIndex = this.selectedDayIndex();

    if (dayIndex >= 0 && dayIndex < days.length) {
      const updatedDays = structuredClone(days);
      const items = updatedDays[dayIndex].items;

      if (
        previousIndex >= 0 &&
        previousIndex < items.length &&
        currentIndex >= 0 &&
        currentIndex < items.length
      ) {
        moveItemInArray(items, previousIndex, currentIndex);

        // Actualizar el orden de los items
        items.forEach((item, index) => {
          item.order = index;
        });

        this._days.set(updatedDays);
      }
    }
  }

  /**
   * Toggle de completitud de un item
   * @param itemId ID del item a actualizar
   */
  toggleItemCompletion(itemId: string): void {
    const days = this._days();
    const dayIndex = this.selectedDayIndex();

    if (dayIndex >= 0 && dayIndex < days.length) {
      const updatedDays = structuredClone(days);
      const items = updatedDays[dayIndex].items;
      const item = items.find(i => i.id === itemId);

      if (item) {
        item.isCompleted = !item.isCompleted;

        // Marcar el día como completo si todas sus actividades lo están
        const allCompleted = items.every(i => i.isCompleted);
        updatedDays[dayIndex].isCompleted = allCompleted;

        this._days.set(updatedDays);
      }
    }
  }

  /**
   * Marcar un día completo como completado/incompleto
   * @param dayIndex Índice del día
   * @param isCompleted Estado de completitud
   */
  toggleDayCompletion(dayIndex: number, isCompleted: boolean): void {
    const days = this._days();

    if (dayIndex >= 0 && dayIndex < days.length) {
      const updatedDays = structuredClone(days);
      updatedDays[dayIndex].isCompleted = isCompleted;

      // Si se marca el día como incompleto, desmarcar todos los items
      if (!isCompleted) {
        updatedDays[dayIndex].items.forEach(item => {
          item.isCompleted = false;
        });
      }

      this._days.set(updatedDays);
    }
  }

  /**
   * Agregar un nuevo item al día seleccionado
   * @param item Nuevo item a agregar
   */
  addItem(item: ItineraryItem): void {
    const days = this._days();
    const dayIndex = this.selectedDayIndex();

    if (dayIndex >= 0 && dayIndex < days.length) {
      const updatedDays = structuredClone(days);
      const items = updatedDays[dayIndex].items;

      // Asignar orden automática
      item.order = items.length;

      items.push(item);
      this._days.set(updatedDays);
    }
  }

  /**
   * Eliminar un item del día seleccionado
   * @param itemId ID del item a eliminar
   */
  removeItem(itemId: string): void {
    const days = this._days();
    const dayIndex = this.selectedDayIndex();

    if (dayIndex >= 0 && dayIndex < days.length) {
      const updatedDays = structuredClone(days);
      const items = updatedDays[dayIndex].items;
      const index = items.findIndex(i => i.id === itemId);

      if (index !== -1) {
        items.splice(index, 1);

        // Actualizar órdenes
        items.forEach((item, idx) => {
          item.order = idx;
        });

        this._days.set(updatedDays);
      }
    }
  }

  /**
   * Obtener todos los días
   */
  getAllDays(): ItineraryDay[] {
    return this.days();
  }

  /**
   * Obtener el progreso total del viaje
   */
  getTotalProgress(): number {
    const days = this.days();
    const allItems = days.flatMap(day => day.items);
    if (allItems.length === 0) return 0;
    const completed = allItems.filter(item => item.isCompleted).length;
    return Math.round((completed / allItems.length) * 100);
  }
}
