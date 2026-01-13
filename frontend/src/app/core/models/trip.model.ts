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
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  description?: string;
  tripCode?: string;
  imageUrl?: string;
  participantIds?: string[]; // IDs de usuarios
  ownerId?: string;
  status?: 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  totalExpenses?: number;
  createdAt?: string;
  updatedAt?: string;
  currentUserRole?: string;
  members?: any[];
}

export interface CreateTripDto {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
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
