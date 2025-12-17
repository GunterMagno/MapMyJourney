import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/button/button';
import { CardComponent } from '../../shared/card/card';
import { FormInputComponent } from '../../shared/form-input/form-input';
import { FormTextareaComponent } from '../../shared/form-textarea/form-textarea';
import { FormSelectComponent, SelectOption } from '../../shared/form-select/form-select';
import { AlertComponent } from '../../shared/alert/alert';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent,
    AlertComponent,
  ],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.scss',
})
export class StyleGuideComponent {
  // Form data
  expenseCategories: SelectOption[] = [
    { label: 'Transporte', value: 'transport' },
    { label: 'Comida', value: 'food' },
    { label: 'Alojamiento', value: 'accommodation' },
    { label: 'Entretenimiento', value: 'entertainment' },
    { label: 'Otro', value: 'other' },
  ];

  // Alert examples
  showAlerts = {
    success: true,
    error: true,
    warning: true,
    info: true,
  };

  onAlertClose(type: string): void {
    this.showAlerts[type as keyof typeof this.showAlerts] = false;
  }
}
