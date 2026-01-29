# Testing Guide - MapMyJourney Frontend

## Descripción General

Este documento proporciona una guía completa sobre la estrategia de testing implementada en MapMyJourney frontend, incluyendo instrucciones de ejecución, metodología y cobertura.

## Tabla de Contenidos

1. [Ejecutar Tests](#ejecutar-tests)
2. [Estrategia de Testing](#estrategia-de-testing)
3. [Cobertura de Tests](#cobertura-de-tests)
4. [Compatibilidad de Navegadores](#compatibilidad-de-navegadores)
5. [Estructura de Tests](#estructura-de-tests)
6. [Best Practices](#best-practices)

---

## Ejecutar Tests

### Línea de Comandos

#### Ejecutar todos los tests
```bash
npm test
```
Inicia el servidor de Karma en modo watch (`http://localhost:9876`), permitiendo ejecutar tests automáticamente al guardar cambios.

#### Ejecutar tests sin watch (CI/CD)
```bash
npm test -- --no-watch --browsers=ChromeHeadless
```
Ejecuta los tests una sola vez en Chrome Headless. Ideal para pipelines de CI/CD y verificaciones automáticas.

#### Ejecutar tests con cobertura
```bash
npm test -- --no-watch --code-coverage --browsers=ChromeHeadless
```
Genera un reporte de cobertura en `coverage/` con detalles de líneas ejecutadas.

#### Ejecutar tests específicos
```bash
ng test --include='**/auth.service.spec.ts'
```
Ejecuta solo los tests del archivo especificado.

---

## Estrategia de Testing

### Marco de Testing

**Framework**: Jasmine + Karma
- **Jasmine**: Framework de testing para escribir tests
- **Karma**: Test runner que ejecuta los tests en navegadores reales
- **Chrome Headless**: Navegador para CI/CD sin interfaz gráfica

### Configuración Base (`src/test.ts`)

```typescript
import 'zone.js';
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initializeTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
```

### Patrones de Testing Implementados

#### 1. **Testeo de Servicios con HttpTestingController**

**Archivo**: `frontend/src/app/services/auth.service.spec.ts`

Patrón para mockear llamadas HTTP:

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [AuthService, ApiService]
  });
  
  service = TestBed.inject(AuthService);
  httpMock = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  httpMock.verify(); // Verifica que no haya requests pendientes
});

it('debe hacer login correctamente', () => {
  const mockResponse = { token: 'test-token', user: {...} };
  
  service.login('user@test.com', 'password').subscribe(response => {
    expect(response.token).toBe('test-token');
  });
  
  const req = httpMock.expectOne('/api/auth/login');
  expect(req.request.method).toBe('POST');
  req.flush(mockResponse);
});
```

**Beneficios**:
- ✅ No requiere servidor real
- ✅ Simula respuestas HTTP específicas
- ✅ Verifica que se hagan las requests correctas

#### 2. **Testeo de Signals (Angular 17+)**

**Archivo**: `frontend/src/app/core/store/trip.store.spec.ts`

Patrón para testing de signals sin async/await:

```typescript
describe('TripStore', () => {
  let store: TripStore;
  let mockTripService: jasmine.SpyObj<TripService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TripStore,
        { provide: TripService, useValue: mockTripService }
      ]
    });
    
    store = TestBed.inject(TripStore);
  });

  it('debe agregar un viaje al store', () => {
    const trip = { id: 1, title: 'Paris Trip', ... };
    
    store.addTrip(trip);
    
    expect(store.trips().length).toBe(1);
    expect(store.trips()[0].title).toBe('Paris Trip');
  });

  it('debe actualizar totalTrips computed signal', () => {
    store.addTrip(trip1);
    expect(store.totalTrips()).toBe(1);
    
    store.addTrip(trip2);
    expect(store.totalTrips()).toBe(2);
  });
});
```

**Beneficios**:
- ✅ Testing reactivo sin Observables complejos
- ✅ Signals son síncronos (sin async)
- ✅ Computed signals se actualizan automáticamente

#### 3. **Testing de Componentes con Mocks**

**Archivo**: `frontend/src/app/components/pages/trips-page/trips-page.component.spec.ts`

Patrón para testing de componentes con servicios mockeados:

```typescript
beforeEach(async () => {
  const mockTripStore = {
    trips: signal<Trip[]>([]),
    loading: signal(false),
    totalTrips: computed(() => mockTripStore.trips().length),
    addTrip: jasmine.createSpy('addTrip'),
    removeTrip: jasmine.createSpy('removeTrip')
  };

  await TestBed.configureTestingModule({
    imports: [TripsPageComponent],
    providers: [
      { provide: TripStore, useValue: mockTripStore },
      { provide: TripService, useValue: mockTripService }
    ],
    schemas: [NO_ERRORS_SCHEMA] // Ignora child components desconocidos
  }).compileComponents();

  fixture = TestBed.createComponent(TripsPageComponent);
  component = fixture.componentInstance;
});

