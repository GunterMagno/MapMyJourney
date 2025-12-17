import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-select.html',
  styleUrl: './form-select.scss',
})
export class FormSelectComponent {
  @Input() label: string = '';
  @Input() selectId: string = '';
  @Input() required: boolean = false;
  @Input() hasError: boolean = false;
  @Input() errorMessage: string = '';
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Selecciona una opción';
}
