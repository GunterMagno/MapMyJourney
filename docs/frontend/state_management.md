# Gestión de Estado en MapMyJourney - FASE 6

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Patrón Elegido: Signals](#patrón-elegido-signals)
3. [Comparativa de Opciones](#comparativa-de-opciones)
4. [Arquitectura Implementada](#arquitectura-implementada)
5. [Flujo de Actualización](#flujo-de-actualización)
6. [Stores del Dominio](#stores-del-dominio)
7. [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
8. [Infinite Scroll](#infinite-scroll)
9. [Búsqueda en Tiempo Real](#búsqueda-en-tiempo-real)
10. [Casos de Uso Prácticos](#casos-de-uso-prácticos)

---

## Introducción

La Fase 6 de MapMyJourney introduce un sistema de gestión de estado **100% reactivo** que permite que la interfaz reaccione en tiempo real a los cambios sin necesidad de recargar la página.

### Objetivos Logrados

✅ Actualización dinámica sin recargas (Optimistic UI)  
✅ Cálculos automáticos (ej: presupuesto total)  
✅ Infinite Scroll con carga progresiva  
✅ Búsqueda con debounce (no saturar API)  
✅ Rendimiento optimizado (OnPush, TrackBy)  
✅ Código limpio y escalable (Signals)

---

## Patrón Elegido: Signals

### ¿Por Qué Signals?

**Signals de Angular 17+** es el patrón elegido para gestión de estado porque:

| Aspecto | Signals | BehaviorSubject | NgRx |
|--------|---------|-----------------|------|
| **Integración Angular** | Nativa 🌟 | Requiere RxJS | Muy acoplado |
| **Boilerplate** | Mínimo | Medio | Alto |
| **Curva de aprendizaje** | Baja | Baja | Alta |
| **Performance** | Excelente (fine-grained) | Bueno | Bueno |
| **Escalabilidad** | Hasta 50k+ items | Hasta 10k items | Ilimitada |
| **Testing** | Simple | Simple | Complejo |
| **Unsubscribe** | Automático | Manual requerido | Manual requerido |
| **Proyecto Tamaño** | Pequeño/Medio ⭐ | Pequeño | Grande |

### Ventaja Clave: Computed Signals

```typescript
// ✅ Sin Signals (BehaviorSubject)
totalExpenses$ = this.expenses$.pipe(
  map(list => list.reduce((sum, e) => sum + e.amount, 0)),
  shareReplay(1) // Necesario para memoización
);

// ✅ Con Signals (automático)
totalExpenses = computed(() => 
  this.expenses().reduce((sum, e) => sum + e.amount, 0)
);
// Se recalcula solo si expenses cambió
// Memoización automática
```

---

## Comparativa de Opciones

### 1. Servicios con BehaviorSubject

```typescript
@Injectable({ providedIn: 'root' })
export class TripStore {
  private _trips = new BehaviorSubject<Trip[]>([]);
  trips$ = this._trips.asObservable();

  addTrip(trip: Trip) {
    const current = this._trips.value;
    this._trips.next([...current, trip]); // Manual
  }
}

// Uso en componente
trips$ = this.tripStore.trips$;

// Template
@for (trip of trips$ | async)
```

**Ventajas:**  
- ✅ Patrón conocido desde hace años  
- ✅ Compatible con cualquier versión de Angular  

**Inconvenientes:**  
- ❌ Requiere async pipe (menos rendimiento)  
- ❌ Riesgo de memory leaks (olvididar unsubscribe)  
- ❌ Más boilerplate  
- ❌ Requiere RxJS operators  

### 2. Signals de Angular (ELEGIDO) 🌟

```typescript
@Injectable({ providedIn: 'root' })
export class TripStore {
  private _trips = signal<Trip[]>([]);
  trips = this._trips.asReadonly();

  addTrip(trip: Trip) {
    this._trips.update(list => [...list, trip]); // Limpio
  }
}

// Uso en componente
trips = this.tripStore.trips;

// Template
@for (trip of trips(); track trip.id)
```

**Ventajas:**  
- ✅ Sintaxis limpia y moderna  
- ✅ Sin async pipe (mejor rendimiento)  
- ✅ Automático: no requiere unsubscribe  
- ✅ Computed signals (reactividad automática)  
- ✅ Excelente performance  
- ✅ TypeScript puro  

**Inconvenientes:**  
- ❌ Requiere Angular 17+  
- ❌ Comunidad más pequeña (pero creciendo)

### 3. NgRx (No elegido)

```typescript
@Injectable()
export class TripEffects {
  loadTrips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TripActions.loadTrips),
      switchMap(() =>
        this.tripService.getTrips()
          .pipe(
            map(trips => TripActions.loadTripsSuccess({ trips }))
          )
      )
    )
  );
}
```

**Ventajas:**  
- ✅ Escalable para equipos grandes  
- ✅ Time-travel debugging  
- ✅ Patrón Redux probado  

**Inconvenientes:**  
- ❌ Overkill para equipos pequeños  
- ❌ Mucho boilerplate  
- ❌ Curva de aprendizaje alta  
- ❌ Más dependencias  

---

## Arquitectura Implementada

### Estructura de Carpetas

```
src/app/
├── core/
│   ├── store/                      ← ✅ NUEVO
│   │   ├── trip.store.ts          (Gestión de viajes)
│   │   ├── expense.store.ts       (Gestión de gastos)
│   │   ├── search.store.ts        (Búsqueda reactiva)
│   │   └── index.ts               (Barril)
│   ├── services/
│   │   ├── trip.service.ts
│   │   ├── expense.service.ts
│   │   └── api.service.ts
│   ├── models/
│   │   ├── trip.model.ts
│   │   ├── expense.model.ts
│   │   └── api-response.model.ts
│   ├── guards/
│   └── interceptors/
└── components/
    ├── pages/
    │   ├── trips-page/           ← ✅ Refactorizado
    │   └── trip-detail/          ← ✅ Refactorizado
    └── ...
```

### Patrón de Cada Store

Todos los stores siguen el mismo patrón:

```typescript
@Injectable({ providedIn: 'root' })
export class MyStore {
  // 1. ESTADO PRIVADO
  private _state = signal<State>(initialState);

  // 2. SEÑALES PÚBLICAS (READONLY)
  data = this._state.asReadonly().select(s => s.data);
  loading = this._state.asReadonly().select(s => s.loading);
  error = this._state.asReadonly().select(s => s.error);

  // 3. COMPUTED SIGNALS (DERIVADAS)
  totalItems = computed(() => this.data().length);
  isEmpty = computed(() => this.totalItems() === 0);

  // 4. MÉTODOS PÚBLICOS (CRUD + Lógica)
  add(item) { this._state.update(s => ({ ...s, data: [...s.data, item] })); }
  remove(id) { this._state.update(s => ({ ...s, data: s.data.filter(i => i.id !== id) })); }
}
```

---

## Flujo de Actualización

### Caso: Eliminar un Viaje

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO CLICKS "ELIMINAR"                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  COMPONENTE: deleteTrip(id)    │
        │  - Pide confirmación al usuario│
        │  - Guarda trip para rollback   │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  ✅ OPTIMISTIC UI               │
        │  tripStore.removeTrip(id)      │
        │  - Actualiza estado al instante│
        │  - UI se actualiza sin lag     │
        │  - Usuario ve cambio al instante
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  COMPONENTE: Llama API         │
        │  tripService.deleteTrip(id)    │
        │  - Petición HTTP DELETE        │
        └────────────┬───────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    ✅ API SUCCESS         ❌ API FALLA
    │                      │
    └─ Toast success       └─ rollback: addTrip(trip)
                           └─ Toast error
                           └─ Estado original restaurado

RESULTADO: El usuario SIEMPRE siente que la app es rápida
          incluso si la API tarda (rollback transparente)
```

---

## Stores del Dominio

### 1. TripStore

**Responsabilidad:** Gestionar lista de viajes del usuario

```typescript
// Señales públicas
trips()                  // Lista de viajes
loading()                // ¿Está cargando?
error()                  // Mensaje de error
currentPage()            // Página actual
hasMore()                // ¿Hay más datos?

// Computed signals
totalTrips()             // Cantidad de viajes (computed)
loadProgress()           // % de carga completado (computed)
statusMessage()          // Mensaje de estado (computed)

// Métodos
loadTrips()              // Cargar primera página
loadMore()               // Cargar siguiente página (infinite scroll)
addTrip(trip)            // Agregar viaje (optimistic UI)
updateTrip(id, changes)  // Actualizar propiedades
removeTrip(id)           // Eliminar viaje
searchLocal(term)        // Filtrado local por término
reset()                  // Resetear estado
```

**Características:**
- Paginación: 10 viajes por página
- Infinite scroll: carga automática al bajar
- Immutabilidad: todos los updates preservan estado anterior

### 2. ExpenseStore

**Responsabilidad:** Gestionar gastos del viaje actual

```typescript
// Señales públicas
expenses()               // Lista de gastos
loading()                // ¿Está cargando?
error()                  // Mensaje de error
currentTripId()          // ID del viaje actual
hasMore()                // ¿Hay más gastos?

// ✅ COMPUTED SIGNALS (MAGIA)
totalBudgetUsed()        // Suma total (se actualiza automático)
averageExpense()         // Promedio por persona
expensesByCategory()     // Desglose por categoría
expensesByPayer()        // Desglose por quién pagó
maxExpense()             // Gasto mayor
minExpense()             // Gasto menor

// Métodos
loadExpensesByTrip(id)   // Cargar gastos del viaje
loadMore()               // Infinite scroll
addExpense(exp)          // Agregar (optimistic UI)
updateExpense(id, changes) // Actualizar
removeExpense(id)        // Eliminar
filterByCategory(cat)    // Filtrar localmente
filterByPayer(id)        // Filtrar por pagador
filterByDateRange(from, to) // Filtrar por rango de fechas
```

**✅ Computed Signals = La Magia de Fase 6**

Cuando un usuario agrega un gasto:

```typescript
// Componente
expenseStore.addExpense(newExpense);
// El store hace: this._expenses.update(list => [...list, newExpense])

// AUTOMÁTICAMENTE se recalculan:
totalBudgetUsed()        // Suma nueva
averageExpense()         // Promedio nuevo
expensesByCategory()     // Desglose actualizado
// SIN que el componente haga nada

// El template reacciona automáticamente:
// <span>Total: {{ totalBudgetUsed() }}</span>
// Muestra el valor nuevo sin recargar
```

### 3. SearchStore

**Responsabilidad:** Búsqueda reactiva con debounce

```typescript
// Señales públicas
results()                // Resultados de búsqueda
searchTerm()             // Término actual
loading()                // ¿Está buscando?
error()                  // Error durante búsqueda
searchControl            // FormControl para el input

// Métodos
search(term)             // Buscar (con debounce automático)
clear()                  // Limpiar búsqueda
reset()                  // Resetear estado

// Características
- Debounce: 300ms (no envia petición hasta que el user deje de tipear)
- DistinctUntilChanged: no busca el mismo término dos veces
- SwitchMap: cancela búsqueda anterior si el user tipea algo nuevo
```

---

## Optimizaciones de Rendimiento

### 1. OnPush ChangeDetectionStrategy

```typescript
@Component({
  selector: 'app-trips-page',
  changeDetection: ChangeDetectionStrategy.OnPush // ✅ Activado
})
export class TripsPageComponent {
  trips = this.tripStore.trips; // ✅ Signals

  // Angular SOLO revisa cuando:
  // - La señal trips cambia
  // - Un evento (click, input) se dispara
  // - Un Observable emite (si usamos async pipe)
}
```

**Beneficio:** Reducción de 80%+ en revisiones de cambio innecesarias

### 2. TrackBy en Listas

```typescript
// ✅ Correcto (Signals)
@for (trip of trips(); track trackById(trip)) {
  <app-card [trip]="trip"></app-card>
}

// ✅ Si usaramos *ngFor
<app-card *ngFor="let trip of trips; trackBy: trackById" [trip]="trip"></app-card>

trackById(trip: Trip): string {
  return trip.id; // Angular rastreará por ID, no por índice
}

// Beneficio:
// Si trips = [A, B, C] y eliminamos B -> [A, C]
// Sin trackBy: React actualiza A (cambió posición), C (cambió posición)
// Con trackBy: Solo elimina el DOM de B, A y C se quedan igual
```

**Beneficio:** Reducción de re-renders y parpadeos

### 3. Computed Signals (Memoización)

```typescript
totalExpenses = computed(() => {
  return this.expenses().reduce((sum, e) => sum + e.amount, 0);
  // Se recalcula SOLO si expenses() cambió
  // No si otros datos del store cambian
});

// Sin computed (manual con BehaviorSubject):
totalExpenses$ = this.expenses$.pipe(
  map(list => list.reduce(...)),
  shareReplay(1) // ← Necesario para evitar recálculos
);
// Más boilerplate, menos control

// Con Computed:
// ✅ Automático
// ✅ Memoizado
// ✅ Reactive fino (fine-grained)
```

**Beneficio:** Cero cálculos innecesarios

### 4. No Usar Async Pipe

```typescript
// ❌ Con BehaviorSubject (patrón antiguo)
<span>{{ totalExpenses$ | async | currency }}</span>
// Crea subscripción, desuscripción, revisa cada vez

// ✅ Con Signals (patrón moderno)
<span>{{ totalExpenses() | currency }}</span>
// Acceso directo, sin observables, sin revisiones extra
```

---

## Infinite Scroll

### Implementación con IntersectionObserver

```typescript
// En componente
@ViewChild('scrollAnchor', { static: false }) scrollAnchor!: ElementRef;
private observer?: IntersectionObserver;

ngAfterViewInit() {
  this.observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Cuando el sentinel entra en viewport
        if (entry.isIntersecting) {
          // Si no está cargando y hay más datos
          if (!this.loading() && this.hasMore()) {
            this.tripStore.loadMore();
          }
        }
      });
    },
    {
      root: null,        // Viewport
      rootMargin: '100px', // Cargar antes de llegar al final
      threshold: 0.1     // 10% visible
    }
  );

  this.observer.observe(this.scrollAnchor.nativeElement);
}

ngOnDestroy() {
  this.observer?.disconnect();
}
```

### Template

```html
<!-- Lista de viajes -->
<section class="trips-list">
  @for (trip of trips(); track trackById(trip)) {
    <app-card [trip]="trip"></app-card>
  }
</section>

<!-- ✅ SENTINEL: Se observa con IntersectionObserver -->
<span #scrollAnchor role="status" aria-label="Cargando más..."></span>

<!-- Loading indicator -->
@if (loading()) {
  <progress value="50" max="100"></progress>
  <p>Cargando más viajes...</p>
}

<!-- End of data -->
@if (!hasMore() && trips().length > 0) {
  <output>Has alcanzado el final</output>
}
```

**Flujo:**
1. Usuario hace scroll hacia abajo
2. El sentinel entra en viewport
3. IntersectionObserver dispara callback
4. `tripStore.loadMore()` se ejecuta
5. API devuelve siguiente página
6. `trips().update(list => [...list, ...newTrips])`
7. Template se actualiza (preserva DOM anterior)
8. No hay parpadeo, es suave

---

## Búsqueda en Tiempo Real

### Patrón: Debounce + DistinctUntilChanged

```typescript
// SearchStore configura el pipeline
this.searchControl.valueChanges
  .pipe(
    debounceTime(300),          // Esperar 300ms sin cambios
    distinctUntilChanged(),      // Solo si cambió el valor
    switchMap(term => {
      if (!term.trim()) return of([]);
      // Llamar API con el término
      return this.tripService.getMyTrips(1, 100).pipe(
        switchMap(response => {
          // Filtrar resultados
          const filtered = response.items.filter(trip =>
            trip.destination.toLowerCase().includes(term.toLowerCase())
          );
          return of(filtered);
        })
      );
    }),
    catchError(err => {
      // Manejar error
      return of([]);
    })
  )
  .subscribe(results => {
    this._results.set(results); // Actualizar señal
  });
```

### Template

```html
<!-- Input de búsqueda -->
<input 
  [formControl]="searchStore.searchControl"
  placeholder="Buscar viajes..."
  (input)="searchStore.search($event.target.value)">

<!-- Indicador de carga -->
@if (searchStore.loading()) {
  <progress value="50" max="100"></progress>
}

<!-- Resultados -->
@if (searchStore.results().length > 0) {
  <ul class="search-results">
    @for (trip of searchStore.results(); track trip.id) {
      <li>{{ trip.destination }}</li>
    }
  </ul>
} @else if (searchStore.searchTerm() && !searchStore.loading()) {
  <output>Sin resultados para "{{ searchStore.searchTerm() }}"</output>
}

<!-- Error -->
@if (searchStore.error()) {
  <div role="alert">{{ searchStore.error() }}</div>
}
```

**Beneficios:**
- ✅ No saturar API (debounce)
- ✅ No enviar búsquedas duplicadas (distinctUntilChanged)
- ✅ Resultados instantáneos (searchStore.results())
- ✅ Error handling automático

---

## Casos de Uso Prácticos

### Caso 1: Agregar Viaje (Optimistic UI)

```typescript
// Componente
agregarViaje(form: TripData) {
  const newTrip: Trip = {
    id: generateId(),
    ...form,
    totalExpenses: 0,
    createdAt: new Date()
  };

  // ✅ 1. Actualizar UI al instante
  this.tripStore.addTrip(newTrip);
  this.toastService.success('Viaje creado');

  // 2. Enviar a API en paralelo
  this.tripService.createTrip(form).subscribe({
    next: (createdTrip) => {
      // ✅ Actualizar con datos del servidor (ID real, etc)
      this.tripStore.updateTrip(newTrip.id, {
        ...createdTrip
      });
    },
    error: (err) => {
      // ❌ Rollback: eliminar si falló
      this.tripStore.removeTrip(newTrip.id);
      this.toastService.error('Error al crear viaje');
    }
  });
}
```

### Caso 2: Presupuesto Se Actualiza Solo

```typescript
// Componente carga gastos del viaje
ngOnInit() {
  this.expenseStore.loadExpensesByTrip(tripId);
}

// Template
Total Gastado: {{ expenseStore.totalBudgetUsed() }}

// Usuario agrega gasto:
agregarGasto() {
  this.expenseStore.addExpense(newExpense);
  // ✅ totalBudgetUsed() se actualiza AUTOMÁTICAMENTE
  // No requiere:
  // - Recalcular manualmente
  // - Emitir evento
  // - Cambiar detección
  // SOLO: la señal changed -> template reacted
}
```

### Caso 3: Búsqueda Fluida

```typescript
// Componente
searchStore = inject(SearchStore);

// Template
<input [formControl]="searchStore.searchControl">

<ul>
  @for (result of searchStore.results(); track result.id) {
    <li>{{ result.destination }}</li>
  }
</ul>

// Usuario tipea: "París"
// 1. Tipea 'P' → debounce espera
// 2. Tipea 'á' → debounce espera
// 3. Tipea 'r' → debounce espera
// 4. PAUSA 300ms → API llamada
// 5. Resultados → template actualizado sin lag
```

---

## Resumen de Beneficios

| Métrica | Antes (Sin Fase 6) | Después (Fase 6) |
|---------|------|------|
| **Tiempo p/agregar viaje** | Esperar API (~2s) | Inmediato (~10ms) |
| **Clicks p/actualizar UI** | 1 click + F5 | 1 click, automático |
| **Memory Leaks Risk** | Alto (BehaviorSubject) | Bajo (Signals) |
| **Boilerplate** | Mucho (RxJS) | Mínimo (Signals) |
| **Performance** | Medio | Excelente |
| **Complejidad** | Media/Alta | Baja |

---

## Conclusión

**Signals es la arquitectura moderna de Angular** para pequeños-medianos proyectos como MapMyJourney. Proporciona:

✅ Reactividad automática (computed signals)  
✅ Rendimiento superior (fine-grained reactivity)  
✅ Código más legible y mantenible  
✅ Menos boilerplate que RxJS  
✅ Integración nativa con Angular 17+  

El proyecto está ahora listo para **actualizaciones dinámicas sin fricción**, donde cualquier cambio se propaga automáticamente a través del árbol de componentes.
