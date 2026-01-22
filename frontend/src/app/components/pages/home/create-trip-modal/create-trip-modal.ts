import { Component, Output, EventEmitter, ViewChild, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/modal/modal';
import { CommunicationService } from '../../../../services/communication.service';
import { DateFormatService } from '../../../../core/services/date-format.service';
import { TripFormData } from '../../../../services/trip.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface TripFormDataLocal {
  title: string;
  destination: string;
  description: string;
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
export class CreateTripModalComponent implements OnInit, OnDestroy {
  @Output() tripCreated = new EventEmitter<TripFormData>();
  @ViewChild('modal') modal!: ModalComponent;

  private destroy$ = new Subject<void>();
  private dateFormatService = inject(DateFormatService);
  private communicationService = inject(CommunicationService);
  private readonly availableImages = ['/images/paris.jpg', '/images/japan.jpg', '/images/newyork.jpg'];

  tripForm: TripFormDataLocal = {
    title: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: ''
  };

  isSubmitting = false;
  dateError: string = '';
  budgetError: string = '';

  ngOnInit(): void {
    // Listen to modal open events
    this.communicationService.modal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event.type === 'create-trip') {
          this.openModal();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
    this.validateBudget();
    
    if (this.isValidForm() && !this.dateError && !this.budgetError) {
      this.isSubmitting = true;
      const budgetNumber = parseFloat(this.tripForm.budget);
      
      // Convertir datos del formulario al tipo correcto (budget como número)
      const tripData: TripFormData = {
        title: this.tripForm.title,
        destination: this.tripForm.destination,
        description: this.tripForm.description || undefined,
        imageUrl: this.getRandomImage(),
        startDate: this.tripForm.startDate,
        endDate: this.tripForm.endDate,
        budget: budgetNumber
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
      this.tripForm.title.trim() !== '' &&
      this.tripForm.destination.trim() !== '' &&
      this.tripForm.startDate !== '' &&
      this.tripForm.endDate !== '' &&
      !this.dateError &&
      !this.budgetError &&
      this.isBudgetValid()
    );
  }

  resetForm(): void {
    this.tripForm = {
      title: '',
      destination: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: ''
    };
    this.dateError = '';
    this.budgetError = '';
  }

  private getRandomImage(): string {
    return this.availableImages[Math.floor(Math.random() * this.availableImages.length)];
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

  preventNegative(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (parseFloat(input.value) < 0) {
      input.value = '0';
      this.tripForm.budget = '';
    }
    this.validateBudget();
  }

  validateBudget(): void {
    this.budgetError = '';
    const budgetNumber = parseFloat(this.tripForm.budget);
    if (isNaN(budgetNumber) || budgetNumber <= 0) {
      this.budgetError = 'El presupuesto es obligatorio y debe ser mayor a 0';
    }
  }

  private isBudgetValid(): boolean {
    const budgetNumber = parseFloat(this.tripForm.budget);
    return !isNaN(budgetNumber) && budgetNumber > 0;
  }
}
