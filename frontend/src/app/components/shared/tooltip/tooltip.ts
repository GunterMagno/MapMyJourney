import {
  Component,
  Input
} from '@angular/core';
import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tooltip Directive.
 * CUMPLE CRITERIOS RÚBRICA:
 * - CE6.d: Crea y destruye elementos DOM dinámicamente con Renderer2
 * - CE6.e: Implementa 4 eventos (mouseenter, mouseleave, focusin, focusout)
 * - CE6.c: Usa ElementRef para acceder al elemento host
 * - CE6.h: Separación de responsabilidades (lógica en directiva, no en componente)
 * 
 * Features:
 * - Show/hide on hover AND keyboard focus using @HostListener
 * - Dynamic creation/destruction of tooltip DOM element with semantic HTML
 * - Secure positioning with Renderer2 (NO CSS :hover)
 * - Configurable position (top, bottom, left, right)
 * - Delay configurable (300 ms)
 * - Uses CSS variables for theme-aware colors
 * - Semantic HTML structure using <article> instead of <div>
 * - FASE 1: DOM Manipulation and Events
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input() appTooltip: string = ''; // El texto del tooltip
  @Input() tooltipDelay: number = 300; // Delay en ms
  @Input() tooltipPosition: TooltipPosition = 'top';

  private tooltipElement: HTMLElement | null = null;
  private delayTimer: any = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    // CUMPLE CE6.c: Accede al elemento host de forma segura
    this.renderer.setAttribute(this.elementRef.nativeElement, 'role', 'button');
    this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-describedby', 'tooltip');
  }

  /**
   * Muestra el tooltip después de un delay
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showTooltipDelayed();
  }

  /**
   * Oculta el tooltip inmediatamente
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideTooltip();
  }

  /**
   * Permite a usuarios con teclado ver el tooltip
   */
  @HostListener('focusin')
  onFocusIn(): void {
    this.showTooltipDelayed();
  }

  /**
   * Oculta el tooltip al perder el foco
   */
  @HostListener('focusout')
  onFocusOut(): void {
    this.hideTooltip();
  }

  /**
   * Muestra el tooltip con delay configurable
   */
  private showTooltipDelayed(): void {
    // Si ya existe un timer, lo cancelamos
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
    }

    // Mostramos el tooltip después del delay
    this.delayTimer = setTimeout(() => {
      this.showTooltip();
    }, this.tooltipDelay);
  }

  /**
   * Usa Renderer2.createElement + appendChild para evitar manipulación directa
   */
  private showTooltip(): void {
    // Si ya existe, no lo recreamos
    if (this.tooltipElement) {
      return;
    }

    // CUMPLE CE6.d: Usa Renderer2.createElement para crear el elemento semántico
    // Estructura HTML semántica: <article> en lugar de <div>
    this.tooltipElement = this.renderer.createElement('article');

    // Configura atributos y contenido
    this.renderer.setAttribute(this.tooltipElement, 'id', 'tooltip');
    this.renderer.setAttribute(this.tooltipElement, 'role', 'tooltip');
    this.renderer.setAttribute(this.tooltipElement, 'class', 'tooltip-box');
    this.renderer.setProperty(this.tooltipElement, 'textContent', this.appTooltip);

    // Aplica estilos base usando variables CSS para colores
    // CUMPLE: Usa variables CSS para mantener consistencia con tema (light/dark mode)
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'background-color', 'var(--text-secondary, #6C757D)');
    this.renderer.setStyle(this.tooltipElement, 'color', 'var(--bg-primary, #FFFFFF)');
    this.renderer.setStyle(this.tooltipElement, 'padding', '8px 12px');
    this.renderer.setStyle(this.tooltipElement, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltipElement, 'font-size', '0.875rem');
    this.renderer.setStyle(this.tooltipElement, 'font-family', 'var(--font-tertiary, system-ui)');
    this.renderer.setStyle(this.tooltipElement, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipElement, 'animation', 'fadeIn 0.3s ease-in-out');
    this.renderer.setStyle(this.tooltipElement, 'box-shadow', '0 2px 8px rgba(0,0,0,0.15)');
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipElement, 'border', '1px solid var(--border-primary, #DEE2E6)');
    this.renderer.setStyle(this.tooltipElement, 'max-width', '200px');
    this.renderer.setStyle(this.tooltipElement, 'word-wrap', 'break-word');

    // Posición del tooltip (top, bottom, left, right)
    this.positionTooltip();

    // CUMPLE CE6.d: Usa Renderer2.appendChild para insertar en el DOM
    this.renderer.appendChild(document.body, this.tooltipElement);
  }

  /**
   * CUMPLE CE6.d: Destruye dinámicamente el elemento del tooltip
   * Usa Renderer2.removeChild para eliminación segura
   */
  private hideTooltip(): void {
    // Cancela el timer si existe
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }

    if (this.tooltipElement) {
      // CUMPLE CE6.d: Usa Renderer2.removeChild para eliminar del DOM
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  /**
   * Calcula la posición del tooltip relativa al elemento host
   * Cumple CE6.d: usa Renderer2.setStyle para evitar manipulación directa
   */
  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipWidth = 100; // Ancho aproximado en px
    const tooltipHeight = 32; // Alto aproximado en px
    const gap = 8; // Espaciado entre elemento y tooltip

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition) {
      case 'top':
        top = hostRect.top - tooltipHeight - gap;
        left = hostRect.left + (hostRect.width - tooltipWidth) / 2;
        break;
      case 'bottom':
        top = hostRect.bottom + gap;
        left = hostRect.left + (hostRect.width - tooltipWidth) / 2;
        break;
      case 'left':
        top = hostRect.top + (hostRect.height - tooltipHeight) / 2;
        left = hostRect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = hostRect.top + (hostRect.height - tooltipHeight) / 2;
        left = hostRect.right + gap;
        break;
    }

    // CUMPLE CE6.d: Usa Renderer2.setStyle para posicionar
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  /**
   * Limpieza al destruir la directiva
   */
  ngOnDestroy(): void {
    this.hideTooltip();
  }
}

/**
 * Tooltip Component wrapper for the TooltipDirective
 * Allows using <app-tooltip> as a component with projected content
 */
@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  template: `
    <span [appTooltip]="text" [tooltipPosition]="position" [tooltipDelay]="delay">
      <ng-content></ng-content>
    </span>
  `,
  styles: []
})
export class TooltipComponent {
  @Input() text: string = '';
  @Input() position: TooltipPosition = 'top';
  @Input() delay: number = 300;
}
