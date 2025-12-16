import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-input.html',
  styleUrl: './form-input.scss',
})
export class FormInput {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() inputId: string = '';
  @Input() required: boolean = false;
  @Input() hasError: boolean = false;
  @Input() errorMessage: string = '';
}
