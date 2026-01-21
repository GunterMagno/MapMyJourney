import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItineraryItem } from '../../../../../core/models/itinerary.model';

@Component({
  selector: 'app-create-activity-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-activity-modal.component.html',
  styleUrl: './create-activity-modal.component.scss'
})
export class CreateActivityModalComponent implements OnInit, OnChanges {
  @Input() selectedDate: string = '';
  @Input() editingItem: ItineraryItem | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() activityAdded = new EventEmitter<ItineraryItem>();

  isOpen = signal(false);
  activityForm!: FormGroup;
  dayIndex: number = 0;
  isEditMode = signal(false);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingItem'] && changes['editingItem'].currentValue) {
      // Si recibe un editingItem, abrirlo automáticamente
      this.openModal(0, changes['editingItem'].currentValue);
    }
  }

  private initializeForm(): void {
    this.activityForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      type: ['ACTIVITY', Validators.required],
      startTime: ['', Validators.required],
      duration: [45, [Validators.required, Validators.min(1), Validators.max(1440)]],
      durationUnit: ['MIN'],
      location: [''],
      description: [''],
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

  openModal(dayIndex: number, editingItem?: ItineraryItem): void {
    this.dayIndex = dayIndex;
    this.isEditMode.set(!!editingItem);
    
    if (editingItem) {
      // Modo edición: rellenar el form con los datos del item
      this.activityForm.patchValue({
        title: editingItem.title,
        type: editingItem.type,
        startTime: editingItem.time,
        duration: editingItem.duration,
        location: editingItem.location || '',
        description: editingItem.description || '',
        category: editingItem.category || ''
      });
    } else {
      // Modo creación: resetear el form
      this.activityForm.reset({ type: 'ACTIVITY', duration: 45, durationUnit: 'MIN' });
    }
    
    this.isOpen.set(true);
  }

  closeModal(): void {
    this.isOpen.set(false);
    this.activityForm.reset({ type: 'ACTIVITY', duration: 45, durationUnit: 'MIN' });
    this.isEditMode.set(false);
    this.close.emit();
  }

  onSubmit(): void {
    if (!this.activityForm.valid) return;

    const formValue = this.activityForm.value;
    const item: ItineraryItem = {
      id: this.editingItem?.id || `temp-${Date.now()}`,
      title: formValue.title,
      type: formValue.type,
      time: formValue.startTime,
      duration: formValue.duration,
      location: formValue.location || undefined,
      description: formValue.description || undefined,
      category: formValue.category || undefined,
      isCompleted: this.editingItem?.isCompleted || false
    };

    this.activityAdded.emit(item);
    this.closeModal();
  }
}

