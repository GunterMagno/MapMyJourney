import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
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
 * Header component (Navbar) with:
 * - Secure DOM manipulation using ViewChild
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
  @ViewChild('hamburgerBtn') hamburgerBtn!: ElementRef;

  isMobileMenuOpen = false;
  isDarkTheme = false;
  isLoggedIn = false;
  showMyTripsBtn = false;
  showCreateTripBtn = false;
  currentUserName: string | null = null;
  currentUserAvatar: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize theme from ThemeService (replaces localStorage manual check)
    this.isDarkTheme = this.themeService.isDarkModeActive();

    // Subscribe to theme changes
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkTheme = isDark;
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
        this.currentUserAvatar = user?.profilePicture || 'assets/profile-picture.webp';
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
   * Open create trip modal
   */
  createTrip(): void {
    this.communicationService.openModal('create-trip');
    this.closeMobileMenu();
  }

  /**
   * Navigate to user profile
   */
  goToProfile(): void {
    this.router.navigate(['/usuario/perfil']);
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
   * @HostListener escucha clicks en document y cierra si está fuera del menú
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Si el menú NO está abierto, no hacemos nada
    if (!this.isMobileMenuOpen) {
      return;
    }

    // Obtenemos el elemento clickeado
    const target = event.target as HTMLElement;

    // Comprobamos si el click es fuera del menú y del botón hamburguesa
    const menuElement = this.mobileMenu?.nativeElement;
    const buttonElement = this.hamburgerBtn?.nativeElement;


    const clickedInMenu = menuElement && menuElement.contains(target);
    const clickedButton = buttonElement && buttonElement.contains(target);

    if (!clickedInMenu && !clickedButton) {
      // El click fue fuera: cerramos el menú
      this.closeMobileMenu();
    }
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
   * Ensure the mobile menu closes when switching to desktop breakpoints
   */
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