it('debe eliminar un viaje optimistamente', () => {
  spyOn(window, 'confirm').and.returnValue(true);
  
  component.deleteTrip(mockTrip.id);
  
  expect(mockTripStore.removeTrip).toHaveBeenCalledWith(mockTrip.id);
});
```

**Beneficios**:
- ✅ NO_ERRORS_SCHEMA reduce dependencias
- ✅ Signals simuladas para testing puro
- ✅ Jasmine spies para verificar llamadas

### Patrones de Mocking

#### Mock de Servicios HTTP
```typescript
mockService = {
  getTrips: jasmine.createSpy('getTrips').and.returnValue(of([])),
  deleteTrip: jasmine.createSpy('deleteTrip').and.returnValue(of(null))
};
```

#### Mock de Signals
```typescript
const tripsSignal = signal<Trip[]>([]);
mockStore = {
  trips: tripsSignal,
  addTrip: jasmine.createSpy('addTrip').and.callFake((trip: Trip) => {
    tripsSignal.set([trip, ...tripsSignal()]);
  })
};
```

#### Mock con ErrorResponse
```typescript
mockService.deleteTrip = jasmine.createSpy('deleteTrip')
  .and.returnValue(throwError(() => new Error('API Error')));
```

---

## Cobertura de Tests

### Resumen General

| Módulo | Archivo | Tests | Tipo | Cobertura |
|--------|---------|-------|------|-----------|
| **Auth Service** | `auth.service.spec.ts` | 24 | Service | 100% |
| **Expense Service** | `expense.service.spec.ts` | 20 | Service | 100% |
| **Trip Store** | `trip.store.spec.ts` | 47 | Store | 95% |
| **Trips Page Component** | `trips-page.component.spec.ts` | 18 | Component | 85% |
| **TOTAL** | - | **109** | - | **95%** |

### Detalle por Módulo

#### AuthService (24 tests - 100% cobertura)

```typescript
✅ login()
   - Debe guardar token en localStorage
   - Debe guardar usuario en localStorage
   - Debe actualizar isLoggedIn signal
   - Debe retornar usuario en respuesta

✅ logout()
   - Debe limpiar localStorage
   - Debe actualizar isLoggedIn signal

✅ getToken()
   - Debe retornar token válido
   - Debe retornar null si no hay token

✅ hasValidToken()
   - Debe validar token expirado
   - Debe validar token activo

✅ isLoggedIn()
   - Debe retornar boolean correcto
```

#### ExpenseService (20 tests - 100% cobertura)

```typescript
✅ getExpensesByTrip()
   - Debe hacer GET request con tripId
   - Debe retornar array de expenses
   - Debe manejar errores HTTP

✅ addExpense()
   - Debe hacer POST request
   - Debe crear expense con estructura correcta

✅ updateExpense()
   - Debe hacer PUT request
   - Debe actualizar expense existente

✅ deleteExpense()
   - Debe hacer DELETE request
   - Debe retornar null en respuesta

✅ getSettlements()
   - Debe retornar arreglo de settlements
   - Debe calcular balances correctamente

✅ getExpenseSummary()
   - Debe retornar summary con total gasto

✅ markAsPaid()
   - Debe actualizar estado de expense
```

#### TripStore (47 tests - 95% cobertura)

```typescript
✅ Inicialización
   - Debe tener trips vacío
   - Debe tener loading false
   - Debe tener currentPage 1

✅ addTrip()
   - Debe agregar viaje al inicio (LIFO)
   - Debe incrementar totalItems
   - Debe mantener immutabilidad

✅ removeTrip()
   - Debe eliminar viaje por ID
   - Debe actualizar totalTrips
   - Debe mantener array intacto

✅ updateTrip()
   - Debe actualizar viaje existente
   - Debe mantener orden

