import {
  Component,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Dynamic DOM Component - FASE 1: DOM Manipulation
 * Demonstrates createElement, appendChild, removeChild using Renderer2
 */

interface DynamicElement {
  id: string;
  content: string;
}

@Component({
  selector: 'app-dynamic-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dynamic-content">
      <div class="dynamic-content__controls">
        <h3>Manipulación Dinámica del DOM</h3>
        <button 
          (click)="addElement()" 
          class="btn-add"
          type="button">
          ➕ Añadir Elemento
        </button>
        <button 
          (click)="clearAll()" 
          class="btn-clear"
          type="button"
          [disabled]="elements.length === 0">
          🗑️ Limpiar Todo
        </button>
      </div>

      <div 
        #container 
        class="dynamic-content__container">
        <!-- Elementos creados dinámicamente con Renderer2 -->
      </div>

      <p class="dynamic-content__count">
        Elementos en el DOM: <strong>{{ elements.length }}</strong>
      </p>
    </div>
  `,
  styles: [`
    .dynamic-content {
      padding: 20px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 8px;
      background: var(--bg-surface);
    }

    h3 {
      margin: 0 0 16px 0;
      color: var(--text-main);
      font-size: 16px;
    }

    .dynamic-content__controls {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;

      h3 {
        margin: 0;
        flex: 1;
        min-width: 200px;
      }
    }

    .btn-add,
    .btn-clear {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-add {
      background: #4caf50;
      color: white;

      &:hover {
        background: #45a049;
        transform: translateY(-2px);
      }
    }

    .btn-clear {
      background: #f44336;
      color: white;

      &:hover:not(:disabled) {
        background: #da190b;
        transform: translateY(-2px);
      }

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }
    }

    .dynamic-content__container {
      min-height: 120px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-content: flex-start;
      margin-bottom: 20px;
      padding: 10px;
      background: var(--bg-body);
      border: 1px dashed var(--border-color, #ddd);
      border-radius: 4px;
    }

    .dynamic-element {
      flex: 0 1 calc(25% - 9px);
      min-width: 220px;
      padding: 16px;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      border: none;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
      color: white;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .dynamic-element__content {
      flex: 1;
      word-break: break-word;
      font-weight: 500;
    }

    .dynamic-element__btn {
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.25);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
      flex-shrink: 0;
      font-weight: 500;

      &:hover {
        background: rgba(255, 255, 255, 0.4);
        border-color: rgba(255, 255, 255, 0.6);
        transform: scale(1.08);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .dynamic-content__count {
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0;
      padding: 12px;
      background: var(--bg-surface);
      border-radius: 4px;

      strong {
        color: #667eea;
        font-size: 16px;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
      }
    }

    @media (max-width: 768px) {
      .dynamic-content__controls {
        flex-direction: column;
        align-items: stretch;

        h3 {
          min-width: auto;
        }
      }

      .btn-add,
      .btn-clear {
        width: 100%;
      }

      .dynamic-content__container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DynamicContentComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;

  elements: DynamicElement[] = [];
  private elementCounter = 0;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    // Agregar algunos elementos iniciales para demostración
    this.addElement();
    this.addElement();
  }

  /**
   * FASE 1: createElement + appendChild
   * Crear un elemento dinámicamente usando Renderer2
   */
  addElement(): void {
    this.elementCounter++;
    const elementId = `dynamic-${this.elementCounter}`;
    const content = `Elemento Dinámico #${this.elementCounter}`;

    // Guardar en array para tracking
    this.elements.push({
      id: elementId,
      content
    });

    // ✅ 1. Crear elemento div usando Renderer2
    const elementDiv = this.renderer.createElement('div');
    this.renderer.addClass(elementDiv, 'dynamic-element');
    this.renderer.setAttribute(elementDiv, 'id', elementId);
    this.renderer.setAttribute(elementDiv, 'data-index', this.elementCounter.toString());

    // ✅ 2. Crear contenido de texto con span
    const contentSpan = this.renderer.createElement('span');
    this.renderer.addClass(contentSpan, 'dynamic-element__content');
    
    const contentElement = this.renderer.createText(content);
    this.renderer.appendChild(contentSpan, contentElement);

    // ✅ 3. Crear botón de eliminar
    const deleteBtn = this.renderer.createElement('button');
    this.renderer.addClass(deleteBtn, 'dynamic-element__btn');
    this.renderer.setAttribute(deleteBtn, 'type', 'button');
    this.renderer.setAttribute(deleteBtn, 'title', 'Eliminar elemento');
    
    const btnText = this.renderer.createText('✕ Eliminar');
    this.renderer.appendChild(deleteBtn, btnText);

    // ✅ 4. Event listener para eliminar elemento
    // Escuchar click en el botón específico
    const listener = this.renderer.listen(deleteBtn, 'click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Remover del array
      this.elements = this.elements.filter(el => el.id !== elementId);
      
      // Animar y remover del DOM
      this.renderer.setStyle(elementDiv, 'opacity', '0');
      this.renderer.setStyle(elementDiv, 'transform', 'translateY(10px) scale(0.95)');
      this.renderer.setStyle(elementDiv, 'transition', 'all 0.3s ease');
      
      setTimeout(() => {
        try {
          if (elementDiv.parentNode === this.container.nativeElement) {
            this.renderer.removeChild(this.container.nativeElement, elementDiv);
          }
        } catch (err) {
          console.warn('Error removiendo elemento:', err);
        }
      }, 300);
    });

    // ✅ 5. Agregar elementos al contenedor usando appendChild
    this.renderer.appendChild(elementDiv, contentSpan);
    this.renderer.appendChild(elementDiv, deleteBtn);
    
    // ✅ 6. Insertar en el contenedor del DOM
    this.renderer.appendChild(this.container.nativeElement, elementDiv);
  }

  /**
   * Limpiar todos los elementos
   */
  clearAll(): void {
    // Remover todos los elementos del DOM de forma segura
    const container = this.container.nativeElement;
    
    // Crear array de hijos antes de iterar para evitar problemas
    const children = Array.from(container.children);
    
    children.forEach((child: any) => {
      this.renderer.removeChild(container, child);
    });

    // Limpiar array
    this.elements = [];
    this.elementCounter = 0;
  }
}
