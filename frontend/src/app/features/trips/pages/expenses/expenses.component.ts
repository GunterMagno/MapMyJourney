import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="placeholder"><h1>Gastos</h1><p>Página de Gastos - Próximamente</p></div>',
  styles: ['.placeholder { padding: 2rem; text-align: center; }']
})
export class ExpensesComponent {}
