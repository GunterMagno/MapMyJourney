import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from '../../../services/theme.service';

/**
 * ThemeSwitcher Component - Fase 6: Temas y Modo Oscuro
 * 
 * Responsabilidades:
 * 1. Mostrar botón toggle (Sol/Luna)
 * 2. Sincronizar con ThemeService
 * 3. Cambiar data-theme en <html>
 * 4. Persistir preferencia en localStorage
 * 5. Respetar preferencia del SO (prefers-color-scheme)
 */
@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="theme-switcher"
      [attr.aria-label]="'Cambiar a modo ' + (isDarkMode ? 'claro' : 'oscuro')"
      (click)="toggleTheme()">
      
      <!-- Icono Sol (Modo Claro) -->
      <svg *ngIf="isDarkMode" 
           class="theme-switcher__icon" 
           viewBox="0 0 24 24" 
           fill="currentColor"
           aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      
      <!-- Icono Luna (Modo Oscuro) -->
      <svg *ngIf="!isDarkMode" 
           class="theme-switcher__icon" 
           viewBox="0 0 24 24" 
           fill="currentColor"
           aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  `,
  styles: [`
    .theme-switcher {
      // Estilo base
      background: transparent;
      border: none;
      cursor: pointer;
      padding: var(--spacing-2);
      border-radius: var(--border-radius-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      
      // Transición suave
      transition: background-color 0.3s ease, color 0.3s ease;
      color: var(--text-main);
      
      // Hover y focus
      &:hover {
        background-color: var(--bg-light);
      }
      
      &:focus {
        outline: 2px solid var(--principal-color);
        outline-offset: 2px;
      }
    }
    
    .theme-switcher__icon {
      width: 24px;
      height: 24px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      animation: theme-icon-rotate 0.5s ease-in-out;
    }
    
    @keyframes theme-icon-rotate {
      from {
        transform: rotate(-180deg);
        opacity: 0;
      }
      to {
        transform: rotate(0);
        opacity: 1;
      }
    }
  `]
})
export class ThemeSwitcherComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios de tema del servicio
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
        this.applyTheme(isDark);
      });

    // Inicializar tema al cargar
    this.themeService.initializeTheme();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  private applyTheme(isDark: boolean): void {
    // Actualizar atributo data-theme en <html>
    if (isDark) {
      this.renderer.setAttribute(document.documentElement, 'data-theme', 'dark');
    } else {
      this.renderer.removeAttribute(document.documentElement, 'data-theme');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
