import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente Card reutilizable
 *
 * Variantes: vertical (por defecto) | horizontal
 *
 * Propiedades:
 * - title: Título de la tarjeta
 * - description: Descripción o contenido
 * - image: URL de la imagen (opcional)
 * - variant: vertical | horizontal
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.scss'
})
export class CardComponent {
  // Título de la tarjeta
  @Input() title: string = '';

  // Descripción o contenido principal
  @Input() description: string = '';

  // URL de la imagen (opcional)
  @Input() image?: string;

  // Variante de layout: vertical (por defecto) o horizontal
  @Input() variant: 'vertical' | 'horizontal' = 'vertical';

  getCardClasses(): string {
    const classes = ['card'];

    if (this.variant === 'horizontal') {
      classes.push('card--horizontal');
    }

    return classes.join(' ');
  }
}
