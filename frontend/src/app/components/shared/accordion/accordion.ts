import { Component, Input, HostListener, ViewChildren, QueryList, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * Accordion component - FASE 1: DOM Manipulation and Events
 * Features:
 * - Expand/collapse items with smooth animation
 * - Multiple items can be expanded simultaneously
 * - Accessible with ARIA attributes
 * - Event binding for toggle functionality
 * - Keyboard navigation (Arrow Keys, Home, End, Enter)
 */

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="accordion" role="region" (keydown)="handleKeyboardEvent($event)">
      <div *ngFor="let item of items; let i = index" class="accordion__item">
        <button
          #headerButton
          class="accordion__header"
          [attr.aria-expanded]="isOpen(item.id)"
          [attr.aria-controls]="'accordion-content-' + item.id"
          [attr.tabindex]="i === currentFocusIndex ? 0 : -1"
          (click)="toggleItem(item.id)"
          [disabled]="item.disabled"
          type="button"
        >
          <span class="accordion__title">{{ item.title }}</span>
          <span class="accordion__icon" [class.accordion__icon--open]="isOpen(item.id)">
            ▼
          </span>
        </button>

        <div
          *ngIf="isOpen(item.id)"
          class="accordion__content"
          [id]="'accordion-content-' + item.id"
          role="region"
          [@slideDown]
        >
          <div class="accordion__body">
            {{ item.content }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accordion {
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      overflow: hidden;
    }

    .accordion__item {
      border-bottom: 1px solid var(--border-color, #ddd);

      &:last-child {
        border-bottom: none;
      }
    }

    .accordion__header {
      width: 100%;
      padding: 16px;
      background: var(--bg-body);
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      color: var(--text-main);
      transition: background-color 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--bg-surface);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      &:focus {
        outline: 2px solid var(--primary-color, #0f7ca0);
        outline-offset: -2px;
      }
    }

    .accordion__title {
      text-align: left;
    }

    .accordion__icon {
      display: inline-block;
      transition: transform 0.3s ease;
      margin-left: 8px;
      flex-shrink: 0;

      &--open {
        transform: rotate(180deg);
      }
    }

    .accordion__content {
      overflow: hidden;
    }

    .accordion__body {
      padding: 16px;
      background: var(--bg-surface);
      color: var(--text-secondary);
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .accordion__header {
        padding: 12px;
        font-size: 14px;
      }

      .accordion__body {
        padding: 12px;
      }
    }
  `],
  animations: [
    trigger('slideDown', [
      state('void', style({
        height: '0',
        opacity: '0'
      })),
      transition(':enter', [
        animate('300ms ease-out', style({
          height: '*',
          opacity: '1'
        }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({
          height: '0',
          opacity: '0'
        }))
      ])
    ])
  ]
})
export class AccordionComponent {
  @Input() items: AccordionItem[] = [];
  @Input() allowMultiple: boolean = true;
  @ViewChildren('headerButton') headerButtons!: QueryList<ElementRef>;

  /**
   * Track which items are open
   */
  private openItems = new Set<string>();

  /**
   * CUMPLE CE6.e: Índice del elemento con foco para navegación por teclado
   */
  currentFocusIndex: number = 0;

  constructor(private renderer: Renderer2) {}

  /**
   * Permite:
   * - ArrowDown: siguiente item
   * - ArrowUp: item anterior
   * - Home: primer item
   * - End: último item
   * - Enter/Espacio: abrir/cerrar item
   */
  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.items.length === 0) {
      return;
    }

    switch (event.key) {
      // CUMPLE CE6.e: Flecha hacia abajo: siguiente item
      case 'ArrowDown':
        event.preventDefault();
        this.currentFocusIndex = (this.currentFocusIndex + 1) % this.items.length;
        this.focusItem(this.currentFocusIndex);
        break;

      // CUMPLE CE6.e: Flecha hacia arriba: item anterior
      case 'ArrowUp':
        event.preventDefault();
        this.currentFocusIndex =
          (this.currentFocusIndex - 1 + this.items.length) % this.items.length;
        this.focusItem(this.currentFocusIndex);
        break;

      // CUMPLE CE6.e: Home: primer item
      case 'Home':
        event.preventDefault();
        this.currentFocusIndex = 0;
        this.focusItem(0);
        break;

      // CUMPLE CE6.e: End: último item
      case 'End':
        event.preventDefault();
        this.currentFocusIndex = this.items.length - 1;
        this.focusItem(this.currentFocusIndex);
        break;

      // CUMPLE CE6.e: Enter o Espacio: abrir/cerrar item
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleItem(this.items[this.currentFocusIndex].id);
        break;

      default:
        break;
    }
  }

  /**
   * CUMPLE CE6.d: Establece el foco en un item específico usando Renderer2
   */
  private focusItem(index: number): void {
    if (this.headerButtons && this.headerButtons.length > index) {
      const buttonElement = this.headerButtons.toArray()[index].nativeElement;
      // CUMPLE CE6.d: Usa Renderer2 para manipular atributos de forma segura
      this.renderer.setAttribute(buttonElement, 'tabindex', '0');
      buttonElement.focus();
    }
  }

  /**
   * FASE 1: Event Binding - Toggle accordion item
   */
  toggleItem(itemId: string): void {
    if (this.openItems.has(itemId)) {
      this.openItems.delete(itemId);
    } else {
      // If only one item allowed at a time, close others
      if (!this.allowMultiple) {
        this.openItems.clear();
      }
      this.openItems.add(itemId);
    }
  }

  /**
   * Check if item is open
   */
  isOpen(itemId: string): boolean {
    return this.openItems.has(itemId);
  }

  /**
   * Close all items
   */
  closeAll(): void {
    this.openItems.clear();
  }

  /**
   * Open all items (if allowMultiple is true)
   */
  openAll(): void {
    if (this.allowMultiple) {
      this.items.forEach(item => {
        if (!item.disabled) {
          this.openItems.add(item.id);
        }
      });
    }
  }
}
