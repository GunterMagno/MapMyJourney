import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-polls',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="placeholder"><h1>Votaciones</h1><p>Página de Votaciones - Próximamente</p></div>',
  styles: ['.placeholder { padding: 2rem; text-align: center; }']
})
export class PollsComponent {}
