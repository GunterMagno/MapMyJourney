import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { LoadingComponent } from './components/shared/loading/loading';
import { ThemeService } from './services/theme.service';

/**
 * Root component.
 * Includes global components (Toast, Loading) and initializes theme.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  protected readonly title = signal('frontend');

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Initialize theme from system preference or localStorage
    this.themeService.getCurrentTheme();
  }
}

