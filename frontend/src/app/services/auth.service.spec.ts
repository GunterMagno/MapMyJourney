import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have login method', () => {
    expect(typeof service.login).toBe('function');
  });

  it('should have logout method', () => {
    expect(typeof service.logout).toBe('function');
  });

  it('should have signup method', () => {
    expect(typeof service.signup).toBe('function');
  });
});
