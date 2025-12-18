import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button';
import { CardComponent } from '../../shared/card/card';
import { FormInputComponent } from '../../shared/form-input/form-input';
import { FormTextareaComponent } from '../../shared/form-textarea/form-textarea';
import { FormSelectComponent, SelectOption } from '../../shared/form-select/form-select';
import { AlertComponent } from '../../shared/alert/alert';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    FormInputComponent,
    FormTextareaComponent,
    FormSelectComponent,
    AlertComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.scss',
})
export class StyleGuideComponent implements OnInit {  // Form controls
  tripNameControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  emailErrorControl = new FormControl('invalidemail', [Validators.required, Validators.email]);
  emailValidControl = new FormControl('user@example.com', [Validators.required, Validators.email]);
  descriptionControl = new FormControl('', [Validators.required, Validators.minLength(10)]);
  categoryControl = new FormControl('', [Validators.required]);
  categoryErrorControl = new FormControl('', [Validators.required]);
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

  ngOnInit(): void {
    // Mark email error field as touched to show validation
    this.emailErrorControl.markAsTouched();
    this.emailValidControl.markAsTouched();
    this.categoryErrorControl.markAsTouched();
  }

  onAlertClose(type: string): void {
    this.showAlerts[type as keyof typeof this.showAlerts] = false;
  }
}
