import { CanDeactivateFn } from '@angular/router';
import { FormGroup } from '@angular/forms';

/**
 * Interface para componentes con formularios
 *
 * Los componentes que usen este guard deben implementar esta interfaz
 * para que el guard pueda acceder a la propiedad "form"
 */
export interface FormComponent {
  form: FormGroup;
}

/**
 * Pending Changes Guard - Previene salida de formularios sin guardar
 *
 * Si el formulario está "dirty" (tiene cambios sin guardar), muestra una
 * confirmación. Si el usuario dice "Cancelar", se bloquea la navegación.
 *
 * Uso en rutas:
 * { path: 'usuario/perfil/editar', component: ProfileFormComponent, canDeactivate: [pendingChangesGuard] }
 */
export const pendingChangesGuard: CanDeactivateFn<FormComponent> = (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  if (component.form?.dirty) {
    const confirmExit = confirm(
      '⚠️ Hay cambios sin guardar. ¿Seguro que quieres salir?'
    );
    return confirmExit;
  }
  return true;
};
