/**
 * Trip Model - Entidad de Viaje en MapMyJourney
 */
export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'OWNER' | 'PARTICIPANT';
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
  imageUrl?: string;
  participantIds: string[]; // IDs de usuarios
  ownerId: string;
  status: 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  totalExpenses: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripDto {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
}

export interface UpdateTripDto extends Partial<CreateTripDto> {
  id: string;
}

export interface TripDetail extends Trip {
  participantIds: string[]; // Sobreescritura innecesaria pero explícita
  participants: Participant[];
  expenses: {
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    date: string;
  }[];
}
