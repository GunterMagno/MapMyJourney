import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExpenseService } from './expense.service';

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExpenseService]
    });
    service = TestBed.inject(ExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have getExpensesByTrip method', () => {
    expect(typeof service.getExpensesByTrip).toBe('function');
  });

  it('should have addExpense method', () => {
    expect(typeof service.addExpense).toBe('function');
  });

  it('should have deleteExpense method', () => {
    expect(typeof service.deleteExpense).toBe('function');
  });
});
