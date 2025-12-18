import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  Renderer2,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';
import { CommunicationService } from '../../../services/communication.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Header component with:
 * - Secure DOM manipulation using ViewChild and Renderer2
 * - Event binding for menu toggle and theme switching
 * - @HostListener for window resize and ESC key
 * - Integration with services (Theme, Auth, Communication)
 * - Unidirectional Data Flow pattern
 * - FASE 1: DOM and Events implementation
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('mobileMenu') mobileMenu!: ElementRef;

  isMobileMenuOpen = false;
  isDarkTheme = false;
  isLoggedIn = false;
  showMyTripsBtn = false;
  showCreateTripBtn = false;
  currentUserName: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize theme from ThemeService (replaces localStorage manual check)
    this.isDarkTheme = this.themeService.isDarkMode();

    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.isDarkTheme = theme === 'dark';
      });

    // Subscribe to authentication status
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isLoggedIn = isAuth;
        this.showMyTripsBtn = isAuth;
        this.showCreateTripBtn = isAuth;
      });

    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUserName = user?.name || null;
      });
  }

  /**
   * FASE 1: Event Binding - Toggle mobile menu with boolean flag
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * FASE 1: Closes mobile menu
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  /**
   * FASE 1: Toggle theme using ThemeService
   * Renderer2 is used in ThemeService for secure DOM manipulation
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Navigate to login page
   */
  login(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigate to signup page
   */
  signup(): void {
    this.router.navigate(['/auth/signup']);
  }

  /**
   * Navigate to trips page
   */
  goToTrips(): void {
    this.router.navigate(['/trips']);
    this.closeMobileMenu();
  }

  /**
   * Navigate to create trip page
   */
  createTrip(): void {
    this.router.navigate(['/trips/create']);
    this.closeMobileMenu();
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeMobileMenu();
  }

  /**
   * FASE 1: Event Handling - Close menu on ESC key
   * @HostListener: Keyboard event for accessibility
   */
  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  /**
   * FASE 1: Event Handling - Close menu on window resize
   * Prevents mobile menu from being stuck open when resizing to desktop
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (window.innerWidth > 768) {
      this.isMobileMenuOpen = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

