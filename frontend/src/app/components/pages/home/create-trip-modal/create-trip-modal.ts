import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/modal/modal';
import { TripFormData } from '../../../../services/trip.service';

interface TripFormDataLocal {
  name: string;
  startDate: string;
  endDate: string;
  budget: string;
}

@Component({
  selector: 'app-create-trip-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent
  ],
  templateUrl: './create-trip-modal.html',
  styleUrl: './create-trip-modal.scss'
})
export class CreateTripModalComponent {
  @Output() tripCreated = new EventEmitter<TripFormData>();
  @ViewChild('modal') modal!: ModalComponent;

  tripForm: TripFormDataLocal = {
    name: '',
    startDate: '',
    endDate: '',
    budget: ''
  };

  isSubmitting = false;
  dateError: string = '';

  onClose(): void {
    this.resetForm();
    if (this.modal) {
      this.modal.closeModal();
    }
  }

  validateDates(): void {
    this.dateError = '';
    
    if (this.tripForm.startDate && this.tripForm.endDate) {
      const startDate = new Date(this.tripForm.startDate);
      const endDate = new Date(this.tripForm.endDate);
      
      if (endDate < startDate) {
        this.dateError = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
  }

  onSubmit(): void {
    this.validateDates();
    
    if (this.isValidForm() && !this.dateError) {
      this.isSubmitting = true;
      
      // Convertir datos del formulario al tipo correcto (budget como número)
      const tripData: TripFormData = {
        name: this.tripForm.name,
        startDate: this.tripForm.startDate,
        endDate: this.tripForm.endDate,
        budget: this.tripForm.budget ? parseFloat(this.tripForm.budget) : undefined
      };
      
      // Emitir el evento con los datos convertidos
      setTimeout(() => {
        this.tripCreated.emit(tripData);
        this.isSubmitting = false;
        this.onClose();
      }, 1000);
    }
  }

  isValidForm(): boolean {
    return (
      this.tripForm.name.trim() !== '' &&
      this.tripForm.startDate !== '' &&
      this.tripForm.endDate !== '' &&
      !this.dateError
    );
  }

  resetForm(): void {
    this.tripForm = {
      name: '',
      startDate: '',
      endDate: '',
      budget: ''
    };
    this.dateError = '';
  }

  openModal(): void {
    if (this.modal) {
      this.modal.openModal();
    }
  }

  closeModal(): void {
    if (this.modal) {
      this.modal.closeModal();
    }
  }
}
