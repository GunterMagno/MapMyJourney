import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './note-card.html',
  styleUrl: './note-card.scss'
})
export class NoteCardComponent {

  @Input() content?: string;

  @Input() createdAt?: string;

  @Input() variant: 'vertical' | 'horizontal' = 'vertical';

  getCardClasses(): string {
    const classes = ['note-card'];

    if (this.variant === 'horizontal') {
      classes.push('note-card--horizontal');
    }

    return classes.join(' ');
  }
}
