# Arquitectura de Servicios y Comunicación - FASE 2

## Índice
1. [Introducción](#introducción)
2. [Patrón Unidirectional Data Flow](#patrón-unidirectional-data-flow)
3. [Servicios Implementados](#servicios-implementados)
4. [Patrones RxJS](#patrones-rxjs)
5. [Diagrama de Arquitectura](#diagrama-de-arquitectura)
6. [Casos de Uso](#casos-de-uso)
7. [Mejores Prácticas](#mejores-prácticas)

---

## Introducción

La FASE 2 se enfoca en **desacoplar la lógica de negocio de la vista** mediante servicios, estableciendo un flujo de datos unidireccional (Unidirectional Data Flow).

### Objetivos

- ✅ Separación de responsabilidades: componentes "dumb" vs servicios "smart"
- ✅ Comunicación entre componentes hermanos sin dependencias directas
- ✅ Gestión de estado global (autenticación, tema, notificaciones)
- ✅ Uso de RxJS Observables y Subjects
- ✅ Patrón Singleton para servicios inyectables

---

## Patrón Unidirectional Data Flow

### Concepto

El flujo de datos sigue un único camino:

```
┌─────────────────────────────────────────────────────────┐
│                   USUARIO INTERACTÚA                     │
│                  (click, input, etc)                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  COMPONENTE A                  │
        │  - Captura evento              │
        │  - Llama al método del servicio│
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │  SERVICIO SMART                │
        │  - Procesa lógica              │
        │  - Actualiza estado (Subject)  │
        │  - HTTP calls, cálculos        │
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │  STATE (BehaviorSubject)       │
        │  - Nueva estado emitido        │
        │  - Todos se suscriben a él     │
        └────────┬───────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    COMPONENTE A     COMPONENTE B
    se re-renderiza  se re-renderiza
    (sin acoplamiento directo)
```

### Ventajas

1. **Desacoplamiento**: Componentes no conocen uno del otro
2. **Testabilidad**: Servicios fáciles de mockear
3. **Reusabilidad**: Lógica en servicios, reutilizable en cualquier componente
4. **Mantenibilidad**: Cambios centralizados en servicios
5. **Performance**: Control fino sobre qué se re-renderiza

### Ejemplo Práctico

```typescript
// ❌ ACOPLADO (MALO)
@Component({
  selector: 'app-sidebar'
})
export class SidebarComponent {
  @Output() toggleSidebar = new EventEmitter();
}

@Component({
  selector: 'app-header'
})
export class HeaderComponent {
  constructor(private sidebarComponent: SidebarComponent) {}
  
  onMenuClick(): void {
    this.sidebarComponent.toggleSidebar(); // Acoplado directo
  }
}

// ✅ DESACOPLADO (BUENO)
// Servicio actúa como intermediario
@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private sidebarStateSubject = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.sidebarStateSubject.asObservable();

  toggleSidebar(): void {
    const current = this.sidebarStateSubject.value;
    this.sidebarStateSubject.next(!current);
  }
}

// Componente Header
@Component({
  selector: 'app-header'
})
export class HeaderComponent {
  constructor(private commService: CommunicationService) {}
  
  onMenuClick(): void {
    this.commService.toggleSidebar(); // A través del servicio
  }
}

// Componente Sidebar
@Component({
  selector: 'app-sidebar'
})
export class SidebarComponent implements OnInit {
  isOpen$ = this.commService.sidebarState$;

  constructor(private commService: CommunicationService) {}
}

// Template - async pipe se suscribe automáticamente
<div [class.sidebar--open]="isOpen$ | async">...</div>
```

---

## Servicios Implementados

### 1. **AuthService** ✅

**Ubicación**: `frontend/src/app/services/auth.service.ts`

**Responsabilidad**: Gestionar autenticación, tokens y usuario actual

**BehaviorSubjects**:
- `currentUser$`: Observable del usuario actual
- `isAuthenticated$`: Observable del estado de autenticación

**Métodos Principales**:
```typescript
// Simula login (reemplazar con HTTP call)
login(email: string, password: string): Observable<AuthResponse>

// Simula signup
signup(name: string, email: string, password: string): Observable<AuthResponse>

// Logout y limpia datos
logout(): void

// Obtiene token del localStorage
getToken(): string | null

// Comprueba si hay token válido
hasValidToken(): boolean

// Obtiene usuario actual (sincrónico)
getCurrentUser(): User | null
```

**Ejemplo de Uso**:
```typescript
@Component({
  selector: 'app-login'
})
export class LoginComponent {
  constructor(private authService: AuthService) {}

  onLogin(email: string, password: string): void {
    this.authService.login(email, password)
      .subscribe({
        next: (response) => {
          console.log('Logged in:', response.user);
        },
        error: (err) => {
          console.error('Login failed:', err);
        }
      });
  }
}

// En otro componente, suscribirse al estado
@Component({
  selector: 'app-profile'
})
export class ProfileComponent {
  currentUser$ = this.authService.currentUser$;
  isLoggedIn$ = this.authService.isAuthenticated$;

  constructor(private authService: AuthService) {}
}
```

---

### 2. **CommunicationService** ✅

**Ubicación**: `frontend/src/app/services/communication.service.ts`

**Responsabilidad**: Comunicación entre componentes hermanos sin acoplamiento

**Subjects**:
- `modal$`: Eventos para abrir/cerrar modales
- `sidebarState$`: Estado del sidebar
- `navState$`: Estado de navegación

**Métodos Principales**:
```typescript
// Emite evento para abrir modal
openModal(type: string, data?: any): void

// Cierra cualquier modal abierto
closeModal(): void

// Alterna estado del sidebar
toggleSidebar(): void

// Establece estado del sidebar
setSidebarState(isOpen: boolean): void

// Obtiene estado actual del sidebar
getSidebarState(): boolean

// Emite cambio de estado de navegación
updateNavState(state: any): void

// Obtiene estado de navegación actual
getNavState(): any
```

**Ejemplo de Uso**:
```typescript
// Componente A: Abre un modal de confirmación
@Component({
  selector: 'app-delete-button'
})
export class DeleteButtonComponent {
  constructor(private commService: CommunicationService) {}

  onDelete(): void {
    this.commService.openModal('confirm', {
      title: '¿Estás seguro?',
      message: 'Esta acción no se puede deshacer'
    });
  }
}

// Componente Modal: Escucha eventos
@Component({
  selector: 'app-modal'
})
export class ModalComponent implements OnInit {
  constructor(private commService: CommunicationService) {}

  ngOnInit(): void {
    this.commService.modal$.subscribe(event => {
      if (event.type === 'confirm') {
        this.showConfirmModal(event.data);
      }
    });
  }
}
```

---

### 3. **ToastService** ✅

**Ubicación**: `frontend/src/app/services/toast.service.ts`

**Responsabilidad**: Mostrar notificaciones (success, error, warning, info)

**Subjects**:
- `toast$`: Emite nuevos toasts
- `dismiss$`: Emite IDs de toasts a cerrar

**Métodos Principales**:
```typescript
// Toast de éxito (auto-cierra en 3s)
success(message: string, duration?: number): void

// Toast de error (auto-cierra en 4s)
error(message: string, duration?: number): void

// Toast de advertencia
warning(message: string, duration?: number): void

// Toast de información
info(message: string, duration?: number): void

// Toast personalizado
show(message: string, type: ToastType, duration?: number): void

// Cierra toast manualmente
dismiss(id: string): void
```

**Ejemplo de Uso**:
```typescript
@Component({
  selector: 'app-form'
})
export class FormComponent {
  constructor(private toastService: ToastService) {}

  onSubmit(): void {
    this.saveData().subscribe({
      next: () => {
        this.toastService.success('Datos guardados correctamente');
      },
      error: (err) => {
        this.toastService.error(`Error: ${err.message}`);
      }
    });
  }
}
```

---

### 4. **LoadingService** ✅

**Ubicación**: `frontend/src/app/services/loading.service.ts`

**Responsabilidad**: Gestionar estado de carga global

**Características**:
- Usa contador para manejar múltiples peticiones simultáneas
- Observable `isLoading$` reactivo
- Método `start()` que retorna función para detener carga

**Métodos Principales**:
```typescript
// Inicia carga y retorna función para detener
start(): () => void

// Obtiene estado actual (sincrónico)
isLoading(): boolean

// Simula operación con carga
simulateLoading(durationMs?: number): Promise<void>

// Resetea contador a 0
reset(): void
```

**Ejemplo de Uso**:
```typescript
@Component({
  selector: 'app-data-list'
})
export class DataListComponent {
  isLoading$ = this.loadingService.isLoading$;

  constructor(private loadingService: LoadingService) {}

  loadData(): void {
    const stop = this.loadingService.start();
    
    this.dataService.getData().subscribe({
      next: (data) => {
        this.data = data;
        stop(); // Detiene el spinner
      },
      error: () => {
        stop();
      }
    });
  }
}

// En template
<app-loading></app-loading> <!-- Muestra spinner si isLoading$ es true -->
```

---

### 5. **ThemeService** ✅

**Ubicación**: `frontend/src/app/services/theme.service.ts`

**Responsabilidad**: Gestionar tema oscuro/claro

**Características**:
- Detecta preferencia del sistema con `matchMedia`
- Persiste selección en `localStorage`
- Aplica clase `.dark-mode` al `document.documentElement`

**Métodos Principales**:
```typescript
// Alterna entre claro y oscuro
toggleTheme(): void

// Establece tema explícitamente
setTheme(theme: 'light' | 'dark'): void

// Obtiene tema actual
getCurrentTheme(): 'light' | 'dark'

// Comprueba si es modo oscuro
isDarkMode(): boolean

// Observa cambios en preferencia del sistema
watchSystemPreference(): Observable<boolean>
```

**Ejemplo de Uso**:
```typescript
@Component({
  selector: 'app-header'
})
export class HeaderComponent {
  isDarkTheme$ = this.themeService.theme$
    .pipe(map(theme => theme === 'dark'));

  constructor(private themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
```

---

## Patrones RxJS

### BehaviorSubject

Emite el valor más reciente cuando se suscribe y valores posteriores.

```typescript
// Crear
private userSubject = new BehaviorSubject<User | null>(null);
public user$ = this.userSubject.asObservable();

// Actualizar
this.userSubject.next(newUser);

// Obtener valor actual
const currentUser = this.userSubject.value;

// Suscribirse (obtiene valor actual + futuros)
this.user$.subscribe(user => console.log(user));
```

### Subject

Emite solo a suscriptores posteriores, no mantiene estado.

```typescript
// Crear
private clickSubject = new Subject<MouseEvent>();
public click$ = this.clickSubject.asObservable();

// Emitir
this.clickSubject.next(event);

// Suscribirse (solo recibe eventos posteriores)
this.click$.subscribe(event => console.log(event));
```

### Operadores Principales

| Operador | Uso |
|----------|-----|
| `map()` | Transforma valor emitido |
| `filter()` | Filtra valores según condición |
| `switchMap()` | Cambia Observable internamente |
| `debounceTime()` | Espera X ms sin emisión antes de emitir |
| `takeUntil()` | Completa Observable cuando otro emite |
| `async` pipe | Se suscribe automáticamente en template |

**Ejemplo**:
```typescript
// Debounce + Async validation
this.emailControl.valueChanges
  .pipe(
    debounceTime(500),
    switchMap(email => this.authService.checkEmailExists(email)),
    takeUntil(this.destroy$)
  )
  .subscribe(exists => {
    if (exists) {
      this.emailControl.setErrors({ emailTaken: true });
    }
  });
```

---

## Diagrama de Arquitectura

```
┌────────────────────────────────────────────────────────────┐
│                        COMPONENTES                          │
│  (Header, Sidebar, Forms, Modals, etc)                    │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ Inyectan servicios
                 │
    ┌────────────┴──────────────────────┬─────────────┐
    │                                   │             │
    ▼                                   ▼             ▼
┌─────────────────┐         ┌──────────────────┐  ┌────────────┐
│  AuthService    │         │ Communication    │  │ ThemeService
│                 │         │    Service       │  │
│ Subjects:       │         │                  │  │ Observable:
│ - currentUser$  │         │ Subjects:        │  │ - theme$
│ - isAuth$       │         │ - modal$         │  │
│                 │         │ - sidebarState$  │  │ Métodos:
│ Métodos:        │         │ - navState$      │  │ - toggle()
│ - login()       │         │                  │  │ - setTheme()
│ - signup()      │         │ Métodos:         │  │ - isDarkMode()
│ - logout()      │         │ - openModal()    │  │
│                 │         │ - toggleSidebar()│  │
└────────┬────────┘         └────────┬─────────┘  └────────┬───┘
         │                           │                     │
         │ localStorage              │ (sin estado)        │
         │ HTTP calls                │                     │ CSS variables
         │ BehaviorSubject           │ eventEmitter        │ localStorage
         │                           │                     │
    ┌────┴────────────────────────────┴─────────────────────┴────┐
    │                                                              │
    ▼                                                              ▼
┌──────────────────┐                                  ┌──────────────────┐
│ ToastComponent   │                                  │ LoadingComponent │
│                  │                                  │                  │
│ Escucha:         │                                  │ Escucha:         │
│ - toast$         │                                  │ - isLoading$     │
│ - dismiss$       │                                  │                  │
│                  │                                  │ Muestra spinner  │
│ Muestra notif.   │                                  │ overlay global   │
└──────────────────┘                                  └──────────────────┘
```

---

## Casos de Uso

### Caso 1: Abrir Modal desde Componente A, Cerrar desde Componente B

```typescript
// Componente A: Button para abrir modal
@Component({
  selector: 'app-delete-btn',
  template: `
    <button (click)="onDelete()">Delete</button>
  `
})
export class DeleteButtonComponent {
  constructor(private commService: CommunicationService) {}

  onDelete(): void {
    this.commService.openModal('delete-confirm', {
      itemId: 123,
      itemName: 'Trip to Paris'
    });
  }
}

// Componente Modal: Independiente
@Component({
  selector: 'app-modal',
  template: `
    @if (isOpen) {
      <div class="modal">
        <button (click)="onConfirm()">Confirm</button>
        <button (click)="commService.closeModal()">Cancel</button>
      </div>
    }
  `
})
export class ModalComponent implements OnInit {
  isOpen = false;

  constructor(protected commService: CommunicationService) {}

  ngOnInit(): void {
    this.commService.modal$.subscribe(event => {
      if (event.type === 'delete-confirm') {
        this.isOpen = true;
      }
    });
  }

  onConfirm(): void {
    // Lógica de eliminación
    this.commService.closeModal();
  }
}
```

### Caso 2: Mostrar Toast desde Servicio Remoto

```typescript
@Component({
  selector: 'app-form'
})
export class FormComponent {
  constructor(
    private formService: FormService,
    private toastService: ToastService
  ) {}

  onSubmit(data: any): void {
    this.formService.save(data).subscribe({
      next: () => {
        this.toastService.success('Guardado exitosamente');
      },
      error: (err) => {
        this.toastService.error(err.message);
      }
    });
  }
}
```

### Caso 3: Mostrar Loading Global en HTTP Requests

Interceptor HTTP (idealmente):
```typescript
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const stop = this.loadingService.start();
    
    return next.handle(req).pipe(
      finalize(() => stop())
    );
  }
}
```

---

## Mejores Prácticas

### 1. Siempre Usar `providedIn: 'root'`

```typescript
// ✅ CORRECTO
@Injectable({
  providedIn: 'root' // Singleton automático
})
export class AuthService {}

// ❌ EVITAR
@Injectable()
export class AuthService {}
// Requiere: providers: [AuthService] en módulo
```

### 2. Limpiar Subscripciones

```typescript
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Handle data
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 3. Usar Async Pipe en Templates

```typescript
// ✅ CORRECTO (Se suscribe/desuscribe automáticamente)
<div>{{ currentUser$ | async | json }}</div>

// ❌ EVITAR (Manual subscription)
export class Component {
  currentUser: User;
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    // Falta ngOnDestroy para limpiar
  }
}
```

### 4. Separar Responsabilidades

```typescript
// ✅ Componente "Dumb"
@Component({
  selector: 'app-user-card'
})
export class UserCardComponent {
  @Input() user$!: Observable<User>;
  @Output() deleteClick = new EventEmitter<string>();

  onDelete(userId: string): void {
    this.deleteClick.emit(userId);
  }
}

// ✅ Componente "Smart"
@Component({
  selector: 'app-user-list'
})
export class UserListComponent {
  users$ = this.userService.getUsers();

  constructor(private userService: UserService) {}

  onDeleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.toastService.success('Usuario eliminado');
      }
    });
  }
}
```
