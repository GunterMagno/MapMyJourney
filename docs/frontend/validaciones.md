# Formularios Reactivos Avanzados y Validaciones - FASE 3

## Índice
1. [Introducción](#introducción)
2. [Validadores Sincronos](#validadores-sincronos)
3. [Validadores Personalizados](#validadores-personalizados)
4. [Validadores Asincronos](#validadores-asincronos)
5. [Cross-Field Validators](#cross-field-validators)
6. [FormArray Dinámico](#formarray-dinámico)
7. [Catálogo de Validadores](#catálogo-de-validadores)
8. [Feedback Visual](#feedback-visual)
9. [Ejemplo Completo](#ejemplo-completo)

---

## Introducción

La FASE 3 implementa **validación robusta y feedback visual** usando Reactive Forms. Los validadores se organizan en:

- **Síncronos**: Ejecutan inmediatamente (required, email, minLength)
- **Personalizados**: Lógica específica del negocio (passwordStrength, nif)
- **Asincronos**: Consultan servidor (uniqueEmail, uniqueNif)
- **Cross-Field**: Validan relaciones entre campos (password match, date range)

---

## Validadores Sincronos

### Validadores Built-in de Angular

```typescript
import { Validators } from '@angular/forms';

// Required
Validators.required // Campo obligatorio

// Email
Validators.email // Formato email válido

// Longitud
Validators.minLength(3) // Mínimo 3 caracteres
Validators.maxLength(50) // Máximo 50 caracteres

// Números
Validators.min(0) // Valor mínimo
Validators.max(100) // Valor máximo

// Patrón regex
Validators.pattern(/^[A-Z]+$/) // Solo mayúsculas

// Requerido si control tiene valor
Validators.requiredTrue // Checkbox debe estar checked
```

### Ejemplo de Uso en FormBuilder

```typescript
this.form = this.fb.group({
  // Campo simple con múltiples validadores
  name: [
    '',
    [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50)
    ]
  ],

  // Email con validación
  email: [
    '',
    [Validators.required, Validators.email]
  ],

  // Número en rango
  age: [
    '',
    [Validators.required, Validators.min(18), Validators.max(120)]
  ]
});
```

---

## Validadores Personalizados

### Validador de Fortaleza de Contraseña

**Ubicación**: `frontend/src/app/services/custom-validators.ts`

```typescript
static passwordStrength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const requirements = {
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      minLength: value.length >= 8
    };

    const allMet = Object.values(requirements).every(v => v);

    if (!allMet) {
      const missing = Object.entries(requirements)
        .filter(([_, met]) => !met)
        .map(([key]) => key);
      
      return {
        passwordStrength: `Requiere: ${missing.join(', ')}`
      };
    }

    return null;
  };
}
```

**Requisitos**:
- ✅ Mínimo 8 caracteres
- ✅ Al menos 1 mayúscula
- ✅ Al menos 1 minúscula
- ✅ Al menos 1 número
- ✅ Al menos 1 carácter especial

**Ejemplo de Uso**:
```typescript
password: [
  '',
  [Validators.required, CustomValidators.passwordStrength()]
]
```

---

### Validador de NIF (Español)

**Ubicación**: `frontend/src/app/services/custom-validators.ts`

```typescript
static nif(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    // Validar formato: 8 dígitos + 1 letra
    const nifRegex = /^[0-9]{8}[A-Z]$/i;
    if (!nifRegex.test(value)) {
      return { nif: 'Formato: 8 dígitos + 1 letra' };
    }

    // Algoritmo de validación de NIF
    const nifsLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const dniNumber = parseInt(value.substring(0, 8), 10);
    const expectedLetter = nifsLetters[dniNumber % 23].toUpperCase();
    const providedLetter = value.charAt(8).toUpperCase();

    if (expectedLetter !== providedLetter) {
      return { nif: 'Letra del NIF no válida' };
    }

    return null;
  };
}
```

**Formato**: `12345678Z` (8 números + 1 letra)

**Ejemplo de Uso**:
```typescript
nif: [
  '',
  [Validators.required, CustomValidators.nif()]
]
```

---

## Validadores Asincronos

### Validador: Email Único

**Ubicación**: `frontend/src/app/services/custom-validators.ts`

```typescript
static uniqueEmail(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    // Debounce para no sobrecargar servidor
    return of(control.value).pipe(
      debounceTime(500),
      switchMap(email => {
        // TODO: Reemplazar con HTTP call real
        return this.http.post<{ exists: boolean }>(
          '/api/auth/check-email',
          { email }
        ).pipe(
          map(response => response.exists ? { emailTaken: true } : null),
          catchError(() => of(null))
        );
      })
    );
  };
}
```

**Características**:
- ✅ Debounce de 500ms para no hacer request por cada keystroke
- ✅ switchMap cancela peticiones anteriores si hay nueva
- ✅ Maneja errores de red gracefully

**Ejemplo de Uso**:
```typescript
email: [
  '',
  {
    validators: [Validators.required, Validators.email],
    asyncValidators: [CustomValidators.uniqueEmail()],
    updateOn: 'blur' // Solo valida cuando pierde foco
  }
]
```

---

### Validador: NIF Único

**Ubicación**: `frontend/src/app/services/custom-validators.ts`

Similar a uniqueEmail pero para NIF.

```typescript
static uniqueNif(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return of(control.value).pipe(
      debounceTime(500),
      switchMap(nif => {
        // TODO: HTTP POST a backend
        return of(/* response from server */);
      }),
      catchError(() => of(null))
    );
  };
}
```

---

## Cross-Field Validators

### Validador: Coincidencia de Contraseñas

```typescript
static matchPassword(passwordField: string, confirmField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control.parent;
    if (!form) return null;

    const pwdControl = form.get(passwordField);
    const confirmControl = form.get(confirmField);

    if (!pwdControl || !confirmControl) return null;

    if (pwdControl.value !== confirmControl.value) {
      confirmControl.setErrors({ 
        ...confirmControl.errors, 
        matchPassword: true 
      });
      return null;
    }

    // Limpiar error si coinciden
    if (confirmControl.errors) {
      delete confirmControl.errors['matchPassword'];
      if (Object.keys(confirmControl.errors).length === 0) {
        confirmControl.setErrors(null);
      }
    }

    return null;
  };
}
```

**Uso**:
```typescript
this.form = this.fb.group(
  {
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  },
  {
    validators: [
      CustomValidators.matchPassword('password', 'confirmPassword')
    ]
  }
);
```

---

### Validador: Rango de Fechas

```typescript
static dateRangeValidator(startField: string, endField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control.parent;
    if (!form) return null;

    const startControl = form.get(startField);
    const endControl = form.get(endField);

    if (!startControl?.value || !endControl?.value) return null;

    const startDate = new Date(startControl.value);
    const endDate = new Date(endControl.value);

    if (endDate < startDate) {
      endControl.setErrors({ 
        ...endControl.errors, 
        dateRange: true 
      });
    }

    return null;
  };
}
```

**Uso**:
```typescript
tripForm = this.fb.group(
  {
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  },
  {
    validators: [
      CustomValidators.dateRangeValidator('startDate', 'endDate')
    ]
  }
);
```

---

## FormArray Dinámico

### Concepto

FormArray permite agregar/remover controles dinámicamente.

```typescript
// Crear FormArray
phoneNumbers: this.fb.array([
  this.fb.control('', [Validators.required, Validators.pattern(/^[0-9\s\-\+\(\)]{9,15}$/)])
])

// En el template
<div formArrayName="phoneNumbers">
  @for (control of getPhones().controls; track $index) {
    <input [formControl]="control">
    <button (click)="removePhone($index)">Remove</button>
  }
  <button (click)="addPhone()">Add Phone</button>
</div>
```

### Implementación Completa

```typescript
export class SignupFormComponent {
  signupForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      // Otros campos...
      phoneNumbers: this.fb.array([
        this.createPhoneControl()
      ])
    });
  }

  // Crear un control de teléfono
  private createPhoneControl(): FormControl {
    return this.fb.control('', [
      Validators.required,
      Validators.pattern(/^[0-9\s\-\+\(\)]{9,15}$/)
    ]);
  }

  // Getter para acceder al FormArray
  get phoneNumbers(): FormArray {
    return this.signupForm.get('phoneNumbers') as FormArray;
  }

  // Agregar teléfono
  addPhoneNumber(): void {
    this.phoneNumbers.push(this.createPhoneControl());
  }

  // Remover teléfono
  removePhoneNumber(index: number): void {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }

  // En template
  get canRemovePhone(): boolean {
    return this.phoneNumbers.length > 1;
  }
}
```

---

## Catálogo de Validadores

| Nombre | Tipo | Requiere | Descripción |
|--------|------|----------|-------------|
| **required** | Sync | N/A | Campo es obligatorio |
| **email** | Sync | N/A | Formato email válido (RFC 5322) |
| **minLength(n)** | Sync | N/A | Mínimo n caracteres |
| **maxLength(n)** | Sync | N/A | Máximo n caracteres |
| **min(n)** | Sync | N/A | Valor numérico mínimo |
| **max(n)** | Sync | N/A | Valor numérico máximo |
| **pattern(regex)** | Sync | N/A | Coincide con regex |
| **requiredTrue** | Sync | N/A | Checkbox debe estar checked |
| **passwordStrength** | Custom Sync | - | Mayús, minús, número, especial, 8+ chars |
| **nif** | Custom Sync | - | Validador de NIF español |
| **matchPassword(a, b)** | Custom Sync (Cross) | - | Campo a coincide con b |
| **dateRangeValidator(a, b)** | Custom Sync (Cross) | - | Fecha b >= fecha a |
| **uniqueEmail** | Async | HTTP | Verifica email no existe en BD |
| **uniqueNif** | Async | HTTP | Verifica NIF no existe en BD |

---

## Feedback Visual

### Mostrar Errores Solo Cuando Sea Necesario

```html
<!-- Mostrar error solo si field fue tocado O está dirty -->
@if (emailControl.invalid && (emailControl.touched || emailControl.dirty)) {
  <span class="error">{{ getErrorMessage(emailControl) }}</span>
}
```

### Estados del Control

```typescript
// Estados disponibles
control.valid // ✅ Control es válido
control.invalid // ❌ Control es inválido
control.touched // Usuario ha interactuado
control.untouched // Usuario aún no ha interactuado
control.dirty // El valor ha cambiado
control.pristine // El valor no ha cambiado
control.errors // Objeto con errores
control.pending // Validación async en progreso
```

### Clases CSS Dinámicas

```html
<input
  [class.input--invalid]="control.invalid && control.touched"
  [class.input--valid]="control.valid && control.touched"
  [disabled]="control.pending">

<style>
.input--invalid {
  border-color: var(--error-color);
}

.input--valid {
  border-color: var(--correct-color);
}
</style>
```

### Componente Reutilizable

```typescript
@Component({
  selector: 'app-form-input',
  template: `
    <label>{{ label }}</label>
    <input
      [formControl]="control"
      [class.invalid]="isInvalid">
    @if (isInvalid) {
      <span class="error">{{ errorMessage }}</span>
    }
  `
})
export class FormInputComponent {
  @Input() label!: string;
  @Input() control!: FormControl;

  get isInvalid(): boolean {
    return this.control.invalid && (this.control.touched || this.control.dirty);
  }

  get errorMessage(): string {
    const errors = this.control.errors;
    if (!errors) return '';
    if (errors['required']) return 'Campo requerido';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['passwordStrength']) return errors['passwordStrength'];
    return 'Campo inválido';
  }
}
```

---

## Ejemplo Completo

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CustomValidators } from './custom-validators';

@Component({
  selector: 'app-signup',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- Name -->
      <app-form-input
        label="Nombre"
        [control]="form.get('name')!">
      </app-form-input>

      <!-- Email with async validation -->
      <app-form-input
        label="Email"
        type="email"
        [control]="form.get('email')!">
        @if (emailControl.pending) {
          <span class="validating">Verificando...</span>
        }
      </app-form-input>

      <!-- NIF -->
      <app-form-input
        label="NIF"
        [control]="form.get('nif')!">
      </app-form-input>

      <!-- Password -->
      <app-form-input
        label="Contraseña"
        type="password"
        [control]="form.get('password')!">
      </app-form-input>

      <!-- Confirm Password -->
      <app-form-input
        label="Confirmar Contraseña"
        type="password"
        [control]="form.get('confirmPassword')!">
      </app-form-input>

      <!-- Phone Numbers (FormArray) -->
      <fieldset formArrayName="phoneNumbers">
        <legend>Teléfonos</legend>
        @for (phone of phoneNumbers.controls; track $index) {
          <div class="phone-group">
            <input [formControl]="phone" placeholder="+34 123 456 789">
            <button type="button" (click)="removePhone($index)">
              Remover
            </button>
          </div>
        }
        <button type="button" (click)="addPhone()">
          Agregar Teléfono
        </button>
      </fieldset>

      <!-- Submit -->
      <button type="submit" [disabled]="form.invalid">
        Registrarse
      </button>
    </form>
  `
})
export class SignupComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50)
          ]
        ],
        email: [
          '',
          {
            validators: [Validators.required, Validators.email],
            asyncValidators: [CustomValidators.uniqueEmail()],
            updateOn: 'blur'
          }
        ],
        nif: [
          '',
          {
            validators: [Validators.required, CustomValidators.nif()],
            asyncValidators: [CustomValidators.uniqueNif()],
            updateOn: 'blur'
          }
        ],
        password: [
          '',
          [Validators.required, CustomValidators.passwordStrength()]
        ],
        confirmPassword: ['', Validators.required],
        phoneNumbers: this.fb.array([
          this.fb.control('', [
            Validators.required,
            Validators.pattern(/^[0-9\s\-\+\(\)]{9,15}$/)
          ])
        ])
      },
      {
        validators: [
          CustomValidators.matchPassword('password', 'confirmPassword')
        ]
      }
    );
  }

  get phoneNumbers(): FormArray {
    return this.form.get('phoneNumbers') as FormArray;
  }

  get emailControl() {
    return this.form.get('email')!;
  }

  addPhone(): void {
    this.phoneNumbers.push(
      this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[0-9\s\-\+\(\)]{9,15}$/)
      ])
    );
  }

  removePhone(index: number): void {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form Value:', this.form.getRawValue());
      // Enviar al servidor
    }
  }
}
```

---

## Buenas Prácticas

### 1. Validar en el Lugar Correcto

```typescript
// ✅ Validar en FormControl
password: ['', CustomValidators.passwordStrength()]

// ❌ NO hacer en el componente
ngOnInit(): void {
  if (this.validatePassword(this.form.value.password)) { // Evitar
    // ...
  }
}
```

### 2. Usar updateOn Correctamente

```typescript
// ✅ Async validation en blur (menos requests)
email: [
  '',
  {
    asyncValidators: [CustomValidators.uniqueEmail()],
    updateOn: 'blur' // Solo cuando pierde foco
  }
]

// ✅ Sync validation en change (inmediato)
password: ['', CustomValidators.passwordStrength()]
// updateOn: 'change' por defecto
```

### 3. Indicar Validación Async en Progress

```html
@if (emailControl.pending) {
  <span class="spinner">Verificando...</span>
}

<style>
.spinner {
  color: var(--info-color);
  font-size: var(--font-size-small);
}
</style>
```

### 4. No Validar Excesivamente en Async

```typescript
// ✅ Debounce + único request
debounceTime(500),
switchMap(email => this.http.post(...))

// ❌ Request en cada keystroke
valueChanges.pipe(
  switchMap(email => this.http.post(...))
)
```
