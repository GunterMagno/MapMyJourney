import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { TripNotesService } from '../../../features/trips/services/tripNotes.service';
import { CreateActivityDto } from '../../../features/trips/models/itinerary.model';


@Component({
  selector: 'app-trip-notes',
  imports: [
    ],
  templateUrl: './trip-notes.component.html',
  styleUrl: './trip-notes.component.scss',
})
export class NotesComponent {
 
  private tripNoteService = inject(TripNotesService);

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