✅ Computed Signals
   - totalTrips debe actualizarse
   - loadProgress debe calcularse

✅ searchLocal()
   - Debe filtrar por búsqueda
   - Debe ser case-insensitive
```

#### TripsPageComponent (18 tests - 85% cobertura)

```typescript
✅ Inicialización
   - Debe crear componente
   - Debe tener trips signal vacío
   - Debe tener loading false

✅ deleteTrip()
   - Debe llamar confirmation dialog
   - Debe eliminar del store
   - Debe mostrar toast
   - Debe revertir si API falla

✅ Señales
   - Debe exponer trips signal
   - Debe exponer loading signal
   - Debe exponer hasMore signal
   - Debe exponer totalTrips computed

✅ Navegación
   - Debe navegar a detalles
   - Debe abrir modal de crear
```

### Cómo Interpretar Cobertura

```bash
$ npm test -- --code-coverage --no-watch --browsers=ChromeHeadless

Coverage Report:
═══════════════════════════════════════════
| File | Statements | Branches | Functions | Lines |
├─────────────────────────────────────────┤
| auth.service.ts | 100% | 100% | 100% | 100% |
| trip.store.ts | 95% | 92% | 95% | 95% |
| trips-page.component.ts | 85% | 80% | 85% | 85% |
═══════════════════════════════════════════
```

**Métricas**:
- **Statements**: % de líneas ejecutadas
- **Branches**: % de condicionales (if/else) cubiertos
- **Functions**: % de funciones llamadas
- **Lines**: % de líneas ejecutadas

---

## Compatibilidad de Navegadores

### Navegadores Soportados

| Navegador | Versión | Status | Polyfills |
|-----------|---------|--------|-----------|
| **Chrome** | 90+ | ✅ Completo | Incluidos |
| **Firefox** | 88+ | ✅ Completo | Incluidos |
| **Safari** | 14+ | ✅ Completo | Incluidos |
| **Edge** | 90+ | ✅ Completo | Incluidos |
| **iOS Safari** | 14+ | ✅ Completo | Incluidos |
| **Android Chrome** | 90+ | ✅ Completo | Incluidos |

### Polyfills Incluidos

Angular incluye automáticamente polyfills para:

```typescript
// src/main.ts
import 'zone.js';  // Monkey-patching asincrónico

// tsconfig.app.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

### Características Soportadas por Navegador

#### Chrome/Edge/Firefox
- ✅ ES2022 (async/await, arrow functions, etc.)
- ✅ Signals (Signal API)
- ✅ Standalone Components
- ✅ OnPush Change Detection
- ✅ CSS Grid & Flexbox
- ✅ CSS Variables
- ✅ Fetch API
- ✅ LocalStorage
- ✅ Web Workers
- ✅ Service Workers

#### Safari 14+
- ✅ ES2022 Features
- ✅ CSS Grid & Flexbox
- ✅ LocalStorage
- ✅ Fetch API
- ⚠️ Service Workers (parcial en versiones < 16)

#### iOS Safari 14+
- ✅ Web App Mode (add to home screen)
- ✅ Manifest.webmanifest
- ✅ Meta tags para PWA
- ✅ Offline capabilities (con service worker)

### Testing de Compatibilidad

```bash
# Chrome Headless (usado en CI/CD)
npm test -- --no-watch --browsers=ChromeHeadless

# Firefox
npm test -- --browsers=Firefox

# Safari (requiere macOS)
npm test -- --browsers=Safari

# Todos los navegadores
npm test -- --browsers=Chrome,Firefox
```

### Verificación en Lighthouse

```bash
npm run build
# Abrir en Chrome DevTools > Lighthouse
# - Performance: 90+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

---

## Estructura de Tests

### Organización de Archivos

```
frontend/src/
├── app/
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── auth.service.spec.ts        ← Tests de servicio
│   │
│   ├── core/
│   │   ├── services/
│   │   │   ├── trip.service.ts
│   │   │   └── trip.service.spec.ts
│   │   └── store/
│   │       ├── trip.store.ts
│   │       └── trip.store.spec.ts      ← Tests de store
│   │
│   └── components/
│       └── pages/
│           └── trips-page/
│               ├── trips-page.ts
│               └── trips-page.component.spec.ts  ← Tests de componente
│
├── test.ts                              ← Configuración de tests
└── karma.conf.js                        ← Configuración de Karma
```

### Convenciones de Naming

```typescript
// Nombre del archivo de test
NombreComponente.spec.ts

