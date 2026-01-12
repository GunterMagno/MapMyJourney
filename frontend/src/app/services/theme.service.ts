import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type Theme = 'light' | 'dark';

/**
 * ThemeService - Fase 6: Temas y Modo Oscuro
 * 
 * Responsabilidades:
 * 1. Detectar preferencia del usuario (localStorage)
 * 2. Detectar preferencia del SO (prefers-color-scheme)
 * 3. Aplicar tema a <html data-theme>
 * 4. Persistir selección del usuario
 * 5. Emit cambios vía Observable para UI
 * 
 * Prioridad:
 * 1. localStorage (selección del usuario)
 * 2. prefers-color-scheme (SO)
 * 3. light (default)
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'mapmyjourney_theme';
  
  // BehaviorSubject para emitir cambios
  private themeSubject = new BehaviorSubject<Theme>('light');
  public theme$: Observable<Theme> = this.themeSubject.asObservable();
  
  // Observable para isDarkMode (más semántico)
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();

  constructor() {}

  /**
   * Inicializa el tema siguiendo prioridad:
   * 1. localStorage → selección anterior del usuario
   * 2. prefers-color-scheme → preferencia del SO
   * 3. 'light' → default
   */
  initializeTheme(): void {
    const theme = this.detectTheme();
    this.applyTheme(theme);
  }

  /**
   * Detecta el tema con prioridad
   */
  private detectTheme(): Theme {
    // 1. ¿Hay algo en localStorage?
    const saved = this.getThemeFromStorage();
    if (saved) {
      return saved;
    }

    // 2. ¿Qué dice la preferencia del SO?
    const prefersDark = this.detectSystemPreference();
    return prefersDark ? 'dark' : 'light';
  }

  /**
   * Detecta preferencia del SO usando window.matchMedia
   */
  private detectSystemPreference(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Obtiene tema de localStorage
   */
  private getThemeFromStorage(): Theme | null {
    if (typeof window === 'undefined') return null;
    const theme = localStorage.getItem(this.THEME_KEY);
    return theme === 'dark' || theme === 'light' ? (theme as Theme) : null;
  }

  /**
   * Obtiene el tema actual (síncrono)
   */
  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Obtiene si está en modo oscuro
   */
  isDarkModeActive(): boolean {
    return this.isDarkModeSubject.value;
  }

  /**
   * Alterna entre claro y oscuro
   */
  toggleTheme(): void {
    const current = this.themeSubject.value;
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  /**
   * Establece tema explícitamente
   */
  setTheme(theme: Theme): void {
    this.applyTheme(theme);
  }

  /**
   * Aplica tema al DOM y persiste en localStorage
   * 
   * 1. Actualiza data-theme en <html>
   * 2. Guarda en localStorage
   * 3. Emite cambios vía Observable
   */
  private applyTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;
    
    const htmlElement = document.documentElement;
    const isDark = theme === 'dark';
    
    // Actualizar atributo data-theme en <html>
    if (isDark) {
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      htmlElement.removeAttribute('data-theme');
    }
    
    // Mantener compatibilidad con clase .dark-mode (si existe código anterior)
    if (isDark) {
      htmlElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
    }
    
    // Guardar en localStorage
    localStorage.setItem(this.THEME_KEY, theme);
    
    // Emitir cambios
    this.themeSubject.next(theme);
    this.isDarkModeSubject.next(isDark);
  }

  /**
   * Watches system theme preference changes (e.g., user toggles in OS settings).
   * Optional: Subscribe to this to update theme if user changes system preference.
   */
  watchSystemPreference(): Observable<boolean> {
    return new Observable(observer => {
      if (typeof window === 'undefined' || !window.matchMedia) {
        observer.complete();
        return;
      }

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        observer.next(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    });
  }
}
