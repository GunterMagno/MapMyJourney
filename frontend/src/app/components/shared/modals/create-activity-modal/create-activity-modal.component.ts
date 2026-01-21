import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ItineraryStore } from '../../../../core/store/itinerary.store';
import { ItineraryItem } from '../../../../core/models/itinerary.model';

export interface CreateActivityModalData {
  dayIndex: number;
}

@Component({
  selector: 'app-create-activity-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-activity-modal.component.html',
  styleUrls: ['./create-activity-modal.component.scss'],
})
export class CreateActivityModalComponent implements OnInit {
  activityForm!: FormGroup;
  isLoading = false;

  @Output() close = new EventEmitter<ItineraryItem | null>();

  // Opciones para los selects
  durationUnits = [
    { value: 'minutes', label: 'Minutos' },
    { value: 'hours', label: 'Horas' },
  ];

  activityCategories = [
    { value: 'restaurant', label: '🍽️ Comida' },
    { value: 'museum', label: '🏛️ Museo' },
    { value: 'park', label: '🌳 Parque' },
    { value: 'landmark', label: '🗿 Monumento' },
    { value: 'shop', label: '🛍️ Shopping' },
    { value: 'transport', label: '🚗 Transporte' },
    { value: 'hotel', label: '🏨 Hotel' },
    { value: 'other', label: '📍 Otro' },
  ];

  constructor(
    private fb: FormBuilder,
    private itineraryStore: ItineraryStore,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.activityForm = this.fb.group({
      type: ['ACTIVITY', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      startTime: ['', Validators.required],
      duration: ['60', [Validators.required, Validators.min(1)]],
      durationUnit: ['minutes', Validators.required],
      location: [''],
      notes: [''],
      category: ['other'],
    });
  }

  /**
   * Calcula el tipo de actividad basado en duración en minutos
   */
  private getDurationInMinutes(): number {
    const duration = this.activityForm.get('duration')?.value || 0;
    const unit = this.activityForm.get('durationUnit')?.value || 'minutes';
    return unit === 'hours' ? duration * 60 : duration;
  }

  /**
   * Calcula la hora de fin basada en hora inicio + duración
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    if (!startTime) return '';

    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Guarda la actividad en el store
   */
  onSave(): void {
    if (this.activityForm.invalid) {
      this.markFormGroupTouched(this.activityForm);
      return;
    }

    this.isLoading = true;
    const formValue = this.activityForm.value;
    const durationInMinutes = this.getDurationInMinutes();
    const endTime = this.calculateEndTime(formValue.startTime, durationInMinutes);

    const newItem: ItineraryItem = {
      id: `activity-${Date.now()}`,
      type: formValue.type,
      title: formValue.title,
      time: formValue.startTime,
      duration: durationInMinutes,
      description: formValue.notes,
      location: formValue.location,
      isCompleted: false,
      category: formValue.category,
      order: Date.now(),
    };

    // Agregar al store
    this.itineraryStore.addItem(newItem);

    this.isLoading = false;
    this.close.emit(newItem);
  }

  /**
   * Cierra el modal sin guardar
   */
  onCancel(): void {
    this.close.emit(null);
  }

  /**
   * Marca todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Obtiene el error específico de un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.activityForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (field.errors['minLength']) {
      return `Mínimo ${field.errors['minLength'].requiredLength} caracteres`;
    }
    if (field.errors['min']) {
      return `El valor debe ser mayor a ${field.errors['min'].min}`;
    }

    return '';
  }

  /**
   * Etiquetas amigables para campos
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Título',
      startTime: 'Hora de inicio',
      duration: 'Duración',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(fieldName: string): boolean {
    const field = this.activityForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
