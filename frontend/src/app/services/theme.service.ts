import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type Theme = 'light' | 'dark';

/**
 * Theme management service.
 * Handles dark mode / light mode switching with persistent storage and system preference detection.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  private themeSubject = new BehaviorSubject<Theme>(this.getCurrentTheme());
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  /**
   * Initializes theme from localStorage or defaults to 'light' mode.
   */
  private initializeTheme(): void {
    const savedTheme = this.getThemeFromStorage();
    if (savedTheme) {
      this.applyTheme(savedTheme);
    } else {
      // Default to light mode instead of system preference
      this.applyTheme('light');
    }
  }

  /**
   * Detects system preference using matchMedia.
   */
  private detectSystemPreference(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Gets theme from localStorage.
   */
  private getThemeFromStorage(): Theme | null {
    if (typeof window === 'undefined') return null;
    const theme = localStorage.getItem(this.THEME_KEY);
    return theme === 'dark' || theme === 'light' ? (theme as Theme) : null;
  }

  /**
   * Gets current theme synchronously.
   */
  getCurrentTheme(): Theme {
    const saved = this.getThemeFromStorage();
    if (saved) return saved;
    return this.detectSystemPreference() ? 'dark' : 'light';
  }

  /**
   * Toggles between light and dark theme.
   */
  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  /**
   * Sets theme explicitly.
   */
  setTheme(theme: Theme): void {
    this.applyTheme(theme);
  }

  /**
   * Applies theme to DOM and persists to localStorage.
   */
  private applyTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;
    
    const htmlElement = document.documentElement;
    
    if (theme === 'dark') {
      htmlElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
    }
    
    localStorage.setItem(this.THEME_KEY, theme);
    this.themeSubject.next(theme);
  }

  /**
   * Checks if dark mode is currently active.
   */
  isDarkMode(): boolean {
    return this.themeSubject.value === 'dark';
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
