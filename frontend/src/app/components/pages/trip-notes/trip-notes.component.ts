import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { TripNotesService } from '../../../features/trips/services/tripNotes.service';
import { CreateActivityDto } from '../../../features/trips/models/itinerary.model';
import { NoteCardComponent } from '../../shared/note-card/note-card';


@Component({
  selector: 'app-trip-notes',
  imports: [
    CommonModule,
    NoteCardComponent
  ],
  templateUrl: './trip-notes.component.html',
  styleUrl: './trip-notes.component.scss',
})
export class NotesComponent {
 
  private tripNoteService = inject(TripNotesService);

  // Notas de ejemplo
  notes = [
    {
      id: 1,
      content: 'Recordar llevar cámara para las fotos del atardecer',
      createdAt: '2026-02-10'
    },
    {
      id: 2,
      content: 'Reservar mesa en el restaurante El Mirador para el viernes',
      createdAt: '2026-02-11'
    },
    {
      id: 3,
      content: 'Comprar tickets para el museo con antelación',
      createdAt: '2026-02-12'
    }
  ];

  ngOnInit(tripId: number): void {
    this.loadNotes(tripId);
  }
  
  private loadNotes(tripId: number): void{
    this.tripNoteService.getNotes(tripId)
  }

  private createNote(tripId: number, dto: CreateActivityDto): void{
    this.createNote(tripId, dto)
  }
}