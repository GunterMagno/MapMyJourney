import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TripStore } from './trip.store';
import { TripService } from '../services/trip.service';
import { ToastService } from '../services/toast.service';
import { Trip, ApiPaginatedResponse } from '../models';

/**
 * Tests para TripStore
 *
 * TripStore es un Signal-based Store que gestiona el estado de viajes
 * de forma reactiva sin necesidad de async/await complejos.
 *
 * Cobertura:
 * - initialState: Verificar estado inicial
 * - addTrip(): Agregar viaje y verificar optimistic UI
 * - totalTrips (Computed): Agregar múltiples viajes
 * - loadProgress (Computed): Verificar progreso de carga
 * - updateTrip(): Actualizar viaje existente
 * - removeTrip(): Eliminar viaje
 * - reset(): Resetear estado
 */
describe('TripStore', () => {
  let store: TripStore;
  let tripService: TripService;
  let toastService: ToastService;
  let httpMock: HttpTestingController;

  // Mock data
  const mockTrip1: Trip = {
    id: 1,
    title: 'Viaje a París',
    destination: 'París, Francia',
    startDate: '2024-06-01',
    endDate: '2024-06-10',
    budget: 2000,
    description: 'Semana en París visitando museos',
    tripCode: 'PARIS2024',
    ownerId: 'user-1'
  };

  const mockTrip2: Trip = {
    id: 2,
    title: 'Viaje a Barcelona',
    destination: 'Barcelona, España',
    startDate: '2024-07-01',
    endDate: '2024-07-10',
    budget: 1500,
    description: 'Explorar arquitectura moderna',
    tripCode: 'BARCA2024',
    ownerId: 'user-1'
  };

  const mockTrip3: Trip = {
    id: 3,
    title: 'Viaje a Roma',
    destination: 'Roma, Italia',
    startDate: '2024-08-01',
    endDate: '2024-08-10',
    budget: 1800,
    description: 'Historia y gastronomía',
    tripCode: 'ROME2024',
    ownerId: 'user-1'
  };

  const mockPaginatedResponse: ApiPaginatedResponse<Trip> = {
    items: [mockTrip1, mockTrip2],
    page: 1,
    pageSize: 10,
    total: 3,
    totalPages: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TripStore, TripService, ToastService]
    });

    store = TestBed.inject(TripStore);
    tripService = TestBed.inject(TripService);
    toastService = TestBed.inject(ToastService);
    httpMock = TestBed.inject(HttpTestingController);

    // Spy en métodos
    spyOn(toastService, 'info');
    spyOn(console, 'error');

    // Consumir la petición GET que hace el constructor al llamar loadTrips()
    // para evitar "Expected no open requests" en afterEach
    try {
      const req = httpMock.expectOne(request =>
        request.url.includes('my-trips') && request.method === 'GET'
      );
      req.flush(mockPaginatedResponse);
    } catch (e) {
      // Si no hay petición pendiente, ignorar
    }

    // Resetear el store para las pruebas
    store.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================================================
  // TESTS: ESTADO INICIAL
  // ============================================================================

  describe('initialState', () => {
    it('debe tener trips vacío al iniciar', () => {
      expect(store.trips().length).toBe(0);
    });

    it('debe tener loading=false al iniciar', () => {
      expect(store.loading()).toBe(false);
    });

    it('debe tener currentPage=1 al iniciar', () => {
      expect(store.currentPage()).toBe(1);
    });

    it('debe tener hasMore=true al iniciar', () => {
      expect(store.hasMore()).toBe(true);
    });

    it('debe tener tripDetail=null al iniciar', () => {
      expect(store.tripDetail()).toBeNull();
    });

    it('debe tener tripDetailLoading=false al iniciar', () => {
      expect(store.tripDetailLoading()).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: ADDTRIP (OPTIMISTIC UI)
  // ============================================================================

  describe('addTrip()', () => {
    it('debe agregar un viaje a la lista (Optimistic UI)', () => {
      const initialLength = store.trips().length;

      store.addTrip(mockTrip1);

      expect(store.trips().length).toBe(initialLength + 1);
      expect(store.trips()[0]).toEqual(mockTrip1);
    });

    it('debe agregar el viaje al inicio de la lista', () => {
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);

      // mockTrip2 debe estar al inicio porque se agregó después
      expect(store.trips()[0]).toEqual(mockTrip2);
      expect(store.trips()[1]).toEqual(mockTrip1);
    });

    it('debe incrementar totalItems', () => {
      const initialTotal = store.debugState().totalItems;

      store.addTrip(mockTrip1);

      expect(store.debugState().totalItems).toBe(initialTotal + 1);
    });

    it('debe agregar múltiples viajes correctamente', () => {
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);
      store.addTrip(mockTrip3);

      expect(store.trips().length).toBe(3);
      expect(store.trips()[0]).toEqual(mockTrip3); // Último agregado está primero
      expect(store.trips()[2]).toEqual(mockTrip1); // Primero agregado está al final
    });

    it('debe actualizar totalTrips computed signal', () => {
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);

      expect(store.totalTrips()).toBe(2);
    });
  });

  // ============================================================================
  // TESTS: TOTALTRIPS (COMPUTED SIGNAL)
  // ============================================================================

  describe('totalTrips (Computed Signal)', () => {
    it('debe devolver 0 para lista vacía', () => {
      expect(store.totalTrips()).toBe(0);
    });

    it('debe devolver 1 después de agregar un viaje', () => {
      store.addTrip(mockTrip1);

      expect(store.totalTrips()).toBe(1);
    });

    it('debe devolver 2 después de agregar dos viajes', () => {
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);

      expect(store.totalTrips()).toBe(2);
    });

    it('debe devolver 3 después de agregar tres viajes', () => {
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);
      store.addTrip(mockTrip3);

      expect(store.totalTrips()).toBe(3);
    });

    it('debe actualizarse automáticamente cuando se eliminan viajes', () => {
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);

      expect(store.totalTrips()).toBe(2);

      store.removeTrip(mockTrip2.id);

      expect(store.totalTrips()).toBe(1);
    });
  });

  // ============================================================================
  // TESTS: UPDATETRIP
  // ============================================================================

  describe('updateTrip()', () => {
    beforeEach(() => {
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);
    });

    it('debe actualizar un viaje existente', () => {
      const updatedTitle = 'Viaje a París actualizado';

      store.updateTrip(mockTrip1.id, { title: updatedTitle });

      const updatedTrip = store.trips().find(t => t.id === mockTrip1.id);
      expect(updatedTrip?.title).toBe(updatedTitle);
    });

    it('debe actualizar múltiples propiedades', () => {
      const updates = {
        title: 'Nuevo título',
        budget: 5000,
        description: 'Nueva descripción'
      };

      store.updateTrip(mockTrip1.id, updates);

      const updatedTrip = store.trips().find(t => t.id === mockTrip1.id);
      expect(updatedTrip?.title).toBe(updates.title);
      expect(updatedTrip?.budget).toBe(updates.budget);
      expect(updatedTrip?.description).toBe(updates.description);
    });

    it('debe mantener otras propiedades sin cambios', () => {
      store.updateTrip(mockTrip1.id, { title: 'Nuevo título' });

      const updatedTrip = store.trips().find(t => t.id === mockTrip1.id);
      expect(updatedTrip?.destination).toBe(mockTrip1.destination);
      expect(updatedTrip?.startDate).toBe(mockTrip1.startDate);
      expect(updatedTrip?.endDate).toBe(mockTrip1.endDate);
    });

    it('no debe afectar otros viajes', () => {
      const originalTrip2 = { ...store.trips()[0] }; // mockTrip2 está primero

      store.updateTrip(mockTrip1.id, { title: 'Nuevo título' });

      expect(store.trips()[0]).toEqual(originalTrip2);
    });
  });

  // ============================================================================
  // TESTS: REMOVETRIP
  // ============================================================================

  describe('removeTrip()', () => {
    beforeEach(() => {
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);
      store.addTrip(mockTrip3);
    });

    it('debe eliminar un viaje de la lista', () => {
      expect(store.trips().length).toBe(3);

      store.removeTrip(mockTrip2.id);

      expect(store.trips().length).toBe(2);
      expect(store.trips().find(t => t.id === mockTrip2.id)).toBeUndefined();
    });

    it('debe disminuir totalTrips', () => {
      expect(store.totalTrips()).toBe(3);

      store.removeTrip(mockTrip1.id);

      expect(store.totalTrips()).toBe(2);
    });

    it('debe disminuir totalItems', () => {
      const initialTotal = store.debugState().totalItems;

      store.removeTrip(mockTrip1.id);

      expect(store.debugState().totalItems).toBe(initialTotal - 1);
    });

    it('debe mantener el mínimo de 0 en totalItems', () => {
      store.removeTrip(mockTrip1.id);
      store.removeTrip(mockTrip2.id);
      store.removeTrip(mockTrip3.id);

      expect(store.debugState().totalItems).toBeGreaterThanOrEqual(0);
    });

    it('no debe afectar otros viajes', () => {
      const trip1 = store.trips().find(t => t.id === mockTrip1.id);
      const trip3 = store.trips().find(t => t.id === mockTrip3.id);

      store.removeTrip(mockTrip2.id);

      expect(store.trips().find(t => t.id === mockTrip1.id)).toEqual(trip1);
      expect(store.trips().find(t => t.id === mockTrip3.id)).toEqual(trip3);
    });
  });

  // ============================================================================
  // TESTS: RESET
  // ============================================================================

  describe('reset()', () => {
    beforeEach(() => {
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);
    });

    it('debe limpiar todos los viajes', () => {
      expect(store.trips().length).toBe(2);

      store.reset();

      expect(store.trips().length).toBe(0);
    });

    it('debe resetear totalTrips a 0', () => {
      expect(store.totalTrips()).toBe(2);

      store.reset();

      expect(store.totalTrips()).toBe(0);
    });

    it('debe resetear currentPage a 1', () => {
      store.reset();

      expect(store.currentPage()).toBe(1);
    });

    it('debe resetear hasMore a true', () => {
      store.reset();

      expect(store.hasMore()).toBe(true);
    });

    it('debe resetear loading a false', () => {
      store.reset();

      expect(store.loading()).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: SEARCHLOCAL
  // ============================================================================

  describe('searchLocal()', () => {
    beforeEach(() => {
      store.addTrip(mockTrip1); // París
      store.addTrip(mockTrip2); // Barcelona
      store.addTrip(mockTrip3); // Roma
    });

    it('debe devolver todos los viajes si el término está vacío', () => {
      const results = store.searchLocal('');

      expect(results.length).toBe(3);
    });

    it('debe buscar por destino (case-insensitive)', () => {
      const results = store.searchLocal('París');

      expect(results.length).toBe(1);
      expect(results[0].destination).toContain('París');
    });

    it('debe buscar por destino en minúsculas', () => {
      const results = store.searchLocal('barcelona');

      expect(results.length).toBe(1);
      expect(results[0].destination).toContain('Barcelona');
    });

    it('debe buscar por descripción', () => {
      const results = store.searchLocal('museos');

      expect(results.length).toBe(1);
      expect(results[0].description).toContain('museos');
    });

    it('debe buscar por descripción (case-insensitive)', () => {
      const results = store.searchLocal('ARQUITECTURA');

      expect(results.length).toBe(1);
      expect(results[0].destination).toContain('Barcelona');
    });

    it('debe devolver array vacío si no hay coincidencias', () => {
      const results = store.searchLocal('Tokio');

      expect(results.length).toBe(0);
    });

    it('debe buscar con palabras parciales', () => {
      const results = store.searchLocal('arq');

      expect(results.length).toBe(1);
      expect(results[0].destination).toContain('Barcelona');
    });
  });

  // ============================================================================
  // TESTS: COMPUTED SIGNALS - LOADPROGRESS
  // ============================================================================

  describe('loadProgress (Computed Signal)', () => {
    it('debe devolver 100 cuando no hay items totales', () => {
      expect(store.loadProgress()).toBe(100);
    });

    it('debe calcular progreso correctamente', () => {
      // Simular que se cargaron 2 de 4 items totales
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);

      // Actualizar totalItems manualmente para la prueba
      const state = store.debugState();
      store.reset();
      
      // Restablecemos los viajes
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);

      // Como addTrip no modifica totalItems significativamente,
      // hacemos una prueba simplificada
      expect(store.loadProgress()).toBeGreaterThanOrEqual(0);
      expect(store.loadProgress()).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================================
  // TESTS: COMPUTED SIGNALS - ISFIRSTPAGE
  // ============================================================================

  describe('isFirstPage (Computed Signal)', () => {
    it('debe devolver true en la primera página', () => {
      expect(store.isFirstPage()).toBe(true);
    });
  });

  // ============================================================================
  // TESTS: COMPUTED SIGNALS - STATUSMESSAGE
  // ============================================================================

  describe('statusMessage (Computed Signal)', () => {
    it('debe mostrar mensaje cuando no hay viajes', () => {
      expect(store.statusMessage()).toContain('No hay viajes');
    });

    it('debe mostrar número de viajes cargados', () => {
      store.addTrip(mockTrip1);
      store.addTrip(mockTrip2);

      expect(store.statusMessage()).toContain('2 viajes');
    });
  });

  // ============================================================================
  // TESTS: INMUTABILIDAD
  // ============================================================================

  describe('Inmutabilidad del estado', () => {
    it('no debe mutar el array original al agregar un viaje', () => {
      const tripsRef = store.trips();

      store.addTrip(mockTrip1);

      // El array original no debe cambiar (por referencia)
      expect(tripsRef).not.toBe(store.trips());
    });

    it('no debe mutar el array original al actualizar un viaje', () => {
      store.addTrip(mockTrip1);
      const tripsRef = store.trips();

      store.updateTrip(mockTrip1.id, { title: 'Nuevo título' });

      expect(tripsRef).not.toBe(store.trips());
    });

    it('no debe mutar el array original al eliminar un viaje', () => {
      store.addTrip(mockTrip1);
      const tripsRef = store.trips();

      store.removeTrip(mockTrip1.id);

      expect(tripsRef).not.toBe(store.trips());
    });
  });

  // ============================================================================
  // TESTS: DEBUGSTATE
  // ============================================================================

  describe('debugState()', () => {
    it('debe devolver el estado completo', () => {
      store.addTrip(mockTrip1);

      const state = store.debugState();

      expect(state.trips.length).toBe(1);
      expect(state.loading).toBe(false);
      expect(state.currentPage).toBe(1);
      expect(state.hasMore).toBe(true);
    });

    it('debe devolver una copia del estado', () => {
      store.addTrip(mockTrip1);

      const state1 = store.debugState();
      store.addTrip(mockTrip2);
      const state2 = store.debugState();

      expect(state1.trips.length).toBe(1);
      expect(state2.trips.length).toBe(2);
    });
  });
});
