import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ItineraryDayState {
  tripId: number;
  dayIndex: number;
  date: string;
  activities: string[];
  isCompleted: boolean;
}

/**
 * Servicio para gestionar el estado compartido del itinerario entre componentes
 */
@Injectable({
  providedIn: 'root'
})
export class ItineraryStateService {
  private itineraryStates = new Map<string, BehaviorSubject<ItineraryDayState[]>>();

  /**
   * Obtiene el observable del itinerario para un viaje específico
   */
  getItineraryState(tripId: number): Observable<ItineraryDayState[]> {
    const key = this.getTripKey(tripId);
    if (!this.itineraryStates.has(key)) {
      this.itineraryStates.set(key, new BehaviorSubject<ItineraryDayState[]>([]));
    }
    return this.itineraryStates.get(key)!.asObservable();
  }

  /**
   * Obtiene el valor actual del itinerario
   */
  getCurrentItinerary(tripId: number): ItineraryDayState[] {
    const key = this.getTripKey(tripId);
    return this.itineraryStates.get(key)?.value || [];
  }

  /**
   * Inicializa el itinerario para un viaje
   */
  initializeItinerary(tripId: number, startDate: string, endDate: string): void {
    const days = this.generateItineraryDays(tripId, startDate, endDate);
    const key = this.getTripKey(tripId);
    
    if (!this.itineraryStates.has(key)) {
      this.itineraryStates.set(key, new BehaviorSubject<ItineraryDayState[]>(days));
    } else {
      // Solo actualizar si no hay días o si las fechas cambiaron
      const currentDays = this.itineraryStates.get(key)?.value || [];
      if (currentDays.length === 0 || this.datesChanged(currentDays, startDate, endDate)) {
        this.itineraryStates.get(key)?.next(days);
      }
    }
  }

  /**
   * Cambia el estado de completado de un día
   */
  toggleDayCompletion(tripId: number, dayIndex: number): void {
    const key = this.getTripKey(tripId);
    const subject = this.itineraryStates.get(key);
    
    if (subject) {
      const days = [...subject.value];
      if (dayIndex >= 0 && dayIndex < days.length) {
        days[dayIndex] = {
          ...days[dayIndex],
          isCompleted: !days[dayIndex].isCompleted
        };
        subject.next(days);
        
        // Aquí podrías agregar lógica para persistir en el backend
        console.log(`Day ${dayIndex} toggled for trip ${tripId}:`, days[dayIndex].isCompleted);
      }
    }
  }

  /**
   * Actualiza un día específico
   */
  updateDay(tripId: number, dayIndex: number, updates: Partial<ItineraryDayState>): void {
    const key = this.getTripKey(tripId);
    const subject = this.itineraryStates.get(key);
    
    if (subject) {
      const days = [...subject.value];
      if (dayIndex >= 0 && dayIndex < days.length) {
        days[dayIndex] = {
          ...days[dayIndex],
          ...updates
        };
        subject.next(days);
      }
    }
  }

  /**
   * Limpia el estado del itinerario para un viaje
   */
  clearItinerary(tripId: number): void {
    const key = this.getTripKey(tripId);
    this.itineraryStates.delete(key);
  }

  private getTripKey(tripId: number): string {
    return `trip_${tripId}`;
  }

  private generateItineraryDays(tripId: number, startDate: string, endDate: string): ItineraryDayState[] {
    const days: ItineraryDayState[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let current = new Date(start);
    let dayIndex = 0;
    
    while (current <= end) {
      days.push({
        tripId,
        dayIndex,
        date: current.toISOString(),
        activities: [],
        isCompleted: false
      });
      current.setDate(current.getDate() + 1);
      dayIndex++;
    }
    
    return days;
  }

  private datesChanged(currentDays: ItineraryDayState[], startDate: string, endDate: string): boolean {
    if (currentDays.length === 0) return true;
    
    const firstDay = new Date(currentDays[0].date);
    const lastDay = new Date(currentDays[currentDays.length - 1].date);
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    
    return firstDay.getTime() !== newStart.getTime() || lastDay.getTime() !== newEnd.getTime();
  }
}
