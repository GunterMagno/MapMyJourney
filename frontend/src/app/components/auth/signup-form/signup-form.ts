import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormInputComponent } from '../../shared/form-input/form-input';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [RouterModule, FormInputComponent],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupFormComponent {
  onSubmit(): void {
    console.log('Formulario enviado');
  }
}
