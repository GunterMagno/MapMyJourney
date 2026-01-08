/**
 * Expense Model - Entidad de Gasto en MapMyJourney
 */
export interface Expense {
  id: string;
  tripId: string;
  payerId: string; // Usuario que pagó
  amount: number;
  description: string;
  category: 'ACCOMMODATION' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'OTHER';
  date: string; // ISO 8601
  participants: string[]; // IDs de usuarios que participan en el gasto
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  tripId: string;
  payerId: string;
  amount: number;
  description: string;
  category: 'ACCOMMODATION' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'OTHER';
  date: string;
  participants: string[];
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {
  id: string;
}

export interface ExpenseWithDetails extends Expense {
  payer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  participantDetails: {
    id: string;
    name: string;
    email: string;
    shareAmount: number;
  }[];
}
