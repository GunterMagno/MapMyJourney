import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateActivityDto } from '../../../models/itinerary.model';

@Component({
  selector: 'app-create-activity-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-activity-modal.component.html',
  styleUrl: './create-activity-modal.component.scss'
})
export class CreateActivityModalComponent implements OnInit {
  isOpen = signal(false);
  activityForm!: FormGroup;
  dayIndex: number = 0;
  
  // Outputs para padres
  onActivityCreated: ((activity: CreateActivityDto) => void) | null = null;
  onModalClosed: (() => void) | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.activityForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      type: ['ACTIVITY', Validators.required],
      startTime: ['', Validators.required],
      duration: [45, [Validators.required, Validators.min(1), Validators.max(1440)]],
      durationUnit: ['MIN'],
      location: [''],
      notes: [''],
      category: ['']
    });
  }

  // Getters para validación
  get title() {
    return this.activityForm.get('title')!;
  }

  get startTime() {
    return this.activityForm.get('startTime')!;
  }

  get duration() {
    return this.activityForm.get('duration')!;
  }

  openModal(dayIndex: number): void {
    this.dayIndex = dayIndex;
    this.isOpen.set(true);
  }

  closeModal(): void {
    this.isOpen.set(false);
    this.activityForm.reset({ type: 'ACTIVITY', duration: 45, durationUnit: 'MIN' });
    if (this.onModalClosed) {
      this.onModalClosed();
    }
  }

  onSubmit(): void {
    if (!this.activityForm.valid) return;

    const formValue = this.activityForm.value;
    const activity: CreateActivityDto = {
      title: formValue.title,
      type: formValue.type,
      startTime: formValue.startTime,
      duration: formValue.duration,
      durationUnit: formValue.durationUnit,
      location: formValue.location || undefined,
      notes: formValue.notes || undefined,
      dayIndex: this.dayIndex,
      category: formValue.category || undefined
    };

    if (this.onActivityCreated) {
      this.onActivityCreated(activity);
    }

    this.closeModal();
  }
}

