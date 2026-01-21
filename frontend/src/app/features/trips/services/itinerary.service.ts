import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Activity, ItineraryDay, CreateActivityDto, ItineraryReorderPayload } from '../models/itinerary.model';

@Injectable({
  providedIn: 'root'
})
export class ItineraryService {
  private apiUrl = '/api/trips';
  
  // Signals
  activities = signal<Activity[]>([]);
  days = signal<ItineraryDay[]>([]);
  selectedDayIndex = signal<number>(0);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed
  activitiesByDay = computed(() => {
    const allActivities = this.activities();
    const dayIndex = this.selectedDayIndex();
    return allActivities.filter(a => a.dayIndex === dayIndex).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  // Subject para cambios
  private activitiesUpdated$ = new Subject<Activity[]>();

  constructor(private http: HttpClient) {}

  /**
   * Inicializar itinerario para un viaje
   */
  initializeItinerary(tripId: number, startDate: string, endDate: string): void {
    this.isLoading.set(true);
    this.http
      .get<{
        days: ItineraryDay[];
        activities: Activity[];
      }>(`${this.apiUrl}/${tripId}/itinerary`)
      .subscribe({
        next: (data) => {
          this.days.set(data.days);
          this.activities.set(data.activities);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          this.error.set('Error al cargar el itinerario');
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Crear nueva actividad
   */
  createActivity(tripId: number, dto: CreateActivityDto) {
    return this.http
      .post<Activity>(`${this.apiUrl}/${tripId}/activities`, dto);
  }

  /**
   * Eliminar actividad
   */
  deleteActivity(tripId: number, activityId: string) {
    return this.http
      .delete(`${this.apiUrl}/${tripId}/activities/${activityId}`);
  }

  /**
   * Actualizar actividad
   */
  updateActivity(tripId: number, activityId: string, updates: Partial<Activity>) {
    return this.http
      .put<Activity>(`${this.apiUrl}/${tripId}/activities/${activityId}`, updates);
  }

  /**
   * Reordenar actividades (Drag & Drop)
   */
  reorderActivities(tripId: number, reorderedActivities: Activity[]): void {
    const payload: ItineraryReorderPayload = {
      tripId,
      activities: reorderedActivities.map((a, idx) => ({
        id: a.id!,
        order: idx,
        dayIndex: a.dayIndex
      }))
    };

    this.http
      .put(`${this.apiUrl}/${tripId}/itinerary/reorder`, payload)
      .subscribe({
        next: () => {
          this.activities.set(reorderedActivities);
          this.activitiesUpdated$.next(reorderedActivities);
        },
        error: (err: any) => {
          this.error.set('Error al reordenar las actividades');
        }
      });
  }

  /**
   * Cambiar selección de día
   */
  selectDay(dayIndex: number): void {
    this.selectedDayIndex.set(dayIndex);
  }

  /**
   * Obtener días del itinerario
   */
  getDays(): ItineraryDay[] {
    return this.days();
  }

  /**
   * Obtener actividades por viaje
   */
  getActivitiesByTrip(tripId: number) {
    return this.http.get<Activity[]>(`${this.apiUrl}/${tripId}/activities`);
  }

  /**
   * Observable de cambios en actividades
   */
  getActivitiesUpdated$() {
    return this.activitiesUpdated$.asObservable();
  }
}
