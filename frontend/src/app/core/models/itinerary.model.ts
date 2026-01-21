/**
 * Itinerary Models - Entidades principales para la gestión del itinerario
 * FASE 5: Drag & Drop y gestión de actividades
 */

export type ItineraryItemType = 'ACTIVITY' | 'TRANSITION';

/**
 * Representa una actividad o transición en el itinerario
 */
export interface ItineraryItem {
  id: string;
  type: ItineraryItemType;
  title: string;
  time: string; // Formato HH:mm
  duration: number; // En minutos
  description?: string;
  location?: string;
  isCompleted: boolean;
  category?: string; // Para actividades (ej: 'MUSEUM', 'RESTAURANT', 'TRANSPORT')
  order?: number; // Posición en la lista
}

/**
 * Representa un día completo del itinerario con sus actividades
 */
export interface ItineraryDay {
  id?: string;
  date: Date;
  dayIndex: number;
  items: ItineraryItem[];
  isCompleted: boolean;
  title?: string; // Ej: "Día 1: Barcelona"
}

/**
 * DTO para crear una nueva actividad
 */
export interface CreateItineraryItemDto {
  type: ItineraryItemType;
  title: string;
  time: string;
  duration: number;
  description?: string;
  location?: string;
  category?: string;
}

/**
 * Payload para reordenar actividades
 */
export interface ReorderItineraryItemPayload {
  itemId: string;
  previousIndex: number;
  currentIndex: number;
  dayIndex: number;
}

/**
 * Payload para toggle de completitud
 */
export interface ToggleCompletionPayload {
  itemId: string;
  isCompleted: boolean;
}
