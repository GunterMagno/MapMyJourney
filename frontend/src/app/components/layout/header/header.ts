import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;
  isDarkTheme = false;
  isLoggedIn = false;
  showMyTripsBtn = false;
  showCreateTripBtn = false;

  ngOnInit(): void {
    // TODO: Implement header initialization logic
    // Check theme preference
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark-mode', this.isDarkTheme);
  }

  login(): void {
    // TODO: Implement login logic
    console.log('Login clicked');
  }

  signup(): void {
    // TODO: Implement signup logic
    console.log('Signup clicked');
  }

  goToTrips(): void {
    // TODO: Navigate to trips
    console.log('Go to trips clicked');
  }

  createTrip(): void {
    // TODO: Navigate to create trip
    console.log('Create trip clicked');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (window.innerWidth > 768) {
      this.isMobileMenuOpen = false;
    }
  }
}
