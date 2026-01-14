import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-itinerary',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="placeholder"><h1>Itinerario</h1><p>Página de Itinerario - Próximamente</p></div>',
  styles: ['.placeholder { padding: 2rem; text-align: center; }']
})
export class ItineraryComponent {}
