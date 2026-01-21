import { Component, OnInit, Output, EventEmitter, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ExpenseStore, Participant, CreateExpenseDto } from '../../../../../core';
import { DateFormatService } from '../../../../../core/services/date-format.service';

@Component({
  selector: 'app-add-expense-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-expense-modal.component.html',
  styleUrl: './add-expense-modal.component.scss'
})
export class AddExpenseModalComponent implements OnInit {
  @Input() tripId: string = '';
  @Input() participants: Participant[] = [];
  @Input() currentUserId: string = ''; // Usuario actual
  @Input() currentUserName: string = ''; // Nombre del usuario actual
  @Input() tripStartDate: string = '';
  @Input() tripEndDate: string = '';
  @Output() close = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly expenseStore = inject(ExpenseStore);
  private readonly dateFormatService = inject(DateFormatService);

  expenseForm!: FormGroup;
  loading = false;
  error: string | null = null;

  // Opciones de participantes para prueba (cuando no hay otros usuarios)
  testParticipants: Participant[] = [
    { id: 'test-1', name: 'Prueba1', email: 'prueba1@test.com', role: 'PARTICIPANT' },
    { id: 'test-2', name: 'Prueba2', email: 'prueba2@test.com', role: 'PARTICIPANT' }
  ];

  // Computed signal para participantes disponibles (incluyendo de prueba)
  availableParticipants = computed(() => {
    const realParticipants = this.participants || [];
    // Combinar participantes reales con de prueba
    return [...realParticipants, ...this.testParticipants];
  });

  // Computed signal para participantes que pueden pagar 
  // PRIMERO: El usuario actual (con su nombre)
  // DESPUÉS: Prueba1 y Prueba2
  payerParticipants = computed(() => {
    const available = this.availableParticipants();
    const currentUser = this.currentUserId;
    const userName = this.currentUserName;
    
    // Filtrar participantes para los pagadores
    let payers = available;
    
    // Si hay usuario actual, ponerlo primero con su nombre
    if (currentUser && userName) {
      const currentUserObj: Participant = {
        id: currentUser,
        name: userName,
        email: '',
        role: 'PARTICIPANT'
      };
      
      // Filtrar las pruebas del listado para evitar duplicados
      const otherParticipants = payers.filter(p => p.id !== currentUser && p.id !== 'test-1' && p.id !== 'test-2');
      
      // Retornar: usuario actual primero, luego Prueba1 y Prueba2
      return [
        currentUserObj,
        { id: 'test-1', name: 'Prueba1', email: 'prueba1@test.com', role: 'PARTICIPANT' },
        { id: 'test-2', name: 'Prueba2', email: 'prueba2@test.com', role: 'PARTICIPANT' },
        ...otherParticipants
      ];
    }
    
    return available;
  });

  categories = [
    { value: 'TRANSPORT', label: 'Transporte ✈️' },
    { value: 'ACCOMMODATION', label: 'Alojamiento 🏨' },
    { value: 'FOOD', label: 'Comida 🍽️' },
    { value: 'ACTIVITIES', label: 'Ocio 🎭' },
    { value: 'OTHER', label: 'Otro 📦' }
  ];

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializar formulario reactivo
   */
  private initForm(): void {
    const today = new Date();
    const start = this.tripStartDate ? new Date(this.tripStartDate) : today;
    const end = this.tripEndDate ? new Date(this.tripEndDate) : today;
    const clampedDate = this.clampDate(today, start, end);
    const normalizedDate = this.dateFormatService.normalizeDate(clampedDate);

    // Usar el usuario actual como pagador por defecto
    const defaultPayer = this.currentUserId || (this.availableParticipants()[0]?.id || '');

    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      payerId: [defaultPayer, Validators.required],
      category: ['FOOD', Validators.required],
      date: [normalizedDate, Validators.required],
      participants: [[], Validators.required]
    });
  }

  /**
   * Obtener control de formulario
   */
  getControl(name: string) {
    return this.expenseForm.get(name);
  }

  /**
   * Validar si un campo tiene error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.expenseForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  /**
   * Toggle participante en selección
   */
  toggleParticipant(participantId: string): void {
    const participantsControl = this.expenseForm.get('participants');
    const current = participantsControl?.value || [];
    
    if (current.includes(participantId)) {
      participantsControl?.setValue(current.filter((id: string) => id !== participantId));
    } else {
      participantsControl?.setValue([...current, participantId]);
    }
  }

  /**
   * Verificar si un participante está seleccionado
   */
  isParticipantSelected(participantId: string): boolean {
    const participants = this.expenseForm.get('participants')?.value || [];
    return participants.includes(participantId);
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    if (!this.expenseForm.valid) {
      this.markFormGroupTouched(this.expenseForm);
      return;
    }

    const dateControl = this.expenseForm.get('date');
    if (dateControl && !this.isDateWithinBounds(dateControl.value)) {
      this.error = 'La fecha debe estar dentro de las fechas del viaje';
      dateControl.markAsTouched();
      return;
    }

    if (this.expenseForm.get('participants')?.value?.length === 0) {
      this.error = 'Debes seleccionar al menos un participante';
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.expenseForm.value;
    const dto: CreateExpenseDto = {
      tripId: this.tripId,
      payerId: formValue.payerId,
      amount: parseFloat(formValue.amount),
      description: formValue.description,
      category: formValue.category,
      date: formValue.date,
      participants: formValue.participants
    };

    this.expenseStore.addExpense(dto).subscribe({
      next: () => {
        this.loading = false;
        this.error = null;
        this.closeModal();
      },
      error: (err: any) => {
        this.loading = false;
        
        // Manejo de errores específicos del backend
        if (err?.error?.message) {
          this.error = err.error.message;
        } else if (err?.status === 400) {
          this.error = 'Datos inválidos. Verifica los campos.';
        } else if (err?.status === 403) {
          this.error = 'No tienes permisos para crear gastos.';
        } else if (err?.status === 404) {
          this.error = 'El viaje no existe.';
        } else {
          this.error = 'Error al crear el gasto. Inténtalo de nuevo.';
        }
        
        console.error('Error al crear gasto:', err);
      }
    });
  }

  private isDateWithinBounds(date: string): boolean {
    if (!date || !this.tripStartDate || !this.tripEndDate) return true;
    const value = new Date(date);
    const start = new Date(this.tripStartDate);
    const end = new Date(this.tripEndDate);
    return value >= start && value <= end;
  }

  private clampDate(date: Date, start: Date, end: Date): Date {
    if (date < start) return start;
    if (date > end) return end;
    return date;
  }

  private formatDate(date: Date): string {
    return this.dateFormatService.normalizeDate(date);
  }

  /**
   * Marcar todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.close.emit();
  }

  /**
   * Cerrar modal al hacer click afuera (en el overlay)
   */
  closeOnOverlay(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