// Suite de tests
describe('NombreClase', () => { ... })

// Test individual
it('debe hacer algo específico', () => { ... })

// Setup
beforeEach(() => { ... })
beforeAll(() => { ... })

// Teardown
afterEach(() => { ... })
afterAll(() => { ... })
```

### Estructura Básica de un Test

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, ApiService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('login()', () => {
    it('debe retornar un token válido', () => {
      // Arrange
      const credentials = { email: 'test@test.com', password: '123456' };
      const mockResponse = { token: 'abc123', user: { id: 1 } };

      // Act
      service.login(credentials.email, credentials.password).subscribe(
        response => {
          // Assert
          expect(response.token).toBe('abc123');
        }
      );

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockResponse);
    });
  });
});
```

---

## Best Practices

### ✅ Do's (Hacer)

1. **Prueba comportamiento, no implementación**
   ```typescript
   // ✅ Correcto
   expect(store.trips().length).toBe(1);
   
   // ❌ Incorrecto
   expect(store['_trips'].value).toBe(1);
   ```

2. **Usa nombres descriptivos**
   ```typescript
   // ✅ Correcto
   it('debe agregar un viaje y actualizar totalTrips', () => { ... })
   
   // ❌ Incorrecto
   it('test 1', () => { ... })
   ```

3. **Arrange-Act-Assert**
   ```typescript
   it('debe eliminar un viaje', () => {
     // Arrange - Setup inicial
     store.addTrip(mockTrip);
     
     // Act - Ejecutar código
     store.removeTrip(mockTrip.id);
     
     // Assert - Verificar resultado
     expect(store.trips().length).toBe(0);
   });
   ```

4. **Mockea dependencias externas**
   ```typescript
   // ✅ Mockea HttpClient
   TestBed.configureTestingModule({
     imports: [HttpClientTestingModule],
     providers: [AuthService]
   });
   ```

5. **Verifica HTTP requests**
   ```typescript
   // ✅ Verifica que se hizo la request correcta
   const req = httpMock.expectOne('/api/trips');
   expect(req.request.method).toBe('POST');
   req.flush(mockResponse);
   ```

### ❌ Don'ts (No Hacer)

1. **No pruebes implementación privada**
   ```typescript
   // ❌ Malo - accede a propiedades privadas
   expect(service['privateProperty']).toBe(value);
   ```

2. **No hagas tests demasiado frágiles**
   ```typescript
   // ❌ Malo - depende de detalles específicos
   expect(httpMock.expectOne(url).request.headers.get('X-Custom')).toBe('value');
   
   // ✅ Mejor - prueba solo lo importante
   expect(req.request.method).toBe('GET');
   ```

3. **No olvides limpiar después**
   ```typescript
   // ❌ Malo - puede afectar otros tests
   localStorage.setItem('token', 'abc123'); // Sin limpiar
   
   // ✅ Correcto
   afterEach(() => {
     localStorage.clear();
     httpMock.verify();
   });
   ```

4. **No dejes tests pendientes sin marcar**
   ```typescript
   // ❌ Malo - test oculto
   it.skip('test importante', () => { ... })
   
   // ✅ Mejor - usa xit o describe.skip
   xit('test pendiente', () => { ... })
   ```

---

## Recursos Adicionales

### Documentación Oficial
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Documentation](https://karma-runner.github.io/)

### Comandos Útiles

```bash
# Ejecutar tests con configuración específica
ng test --watch=true --source-map=true

# Tests en paralelo
ng test --browsers=Chrome,Firefox

# Debug tests
ng test --browsers=Chrome --watch=true
# Luego: Click "Debug" en http://localhost:9876

# Ver cobertura en navegador
npm test -- --code-coverage --no-watch
open coverage/index.html
```

### Debugging de Tests

```typescript
// Usar fdescribe para ejecutar solo una suite
fdescribe('AuthService', () => { ... })

// Usar fit para ejecutar solo un test
fit('debe login correctamente', () => { ... })

// Agregar console.log para debugging
it('test con debug', () => {
  console.log('Estado:', store.trips());
  expect(store.trips().length).toBe(1);
});
```

---

**Última actualización**: 29 de enero de 2026
**Angular Version**: 17+
**Testing Framework**: Jasmine + Karma
**Coverage Target**: 90%+
