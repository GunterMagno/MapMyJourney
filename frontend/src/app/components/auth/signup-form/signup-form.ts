import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormInput } from '../../shared/form-input/form-input';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [RouterModule, FormInput],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {
  onSubmit(): void {
    console.log('Formulario enviado');
  }
}
