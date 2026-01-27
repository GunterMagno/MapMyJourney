# BLOQUE A: Perfeccionamiento de Fase 6 (Estado y Realtime)

## Implementar Polling Service (Realtime)

### Archivo Creado
- **`frontend/src/app/core/services/polling.service.ts`**

### Características Principales

#### 1. **Servicio PollingService - Actualización en Tiempo Real**
```typescript
PollingService {
  poll(intervalMs: number, callback: () => void): void
  stop(): void
  isActive(): boolean
  reset(): void
}
```

**Especificaciones:**
- ✅ Usa `timer` de RxJS para intervalos periódicos
- ✅ Implementa `switchMap` para cancelación automática de peticiones anteriores
- ✅ Respeta `document.visibilityState` - pausa polling cuando la pestaña no está visible
- ✅ Gestión automática de ciclo de vida con `takeUntil`
- ✅ Manejo de errores con logging

**Ventajas:**
- Economiza recursos: no continúa actualizando cuando la pestaña está en background
- Cancelación automática: si el usuario navega, las peticiones pendientes se cancelan
- No requiere unsubscribe manual: los observables se completan correctamente

#### 2. **Integración en TripDetailComponent**

**Cambios:**
1. Inyectado `PollingService` en el componente
2. En `ngOnInit()`: Inicia polling cada 30 segundos
3. En `ngOnDestroy()`: Detiene polling al destruir el componente

**Código:**
```typescript
ngOnInit(): void {
  if (tripData) {
    this.tripId = tripData.id;
    this.expenseStore.loadExpensesByTrip(this.tripId);
    
    // ✅ REALTIME: Polling cada 30 segundos
    this.pollingService.poll(30000, () => {
      this.expenseStore.loadExpensesByTrip(this.tripId);
    });
  }
  // ... fallback también incluye polling
}

ngOnDestroy(): void {
  // ... otros limpios ...
  
  // ✅ Detener polling
  if (this.pollingService.isActive()) {
    this.pollingService.stop();
  }
}
```

**Comportamiento:**
- Los gastos se actualizan automáticamente cada 30 segundos
- Si otro usuario añade un gasto, aparecerá en pantalla sin recargar
- El polling se pausa si cambias de pestaña (ahorro de recursos)
- Se detiene completamente al salir del componente

---

## ✅ Tarea A.2: Refinar Búsqueda (SearchStore)

### Archivo Modificado
- **`frontend/src/app/core/store/search.store.ts`**

### Mejoras Implementadas

#### 1. **Cancelación Robusta de Peticiones (switchMap)**

**Problema Original:**
- Si el usuario escribía rápidamente, podían colapsarse peticiones
- No había cancelación explícita de búsquedas anteriores

**Solución:**
```typescript
switchMap(term => {
  // Actualizar searchTerm para emptyResults
  this._searchTerm.set(term || '');
  
  if (!term || term.trim().length === 0) {
    // Cancelar búsqueda anterior automáticamente
    return of([] as Trip[]);
  }

  this._setLoading(true);
  
  // switchMap cancela esta petición si el usuario tipea algo nuevo
  return this.tripService.getMyTrips(1, 100).pipe(
    switchMap(response => {
      // Filtrado local
      const filtered = response.items.filter(trip => /* ... */);
      return of(filtered);
    }),
    catchError(err => {
      // Manejo explícito de errores
      return of([] as Trip[]);
    })
  );
})
```

**Beneficios:**
- ✅ Race condition libre: solo la última búsqueda se procesa
- ✅ Cancela peticiones HTTP pendientes automáticamente
- ✅ Mejor manejo de errores con logging

#### 2. **Computed Signal: emptyResults**

**Nuevo Signal (Tarea A.2):**
```typescript
emptyResults = computed(() => {
  const term = this._searchTerm();
  const isLoading = this._loading();
  const results = this._results();

  // True solo si hay búsqueda, no está cargando y sin resultados
  return term.trim().length > 0 && !isLoading && results.length === 0;
});
```

**Lógica:**
- `true` = hay un término de búsqueda + no está cargando + array vacío
- `false` = en cualquier otro caso (cargando, hay resultados, búsqueda vacía)

