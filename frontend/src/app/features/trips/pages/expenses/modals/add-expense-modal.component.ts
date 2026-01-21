import { Component, OnInit, Output, EventEmitter, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ExpenseStore, Participant, CreateExpenseDto } from '../../../../../core';

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
  @Output() close = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly expenseStore = inject(ExpenseStore);

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
    const today = new Date().toISOString().split('T')[0];

    // Usar el usuario actual como pagador por defecto
    const defaultPayer = this.currentUserId || (this.availableParticipants()[0]?.id || '');

    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      payerId: [defaultPayer, Validators.required],
      category: ['FOOD', Validators.required],
      date: [today, Validators.required],
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
        this.closeModal();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Error al crear el gasto. Inténtalo de nuevo.';
        console.error('Error:', err);
      }
    });
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
