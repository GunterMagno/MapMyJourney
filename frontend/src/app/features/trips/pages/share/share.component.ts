import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="placeholder"><h1>Compartir</h1><p>Página de Compartir Viaje - Próximamente</p></div>',
  styles: ['.placeholder { padding: 2rem; text-align: center; }']
})
export class ShareComponent {}
