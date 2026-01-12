import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/button/button';
import { CardComponent } from '../../shared/card/card';
import { CreateTripModalComponent } from './create-trip-modal/create-trip-modal';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';
import { ToastService } from '../../../services/toast.service';
import { TripService, TripFormData, Trip } from '../../../services/trip.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    CreateTripModalComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  @ViewChild('createTripModal') createTripModal!: CreateTripModalComponent;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private tripService: TripService,
    private loadingService: LoadingService
  ) {}

  openCreateTripModal(): void {
    if (this.createTripModal) {
      this.createTripModal.openModal();
    }
  }

  onTripCreated(tripData: TripFormData): void {
    // Mostrar loading
    const stopLoading = this.loadingService.start();

    // Crear el viaje en el backend
    this.tripService.createTrip(tripData).subscribe({
      next: (createdTrip: Trip) => {
        stopLoading();

        // Mostrar toast de éxito
        this.toastService.success(`¡Viaje "${createdTrip.name}" creado exitosamente!`);

        // Cerrar el modal
        if (this.createTripModal) {
          this.createTripModal.closeModal();
        }

        // Esperar un poco para que se cierre el modal y luego redirigir al viaje creado
        setTimeout(() => {
          // Redirigir a la página de detalle del viaje
          this.router.navigate(['/trips', createdTrip.id]);
        }, 500);
      },
      error: (error: any) => {
        stopLoading();
        console.error('Error al crear viaje:', error);
        this.toastService.error('Error al crear el viaje. Intenta de nuevo.');
      }
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }
}