**Uso en Template:**
```html
<!-- Sin resultados -->
@if (searchStore.emptyResults()) {
  <p class="search-empty">
    <span class="icon">🔍</span>
    No se encontraron viajes para "{{ searchStore.searchTerm() }}"
  </p>
}

<!-- Resultados -->
@if (!searchStore.emptyResults() && searchStore.results().length > 0) {
  <ul class="search-results">
    @for (trip of searchStore.results(); track trip.id) {
      <li>{{ trip.destination }}</li>
    }
  </ul>
}

<!-- Cargando -->
@if (searchStore.loading()) {
  <p class="search-loading">Buscando viajes...</p>
}

<!-- Error -->
@if (searchStore.error()) {
  <p class="search-error">{{ searchStore.error() }}</p>
}
```

**Ventajas:**
- UI amigable: mensaje claro cuando no hay resultados
- No requiere lógica en el componente
- Se actualiza automáticamente sin intervención manual
- Signal reactivo = sin necesidad de `async` pipe

---

## 📊 Resumen de Cambios

### Archivos Creados (1)
- ✅ `frontend/src/app/core/services/polling.service.ts` (120 líneas)

### Archivos Modificados (3)

| Archivo | Cambios |
|---------|---------|
| `trip-detail.component.ts` | + Inyección PollingService, + Polling en ngOnInit, + Stop en ngOnDestroy |
| `search.store.ts` | + Import `computed`, + emptyResults signal, Mejora switchMap, + Manejo errores |
| `services/index.ts` | + Exportaciones: date-format.service, polling.service |

### Líneas de Código
- Nuevas: ~150 líneas (PollingService + mejoras)
- Modificadas: ~30 líneas (integraciones)
- **Total: ~180 líneas**

---

## 🎯 Funcionalidades Logradas (Rúbrica Fase 6)

### 1. **Realtime (Opcional pero asegura el 10/10)**
- ✅ Polling cada 30 segundos
- ✅ Respeta visibilidad de pestaña
- ✅ Cancelación automática de peticiones
- ✅ Gestión correcta de ciclo de vida

### 2. **Búsqueda Optimizada**
- ✅ Cancelación robusta con switchMap
- ✅ Manejo correcto de peticiones previas
- ✅ Feedback visual de "sin resultados"
- ✅ Gestión de límite de 100 viajes simulada

---

## 📝 Notas Técnicas

### PollingService
- **Patrón**: Service + RxJS Observables
- **Ciclo de vida**: Controlado por `takeUntil` + `Subject`
- **Estado**: Almacenado en propiedades privadas
- **Visibilidad**: Respeta `document.visibilityState` para UX/rendimiento

### SearchStore Mejorado
- **Patrón**: Store + Signals + RxJS Pipelines
- **Cancelación**: `switchMap` automático
- **Feedback**: `emptyResults` computed signal
- **Errores**: CatchError + logging
- **Validación**: Trim y length check para búsquedas vacías

---

## 🚀 Próximos Pasos (Opcional)

### Para Escalar Búsqueda
Si en el futuro hay más de 100 viajes:

```typescript
// En TripService
searchTrips(term: string, page: number = 1, pageSize: number = 20): 
  Observable<ApiPaginatedResponse<Trip>> {
  return this.api.get(
    `${this.endpoint}/search`,
    { q: term, page, pageSize }
  );
}

// En SearchStore
// Cambiar: return this.tripService.getMyTrips(1, 100).pipe(...)
// Por:     return this.tripService.searchTrips(term).pipe(...)
```

### Para WebSocket (Realtime Real)
Si se implementa WebSocket en el futuro:
```typescript
// Reemplazar polling por:
this.pollingService.subscribe('expenses:updated', (expense) => {
  this.expenseStore.updateExpense(expense);
});
```

---

## ✨ Testing Recomendado

### TripDetailComponent
```typescript
// Test: Polling inicia en ngOnInit
// Test: Polling se detiene en ngOnDestroy
// Test: Expenses se recargan cada 30s
// Test: Pestaña hidden pausa polling
```

### SearchStore
```typescript
// Test: emptyResults true cuando sin resultados
// Test: emptyResults false cuando hay resultados
// Test: switchMap cancela búsqueda anterior
// Test: Trim y validation funcionan
```

---

**Status**: ✅ Implementación Completada - Sin Errores de Compilación
**Fecha**: 27 Enero 2026
