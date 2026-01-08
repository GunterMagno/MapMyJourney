# FASE 5: Capa de Servicios y HTTP

## Descripción General

FASE 5 implementa la capa completa de servicios HTTP del frontend, permitiendo comunicación con el backend Spring Boot. Se implementa con arquitectura hexagonal, separación de responsabilidades y tipado estricto de TypeScript.

## Arquitectura del Sistema HTTP

```
┌─────────────────────────────────────────────────────────┐
│          COMPONENTES DE ANGULAR (Vistas)                │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│     DOMAIN SERVICES (trip.service, expense.service)     │
│            - Lógica de negocio                          │
│            - Orquestación de datos                      │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│             API SERVICE (api.service)                   │
│      - Wrapper centralizado de HttpClient               │
│      - Métodos CRUD genéricos                           │
│      - Manejo centralizado de errores                   │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│           INTERCEPTORES FUNCIONALES                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 1. authInterceptor                               │   │
│  │    - Inyecta Bearer token en Authorization       │   │
│  │    - Agrega header X-App-Client                  │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 2. errorInterceptor                              │   │
│  │    - 401/403: Redirige a /auth/login             │   │
│  │    - 404: Muestra advertencia                    │   │
│  │    - 500+: Muestra error de servidor             │   │
│  │    - 400: Muestra error de validación            │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 3. loadingInterceptor                            │   │
│  │    - Muestra/oculta estado de carga global       │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│             HttpClient (Angular Core)                   │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│            API Backend (Spring Boot)                    │
│        http://localhost:8080/api                        │
└─────────────────────────────────────────────────────────┘
```

## Archivos Creados

### 1. Modelos de Datos (`core/models/`)

**Archivo:** `user.model.ts`
- `User`: Modelo del usuario autenticado
- `LoginDto`: DTO para login
- `SignupDto`: DTO para registro
- `AuthResponse`: Respuesta de autenticación

**Archivo:** `trip.model.ts`
- `Trip`: Modelo de viaje (listado)
- `CreateTripDto`: DTO para crear viaje
- `UpdateTripDto`: DTO para actualizar viaje
- `TripDetail`: Modelo completo con participantes y gastos

**Archivo:** `expense.model.ts`
- `Expense`: Modelo de gasto (básico)
- `CreateExpenseDto`: DTO para crear gasto
- `UpdateExpenseDto`: DTO para actualizar gasto
- `ExpenseWithDetails`: Modelo completo con pagador y participantes

**Archivo:** `api-response.model.ts`
- `ApiPaginatedResponse<T>`: Respuesta paginada genérica
- `ApiResponse<T>`: Respuesta simple genérica
- `ApiErrorResponse`: Respuesta de error del servidor
- `AsyncState<T>`: Estado para manejar async (Loading, Success, Error)
- `PaginationOptions`: Opciones de paginación

### 2. Servicio API (`core/services/api.service.ts`)

Wrapper centralizado de HttpClient que proporciona:

```typescript
// Métodos genéricos CRUD
get<T>(endpoint: string, options?: any): Observable<T>
post<T>(endpoint: string, body: any): Observable<T>
put<T>(endpoint: string, body: any): Observable<T>
patch<T>(endpoint: string, body: any): Observable<T>
delete<T>(endpoint: string): Observable<T>

// Helpers privados
private buildParams(params?: Record<string, any>): HttpParams
private handleError(error: HttpErrorResponse): Observable<never>
```

**Características:**
- Tipado genérico T para cualquier modelo
- URL base centralizada (`environment.apiUrl`)
- Manejo centralizado de errores
- Soporte para query parameters
- Compatible con interceptores

### 3. Interceptores Funcionales (`core/interceptors/`)

#### `auth.interceptor.ts`
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-App-Client': 'MapMyJourney-Frontend'
      }
    });
  }
  return next(req);
};
```

#### `error.interceptor.ts`
```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejo por código de estado
      // 401/403 → Logout + redirige a /auth/login
      // 404 → Muestra advertencia
      // 500+ → Error de servidor
      // 400 → Error de validación
    })
  );
};
```

#### `loading.interceptor.ts`
```typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.show();
  return next(req).pipe(
    finalize(() => loading.hide())
  );
};
```

## Servicios de Dominio

### `trip.service.ts`

Servicio para gestión de viajes:

```typescript
export class TripService {
  // Listar viajes del usuario
  getMyTrips(page: number, pageSize: number): Observable<ApiPaginatedResponse<Trip>>
  
  // Obtener detalles de un viaje (con participantes y gastos)
  getTripDetails(tripId: string): Observable<TripDetail>
  
  // CRUD de viajes
  createTrip(data: CreateTripDto): Observable<Trip>
  updateTrip(tripId: string, data: UpdateTripDto): Observable<Trip>
  deleteTrip(tripId: string): Observable<ApiResponse<void>>
  
