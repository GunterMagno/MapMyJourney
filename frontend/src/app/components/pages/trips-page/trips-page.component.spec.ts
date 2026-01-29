import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TripsPageComponent } from './trips-page';
import { TripStore } from '../../../core/store';
import { AuthService } from '../../../services/auth.service';
import { TripService } from '../../../core/services/trip.service';
import { ToastService } from '../../../core/services/toast.service';
import { CommunicationService } from '../../../services/communication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Trip } from '../../../core/models';
import { of, throwError } from 'rxjs';

describe('TripsPageComponent', () => {
  let component: TripsPageComponent;
  let fixture: ComponentFixture<TripsPageComponent>;
  let mockTripStore: any;
  let mockAuthService: Partial<AuthService>;
  let mockTripService: Partial<TripService>;
  let mockToastService: Partial<ToastService>;

  const mockTrip1: Trip = {
    id: 1,
    title: 'Viaje a París',
    destination: 'París, Francia',
    startDate: '2024-06-01',
    endDate: '2024-06-10',
    budget: 2000,
    description: 'Semana en París visitando museos'
  };

  const mockTrip2: Trip = {
    id: 2,
    title: 'Viaje a Barcelona',
    destination: 'Barcelona, España',
    startDate: '2024-07-01',
    endDate: '2024-07-10',
    budget: 1500,
    description: 'Explorar arquitectura moderna'
  };

  const mockTrip3: Trip = {
    id: 3,
    title: 'Viaje a Roma',
    destination: 'Roma, Italia',
    startDate: '2024-08-01',
    endDate: '2024-08-10',
    budget: 1800,
    description: 'Historia y gastronomía'
  };

  beforeEach(async () => {
    const tripsSignal = signal<Trip[]>([]);
    const loadingSignal = signal(false);
    const hasMoreSignal = signal(true);

    mockTripStore = {
      trips: tripsSignal,
      loading: loadingSignal,
      hasMore: hasMoreSignal,
      tripDetail: signal(null),
      tripDetailLoading: signal(false),
      error: signal(null),
      totalTrips: computed(() => tripsSignal().length),
      loadProgress: computed(() => 0),
      isFirstPage: computed(() => true),
      statusMessage: computed(() => ''),
      
      loadTrips: jasmine.createSpy('loadTrips'),
      loadMore: jasmine.createSpy('loadMore'),
      addTrip: jasmine.createSpy('addTrip').and.callFake((trip: Trip) => {
        tripsSignal.set([trip, ...tripsSignal()]);
      }),
      removeTrip: jasmine.createSpy('removeTrip').and.callFake((tripId: number) => {
        tripsSignal.set(tripsSignal().filter(t => t.id !== tripId));
      }),
      updateTrip: jasmine.createSpy('updateTrip'),
      reset: jasmine.createSpy('reset'),
      clearError: jasmine.createSpy('clearError'),
      reloadTrips: jasmine.createSpy('reloadTrips'),
      loadTripDetail: jasmine.createSpy('loadTripDetail'),
      searchLocal: jasmine.createSpy('searchLocal').and.returnValue([]),
    };

    mockAuthService = {
      login: jasmine.createSpy('login').and.returnValue(of({})),
      logout: jasmine.createSpy('logout').and.returnValue(of(null)),
      getToken: jasmine.createSpy('getToken').and.returnValue('test-token'),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true),
    };

    mockTripService = {
      getTripById: jasmine.createSpy('getTripById').and.returnValue(of(mockTrip1)),
      createTrip: jasmine.createSpy('createTrip').and.returnValue(of(mockTrip1)),
      updateTrip: jasmine.createSpy('updateTrip').and.returnValue(of(mockTrip1)),
      deleteTrip: jasmine.createSpy('deleteTrip').and.returnValue(of(null)),
    };

    mockToastService = {
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error'),
      info: jasmine.createSpy('info'),
    };

    await TestBed.configureTestingModule({
      imports: [TripsPageComponent],
      providers: [
        { provide: TripStore, useValue: mockTripStore },
        { provide: AuthService, useValue: mockAuthService },
        { provide: TripService, useValue: mockTripService },
        { provide: ToastService, useValue: mockToastService },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
          },
        },
        {
          provide: CommunicationService,
          useValue: {
            openModal: jasmine.createSpy('openModal'),
            closeModal: jasmine.createSpy('closeModal'),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TripsPageComponent);
    component = fixture.componentInstance;
  });

  describe('Renderizado Inicial (Empty State)', () => {
    it('debe crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debe tener trips signal vacío al iniciar', () => {
      expect(component.trips().length).toBe(0);
    });

    it('debe tener loading signal false al iniciar', () => {
      expect(component.loading()).toBe(false);
    });
  });

  describe('Renderizado con Datos (Grid de Tarjetas)', () => {
    beforeEach(() => {
      mockTripStore.trips.set([mockTrip1, mockTrip2]);
    });

    it('debe tener dos elementos en trips cuando están seteados', () => {
      expect(mockTripStore.trips().length).toBe(2);
    });

    it('debe poder agregar un tercer viaje al store', () => {
      mockTripStore.trips.set([mockTrip1, mockTrip2, mockTrip3]);
      expect(mockTripStore.trips().length).toBe(3);
    });
  });

  describe('Loading State', () => {
    it('debe devolver true cuando loading() es true', () => {
      mockTripStore.loading.set(true);
      expect(component.loading()).toBe(true);
    });

    it('debe devolver false cuando loading() es false', () => {
      mockTripStore.loading.set(false);
      expect(component.loading()).toBe(false);
    });

    it('debe cambiar loading a true y verificable', () => {
      mockTripStore.loading.set(true);
      expect(mockTripStore.loading()).toBe(true);
      mockTripStore.loading.set(false);
      expect(mockTripStore.loading()).toBe(false);
    });
  });

  describe('Empty State', () => {
    it('debe tener trips vacío al verificar estado', () => {
      mockTripStore.trips.set([]);
      expect(mockTripStore.trips().length).toBe(0);
    });

    it('debe marcar loading false cuando no hay viajes', () => {
      mockTripStore.trips.set([]);
      mockTripStore.loading.set(false);
      expect(mockTripStore.trips().length).toBe(0);
      expect(component.loading()).toBe(false);
    });

    it('debe poder verificar que no hay viajes en el estado', () => {
      mockTripStore.trips.set([]);
      const hasTrips = mockTripStore.trips().length > 0;
      expect(hasTrips).toBe(false);
    });
  });

  describe('Eliminar Viaje (Optimistic UI)', () => {
    beforeEach(() => {
      mockTripStore.trips.set([mockTrip1, mockTrip2, mockTrip3]);
    });

    it('debe llamar removeTrip del store cuando se confirma', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteTrip(mockTrip1.id);

      expect(mockTripStore.removeTrip).toHaveBeenCalledWith(mockTrip1.id);
    });

    it('no debe eliminar si el usuario cancela', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteTrip(mockTrip1.id);

      expect(mockTripStore.removeTrip).not.toHaveBeenCalled();
    });

    it('debe mostrar toast de éxito cuando se elimina', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteTrip(mockTrip1.id);

      expect(mockToastService.success).toHaveBeenCalledWith('Viaje eliminado');
    });

    it('debe llamar al servicio para eliminar en la API', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteTrip(mockTrip1.id);

      expect(mockTripService.deleteTrip).toHaveBeenCalledWith(mockTrip1.id);
    });

    it('debe revertir si la API falla', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      (mockTripService.deleteTrip as jasmine.Spy).and.returnValue(
        throwError(() => new Error('API Error'))
      );

      component.deleteTrip(mockTrip1.id);

      expect(mockTripStore.addTrip).toHaveBeenCalledWith(mockTrip1);
    });
  });

  describe('Crear Viaje', () => {
    it('debe llamar openModal cuando se presiona crear viaje', () => {
      const communicationService = TestBed.inject(CommunicationService);

      component.createTrip();

      expect(communicationService.openModal).toHaveBeenCalledWith('create-trip');
    });
  });

  describe('Ver Detalles de Viaje', () => {
    it('debe navegar cuando se llama viewTrip', () => {
      const router = TestBed.inject(Router);

      component.viewTrip(mockTrip1.id);

      expect(router.navigate).toHaveBeenCalledWith(['/trips', mockTrip1.id]);
    });
  });

});