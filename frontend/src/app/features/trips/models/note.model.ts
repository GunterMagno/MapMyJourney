export interface Note {
  id: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  tripId?: number;
}

export interface CreateNoteDto {
  content: string;
}

export interface UpdateNoteDto {
  content: string;
}
