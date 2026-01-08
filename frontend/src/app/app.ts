import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/shared/toast/toast';
import { LoadingComponent } from './components/shared/loading/loading';
import { BreadcrumbComponent } from './components/shared/breadcrumb/breadcrumb.component';
import { ThemeService } from './services/theme.service';

/**
 * Root component.
 * Includes global components (Toast, Loading, Breadcrumb) and initializes theme.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, LoadingComponent, BreadcrumbComponent],
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

