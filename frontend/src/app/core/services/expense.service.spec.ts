import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExpenseService } from './expense.service';
import { ApiService } from './api.service';
import {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseWithDetails,
  ApiPaginatedResponse
} from '../models';

/**
 * Tests para ExpenseService
 *
 * Cobertura:
 * - getExpensesByTrip(): obtener gastos paginados de un viaje
 * - addExpense(): crear nuevo gasto
 * - updateExpense(): actualizar gasto existente
 * - deleteExpense(): eliminar gasto
 * - getExpenseSummary(): obtener resumen de gastos
 * - getSettlements(): obtener liquidaciones entre participantes
 * - markAsPaid(): marcar gasto como pagado
 */
describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpMock: HttpTestingController;
  let apiService: ApiService;

  const mockTrip = 'trip-123';
  const mockUserId = 'user-456';

  const mockExpense: Expense = {
    id: 'expense-789',
    tripId: mockTrip,
    description: 'Hotel',
    amount: 100,
    payerId: mockUserId,
    category: 'ACCOMMODATION',
    date: new Date().toISOString(),
    participants: [mockUserId, 'user-789'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockExpenseWithDetails: ExpenseWithDetails = {
    ...mockExpense,
    payer: {
      id: mockUserId,
      name: 'Test User',
      email: 'test@example.com'
    },
    participantDetails: [
      { id: mockUserId, name: 'Test User', email: 'test@example.com', shareAmount: 50 },
      { id: 'user-789', name: 'Other User', email: 'other@example.com', shareAmount: 50 }
    ]
  };

  const mockExpenseResponse: ApiPaginatedResponse<ExpenseWithDetails> = {
    items: [mockExpenseWithDetails],
    page: 1,
    pageSize: 20,
    total: 1,
    totalPages: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExpenseService, ApiService]
    });

    service = TestBed.inject(ExpenseService);
    httpMock = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(ApiService);

    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================================================
  // TESTS: OBTENER GASTOS
  // ============================================================================

  describe('getExpensesByTrip()', () => {
    it('debe solicitar gastos con paginación por defecto', () => {
      service.getExpensesByTrip(mockTrip).subscribe();

      const req = httpMock.expectOne(request =>
        request.url.includes(`trips/${mockTrip}/expenses`) &&
        request.method === 'GET'
      );

      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('20');

      req.flush(mockExpenseResponse);
    });

    it('debe aceptar parámetros de paginación personalizados', () => {
      service.getExpensesByTrip(mockTrip, 2, 50).subscribe();

      const req = httpMock.expectOne(request =>
        request.url.includes(`trips/${mockTrip}/expenses`)
      );

      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('50');

      req.flush(mockExpenseResponse);
    });

    it('debe devolver gastos con detalles de participantes', (done) => {
      service.getExpensesByTrip(mockTrip).subscribe(response => {
        expect(response.items.length).toBe(1);
        expect(response.items[0].participants).toBeDefined();
        expect(response.items[0].participants.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(request =>
        request.url.includes(`trips/${mockTrip}/expenses`)
      );

      req.flush(mockExpenseResponse);
    });

    it('debe manejar response paginada correctamente', (done) => {
      service.getExpensesByTrip(mockTrip).subscribe(response => {
        expect(response.page).toBe(1);
        expect(response.pageSize).toBe(20);
        expect(response.total).toBe(1);
        expect(response.totalPages).toBe(1);
        done();
      });

      const req = httpMock.expectOne(request =>
        request.url.includes(`trips/${mockTrip}/expenses`)
      );

      req.flush(mockExpenseResponse);
    });

    it('debe manejar error al obtener gastos', (done) => {
      service.getExpensesByTrip(mockTrip).subscribe(
        () => {
          fail('debería haber fallado');
        },
        (error) => {
          expect(error).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(request =>
        request.url.includes(`trips/${mockTrip}/expenses`)
      );

      req.flush(
        { message: 'Trip not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  // ============================================================================
  // TESTS: CREAR GASTO
  // ============================================================================

  describe('addExpense()', () => {
    it('debe enviar datos correctos al crear gasto', () => {
      const createDto: CreateExpenseDto = {
        tripId: mockTrip,
        description: 'Hotel',
        amount: 100,
        payerId: mockUserId,
        category: 'ACCOMMODATION',
        date: new Date().toISOString(),
        participants: [mockUserId, 'user-789']
      };

      service.addExpense(createDto).subscribe();

      const req = httpMock.expectOne(request =>
        request.url.includes('expenses') && request.method === 'POST'
      );

      expect(req.request.body).toEqual(createDto);

      req.flush(mockExpense);
    });

    it('debe devolver el gasto creado', (done) => {
      const createDto: CreateExpenseDto = {
        tripId: mockTrip,
        description: 'Hotel',
        amount: 100,
        payerId: mockUserId,
        category: 'ACCOMMODATION',
        date: new Date().toISOString(),
        participants: [mockUserId, 'user-789']
      };

      service.addExpense(createDto).subscribe(expense => {
        expect(expense.id).toBe('expense-789');
        expect(expense.description).toBe('Hotel');
        expect(expense.amount).toBe(100);
        done();
      });

      const req = httpMock.expectOne(request =>
        request.url.includes('expenses') && request.method === 'POST'
      );

      req.flush(mockExpense);
    });

    it('debe manejar error al crear gasto', (done) => {
      const createDto: CreateExpenseDto = {
        tripId: mockTrip,
        description: 'Hotel',
        amount: -100, // Inválido
        payerId: mockUserId,
        category: 'ACCOMMODATION',
        date: new Date().toISOString(),
        participants: [mockUserId]
      };

      service.addExpense(createDto).subscribe(
        () => {
          fail('debería haber fallado');
        },
        (error) => {
          expect(error).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(request =>
        request.url.includes('expenses')
      );

      req.flush(
        { message: 'Invalid amount' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  // ============================================================================
  // TESTS: ACTUALIZAR GASTO
  // ============================================================================

  describe('updateExpense()', () => {
    it('debe enviar datos correctos al actualizar gasto', () => {
      const updates: Partial<UpdateExpenseDto> = {
        description: 'Hotel actualizaado',
        amount: 120
      };

      service.updateExpense(mockExpense.id, updates).subscribe();

      const req = httpMock.expectOne(request =>
        request.url.includes(`expenses/${mockExpense.id}`) &&
        request.method === 'PUT'
      );

      expect(req.request.body).toEqual(updates);

      req.flush({ ...mockExpense, ...updates });
    });

    it('debe devolver el gasto actualizado', (done) => {
      const updates: Partial<UpdateExpenseDto> = {
        description: 'Hotel actualizado',
        amount: 120
      };

      service.updateExpense(mockExpense.id, updates).subscribe(expense => {
        expect(expense.description).toBe('Hotel actualizado');
        expect(expense.amount).toBe(120);
        done();
      });

      const req = httpMock.expectOne(request =>
        request.url.includes(`expenses/${mockExpense.id}`)
      );

      req.flush({ ...mockExpense, ...updates });
    });

    it('debe manejar error cuando gasto no existe', (done) => {
      service.updateExpense('non-existent', {}).subscribe(
        () => {
          fail('debería haber fallado');
        },
        (error) => {
          expect(error).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(request =>
        request.url.includes('expenses/non-existent')
      );

      req.flush(
        { message: 'Expense not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  // ============================================================================
  // TESTS: ELIMINAR GASTO
  // ============================================================================

  describe('deleteExpense()', () => {
    it('debe enviar request DELETE con ID correcto', () => {
      service.deleteExpense(mockExpense.id).subscribe();

      const req = httpMock.expectOne(request =>
        request.url.includes(`expenses/${mockExpense.id}`) &&
        request.method === 'DELETE'
      );

      req.flush(null);
    });

    it('debe completar la observación sin valor', (done) => {
      service.deleteExpense(mockExpense.id).subscribe(
        (result) => {
          expect(result).toBeNull();
          done();
        }
      );

      const req = httpMock.expectOne(request =>
        request.url.includes(`expenses/${mockExpense.id}`)
      );

      req.flush(null);
    });

    it('debe manejar error cuando gasto no existe', (done) => {
      service.deleteExpense('non-existent').subscribe(
        () => {
          fail('debería haber fallado');
        },
        (error) => {
          expect(error).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(request =>
        request.url.includes('expenses/non-existent')
      );

      req.flush(
        { message: 'Expense not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  // ============================================================================
  // TESTS: RESUMEN DE GASTOS
  // ============================================================================

  describe('getExpenseSummary()', () => {
    it('debe obtener resumen de gastos por persona', () => {
      const summary = {
        [mockUserId]: 150,
        'user-789': 200
      };

      service.getExpenseSummary(mockTrip).subscribe(result => {
        expect(result[mockUserId]).toBe(150);
        expect(result['user-789']).toBe(200);
      });

      const req = httpMock.expectOne(request =>
        request.url.includes(`expenses/summary/${mockTrip}`) &&
        request.method === 'GET'
      );

      req.flush(summary);
    });

    it('debe devolver object vacío si no hay gastos', (done) => {
      service.getExpenseSummary(mockTrip).subscribe(result => {
        expect(Object.keys(result).length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(request =>
        request.url.includes(`expenses/summary/${mockTrip}`)
      );

      req.flush({});
    });
  });

  // ============================================================================
  // TESTS: LIQUIDACIONES
  // ============================================================================

  describe('getSettlements()', () => {
    it('debe obtener liquidaciones del viaje', (done) => {
      const settlements = [
        { from: 'user-789', to: mockUserId, amount: 50 }
      ];

      service.getSettlements(mockTrip).subscribe(result => {
        expect(result.length).toBe(1);
        expect(result[0].from).toBe('user-789');
        expect(result[0].to).toBe(mockUserId);
        expect(result[0].amount).toBe(50);
        done();
      });

      const req = httpMock.expectOne(request =>
        request.url.includes(`expenses/settlements/${mockTrip}`) &&
        request.method === 'GET'
      );

      req.flush(settlements);
    });

    it('debe devolver array vacío si no hay deudas', (done) => {
      service.getSettlements(mockTrip).subscribe(result => {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(request =>
        request.url.includes(`expenses/settlements/${mockTrip}`)
      );

      req.flush([]);
    });
  });

  // ============================================================================
  // TESTS: MARCAR COMO PAGADO
  // ============================================================================

  describe('markAsPaid()', () => {
    it('debe enviar PATCH request para marcar gasto como pagado', () => {
      service.markAsPaid(mockExpense.id).subscribe();

      const req = httpMock.expectOne(request =>
        request.url.includes(`expenses/${mockExpense.id}/paid`) &&
        request.method === 'PATCH'
      );

      expect(req.request.body).toEqual({});

      req.flush(mockExpense);
    });

    it('debe devolver gasto marcado como pagado', (done) => {
      service.markAsPaid(mockExpense.id).subscribe(expense => {
        expect(expense.id).toBe(mockExpense.id);
        done();
      });

      const req = httpMock.expectOne(request =>
        request.url.includes(`expenses/${mockExpense.id}/paid`)
      );

      req.flush(mockExpense);
    });

    it('debe manejar error cuando gasto no existe', (done) => {
      service.markAsPaid('non-existent').subscribe(
        () => {
          fail('debería haber fallado');
        },
        (error) => {
          expect(error).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(request =>
        request.url.includes('expenses/non-existent/paid')
      );

      req.flush(
        { message: 'Expense not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });
});
