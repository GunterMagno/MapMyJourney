import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TripNotesService } from '../../../features/trips/services/tripNotes.service';
import { Note } from '../../../features/trips/models/note.model';
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
export class NotesComponent implements OnInit {
 
  private tripNoteService = inject(TripNotesService);
  private route = inject(ActivatedRoute);

  notes: Note[] = [];
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    const tripId = this.route.snapshot.params['id'];
    if (tripId) {
      this.loadNotes(Number(tripId));
    }

    this.loadMockNotes();
  }
  
  private loadNotes(tripId: number): void {
    this.tripNoteService.getNotes(tripId);
    
    this.tripNoteService.notes();
    this.notes = this.tripNoteService.notes();
    this.isLoading = this.tripNoteService.isLoading();
    this.error = this.tripNoteService.error();
  }

  private loadMockNotes(): void {
    this.notes = [
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
  }   
}