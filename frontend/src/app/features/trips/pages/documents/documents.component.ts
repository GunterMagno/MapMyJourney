import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="placeholder"><h1>Documentos</h1><p>Página de Documentos - Próximamente</p></div>',
  styles: ['.placeholder { padding: 2rem; text-align: center; }']
})
export class DocumentsComponent {}
