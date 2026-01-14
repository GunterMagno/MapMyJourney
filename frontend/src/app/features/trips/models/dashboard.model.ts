/**
 * Modelos de datos para el Dashboard del Viaje
 */

export interface ItineraryDay {
  date: string; // "17 OCT"
  activities: string[];
  isCompleted: boolean;
  dayNumber?: number; // Para referencia
}

export interface DocumentItem {
  id?: string;
  name: string;
  isComplete: boolean;
  count: string; // "4/4"
}

export interface ExpenseItem {
  id?: number;
  description: string;
  paidBy: string;
  date: string;
  amount: number;
}

export interface ExpenseSummary {
  total: number;
  items: ExpenseItem[];
}

export interface PollOption {
  name: string;
  votes: number;
}

export interface Poll {
  id?: string;
  question: string;
  options: PollOption[];
}

export interface DashboardData {
  itinerary: ItineraryDay[];
  documents: DocumentItem[];
  expenses: ExpenseSummary;
  polls: Poll[];
}
