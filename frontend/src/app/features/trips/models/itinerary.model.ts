/**
 * Itinerary Models - Entidades de Itinerario en MapMyJourney
 */

export type ActivityType = 'ACTIVITY' | 'TRANSITION';
export type DurationUnit = 'MIN' | 'HOUR';

export interface Activity {
  id?: string;
  title: string;
  name?: string; // Alias para title
  type: ActivityType;
  startTime: string; // HH:mm format
  duration: number; // en minutos
  location?: string;
  notes?: string;
  isCompleted?: boolean;
  completed?: boolean; // Alias para isCompleted
  dayIndex: number;
  date?: string; // Formato YYYY-MM-DD
  order?: number;
  category?: string; // Para actividades (ej: 'MUSEUM', 'RESTAURANT', 'TRANSPORT')
  createdAt?: string;
  updatedAt?: string;
}

export interface ItineraryDay {
  date: Date;
  dayIndex: number;
  activities: Activity[];
  isOrganized?: boolean;
}

export interface CreateActivityDto {
  title: string;
  type: ActivityType;
  startTime: string;
  duration: number;
  durationUnit: DurationUnit;
  location?: string;
  notes?: string;
  dayIndex: number;
  category?: string;
}

export interface UpdateActivityDto extends Partial<CreateActivityDto> {
  id: string;
}

export interface ReorderActivityDto {
  activityId: string;
  newOrder: number;
  dayIndex: number;
}

export interface ItineraryReorderPayload {
  tripId: number;
  activities: Array<{
    id: string;
    order: number;
    dayIndex: number;
  }>;
}
