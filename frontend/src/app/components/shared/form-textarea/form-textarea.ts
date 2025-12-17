import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-textarea.html',
  styleUrl: './form-textarea.scss',
})
export class FormTextareaComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() textareaId: string = '';
  @Input() required: boolean = false;
  @Input() hasError: boolean = false;
  @Input() errorMessage: string = '';
  @Input() rows: number = 4;
}
