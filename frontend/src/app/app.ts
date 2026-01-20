import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/shared/toast/toast';
import { LoadingComponent } from './components/shared/loading/loading';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

/**
 * Root component.
 * Includes global components (Toast, Loading), initializes theme, and verifies token.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  protected readonly title = signal('frontend');
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Initialize theme from system preference or localStorage
    this.themeService.initializeTheme();

    // Verify token in background (non-blocking)
    if (this.authService.hasValidToken()) {
      this.authService.verifyToken().subscribe({
        next: () => console.log('✓ Session verified'),
        error: (err) => console.warn('⚠ Session verification failed:', err)
      });
    }
  }
}