  // Gestión de participantes
  addParticipant(tripId: string, participantId: string): Observable<TripDetail>
  removeParticipant(tripId: string, participantId: string): Observable<TripDetail>
}
```

**Endpoints utilizados:**
- `GET /api/trips` - Listar viajes del usuario (paginado)
- `GET /api/trips/:id` - Obtener detalles del viaje
- `POST /api/trips` - Crear nuevo viaje
- `PUT /api/trips/:id` - Actualizar viaje
- `DELETE /api/trips/:id` - Eliminar viaje
- `POST /api/trips/:id/participants` - Agregar participante
- `DELETE /api/trips/:id/participants/:participantId` - Remover participante

### `expense.service.ts`

Servicio para gestión de gastos:

```typescript
export class ExpenseService {
  // Listar gastos de un viaje
  getExpensesByTrip(tripId: string, page: number, pageSize: number): Observable<ApiPaginatedResponse<ExpenseWithDetails>>
  
  // Crear gasto
  addExpense(data: CreateExpenseDto): Observable<Expense>
  
  // Actualizar gasto
  updateExpense(expenseId: string, data: UpdateExpenseDto): Observable<Expense>
  
  // Eliminar gasto
  deleteExpense(expenseId: string): Observable<ApiResponse<void>>
  
  // Obtener liquidaciones del viaje (quién debe a quién)
  getSettlements(tripId: string): Observable<Settlement[]>
  
  // Obtener resumen de gastos por persona
  getExpenseSummary(tripId: string): Observable<Record<string, number>>
  
  // Marcar gasto como pagado
  markAsPaid(expenseId: string): Observable<Expense>
}
```

**Endpoints utilizados:**
- `GET /api/expenses?tripId=:id` - Listar gastos del viaje
- `POST /api/expenses` - Crear gasto
- `PUT /api/expenses/:id` - Actualizar gasto
- `DELETE /api/expenses/:id` - Eliminar gasto
- `GET /api/expenses/settlements/:tripId` - Obtener liquidaciones
- `GET /api/expenses/summary/:tripId` - Obtener resumen
- `PATCH /api/expenses/:id/mark-as-paid` - Marcar como pagado

## Servicio de Autenticación (`auth.service.ts`)

Refactorizado para usar ApiService en lugar de mocks:

```typescript
export class AuthService {
  // Login con HTTP real
  login(email: string, password: string): Observable<AuthResponse>
  
  // Signup con HTTP real
  signup(name: string, email: string, password: string): Observable<AuthResponse>
  
  // Logout
  logout(): void
  
  // Getters síncrónos
  getToken(): string | null
  hasValidToken(): boolean
  getCurrentUser(): User | null
  isAuthenticated(): boolean
  isLoggedIn(): boolean
  
  // Observables
  currentUser$: Observable<User | null>
  isAuthenticated$: Observable<boolean>
}
```

**Endpoints utilizados:**
- `POST /auth/login` - Autenticar usuario
- `POST /auth/signup` - Registrar nuevo usuario

## Configuración de Entorno

**Archivo:** `environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

Para producción, cambiar `apiUrl` a `'https://api.mapmyjourney.com'`

## Integración en `app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loadingInterceptor
      ])
    )
  ]
};
```

## Flujo de Ejecución de Interceptores

1. **Request saliente (Cliente → Servidor)**
   ```
   AuthInterceptor: Inyecta Bearer token
   ↓
   ErrorInterceptor: Prepara manejo de errores
   ↓
   LoadingInterceptor: Muestra loader (show)
   ↓
   HttpClient: Envía petición HTTP
   ```

2. **Response entrante (Servidor → Cliente)**
   ```
   LoadingInterceptor: Oculta loader (finalize)
   ↓
   ErrorInterceptor: Procesa errores si aplica
   ↓
   Componente: Recibe datos o error
   ```

## Casos de Error Manejados

| Código | Manejado por | Acción |
|--------|--------------|--------|
| 400 | errorInterceptor | Toast: "Error de validación" |
| 401 | errorInterceptor | Logout + Redirige a /auth/login |
| 403 | errorInterceptor | Logout + Redirige a /auth/login |
| 404 | errorInterceptor | Toast: "Recurso no encontrado" |
| 500+ | errorInterceptor | Toast: "Error del servidor" |

## Tipado Estricto

Todos los servicios utilizan interfaces tipadas:

```typescript
// ✅ Bueno - Totalmente tipado
const trips$: Observable<ApiPaginatedResponse<Trip>> = 
  this.tripService.getMyTrips(0, 10);

// ❌ Malo - Evitar ANY
const trips$: Observable<any> = this.tripService.getMyTrips(0, 10);
```

## Uso en Componentes

### Inyectar servicio
```typescript
export class MyTripsComponent {
  private tripService = inject(TripService);
  
  trips$ = this.tripService.getMyTrips(0, 10);
}
```

### En template
```html
<article *ngFor="let trip of trips$ | async as trips">
  <h2>{{ trip.name }}</h2>
  <p>{{ trip.description }}</p>
</article>
```

## Requisitos Completados ✅

- [x] Models con tipado estricto (sin ANY)
- [x] ApiService centralizado
- [x] Interceptores funcionales (auth + error + loading)
- [x] TripService con CRUD y participantes
- [x] ExpenseService con liquidaciones y resumen
- [x] AuthService refactorizado para HTTP real
- [x] Configuración de entorno
- [x] app.config.ts actualizado con HttpClient
- [x] Manejo de errores centralizado
- [x] Tipado Observable genérico
- [x] Separación de responsabilidades (DTO vs Entity)

## Siguientes Pasos (FASE 6)

- Integración con componentes existentes
- Testing de servicios HTTP
- Implementación de LoadingService
- Implementación de ToastService
- Pruebas e2e con backend real
