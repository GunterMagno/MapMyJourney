import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  HostListener,
  Renderer2
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tooltip component.
 * Features:
 * - Show/hide on hover using @HostListener
 * - Secure positioning with Renderer2
 * - Configurable position (top, bottom, left, right)
 * - FASE 1: DOM Manipulation and Events
 */
@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.scss'
})
export class TooltipComponent {
  @Input() text: string = '';
  @Input() position: TooltipPosition = 'top';
  @ViewChild('tooltipContent') tooltipContent!: ElementRef;

  isVisible = false;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  /**
   * FASE 1: Event Binding - Show tooltip on mouse enter
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showTooltip();
  }

  /**
   * FASE 1: Event Binding - Hide tooltip on mouse leave
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideTooltip();
  }

  /**
   * Shows tooltip with animation.
   */
  private showTooltip(): void {
    this.isVisible = true;
  }

  /**
   * Hides tooltip.
   */
  private hideTooltip(): void {
    this.isVisible = false;
  }

  /**
   * Gets CSS class for tooltip position.
   */
  getTooltipClass(): string {
    return `tooltip tooltip--${this.position}`;
  }
}
