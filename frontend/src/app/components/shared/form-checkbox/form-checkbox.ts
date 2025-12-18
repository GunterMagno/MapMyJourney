import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Checkbox input component for Reactive Forms
 * Wraps native checkbox with FormControl binding
 */
@Component({
  selector: 'app-form-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-checkbox.html',
  styleUrl: './form-checkbox.scss'
})
export class FormCheckboxComponent {
  @Input() label: string = '';
  @Input() control!: FormControl;
  @Input() disabled: boolean = false;
}
