import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Note, CreateNoteDto } from "../models/note.model";

@Injectable({
  providedIn: 'root'
})
export class TripNotesService {

    private apiUrl = '/api/trips';

    notes = signal<Note[]>([]);
    isLoading = signal(false);
    error = signal<string | null>(null);


    constructor(private http: HttpClient) {}

    getNotes(tripId: number){
        this.isLoading.set(true);
        this.error.set(null);
        this.http.get<Note[]>(`${this.apiUrl}/${tripId}/notes`)
        .subscribe({
            next: (data) => {
                this.notes.set(data);
                this.isLoading.set(false);
            },
            error: (err: any) => {
                this.error.set('Error al cargar las notas');
                this.isLoading.set(false);
            }
        })
    }

    createNote(tripId: number, dto: CreateNoteDto){
        return this.http.post<Note>(`${this.apiUrl}/${tripId}/notes`, dto);
    }
}