import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Task Item Component - Fase 5: Multimedia Optimizada
 * 
 * Micro-interacción: Animación bounce al marcar como completado
 * - Solo usa transform y opacity para 60fps
 * - Duración: 400ms (RA4: 150-500ms)
 * - Usada en: Itinerarios de viajes
 */
@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getTaskClasses()">
      <input 
        type="checkbox" 
        class="task-item__checkbox"
        [checked]="completed"
        (change)="onToggle()">
      <label class="task-item__label">
        {{ title }}
      </label>
      @if (completed) {
        <span class="task-checkmark">✓</span>
      }
    </div>
  `,
  styles: [`
    .task-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      border-radius: var(--border-radius-small);
      background-color: var(--bg-surface);
      transition: background-color 200ms ease;

      &:hover {
        background-color: var(--bg-light);
      }

      &--completed {
        animation: task-completion-bounce 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        
        .task-item__label {
          text-decoration: line-through;
          color: var(--text-secondary);
        }
      }
    }

    .task-item__checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: var(--principal-color);
    }

    .task-item__label {
      flex: 1;
      cursor: pointer;
      color: var(--text-main);
      transition: color 200ms ease;
    }

    .task-checkmark {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background-color: var(--principal-color);
      color: white;
      border-radius: 50%;
      font-size: var(--font-size-small);
      animation: task-checkmark-pop 350ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItemComponent {
  @Input() title: string = '';
  @Input() completed: boolean = false;
  @Output() completedChange = new EventEmitter<boolean>();

  getTaskClasses(): string {
    const classes = ['task-item'];
    if (this.completed) {
      classes.push('task-item--completed');
    }
    return classes.join(' ');
  }

  onToggle(): void {
    this.completed = !this.completed;
    this.completedChange.emit(this.completed);
  }
}
