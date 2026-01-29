import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ApiService } from '../core/services/api.service';
import { ToastService } from '../core/services/toast.service';
import { User, AuthResponse } from '../core/models';

/**
 * Tests para AuthService
 *
 * Cobertura:
 * - login(): debe llamar a ApiService.post, guardar token en localStorage,
 *   actualizar currentUserSignal
 * - logout(): debe limpiar localStorage y resetear señales
 * - Manejo de errores
 * - Verificación de autenticación
 */
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let apiService: ApiService;
  let toastService: ToastService;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    createdAt: new Date().toISOString()
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    token: 'test-jwt-token-12345'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, ApiService, ToastService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(ApiService);
    toastService = TestBed.inject(ToastService);

    // Limpiar localStorage antes de cada test
    localStorage.clear();

    // Spyear métodos de toastService
    spyOn(toastService, 'info');
    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  afterEach(() => {
    // Verificar que no hay peticiones HTTP pendientes
    httpMock.verify();
    // Limpiar localStorage
    localStorage.clear();
  });

  // ============================================================================
  // TESTS: LOGIN
  // ============================================================================

  describe('login()', () => {
    it('debe llamar a ApiService.post con las credenciales correctas', () => {
      const email = 'test@example.com';
      const password = 'password123';

      service.login(email, password).subscribe();

      const req = httpMock.expectOne(request => 
        request.url.includes('users/login') && request.method === 'POST'
      );

      expect(req.request.body).toEqual({
        email,
        password
      });

      req.flush(mockAuthResponse);
    });

    it('debe guardar el token en localStorage después de login exitoso', (done) => {
      service.login('test@example.com', 'password123').subscribe(() => {
        const token = localStorage.getItem('auth_token');
        expect(token).toBe('test-jwt-token-12345');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });

    it('debe guardar el usuario en localStorage después de login exitoso', (done) => {
      service.login('test@example.com', 'password123').subscribe(() => {
        const userJson = localStorage.getItem('current_user');
        expect(userJson).toBeTruthy();

        const user = JSON.parse(userJson!);
        expect(user.id).toBe('1');
        expect(user.email).toBe('test@example.com');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });

    it('debe actualizar currentUserSubject después de login exitoso', (done) => {
      service.login('test@example.com', 'password123').subscribe(() => {
        const currentUser = service.getCurrentUser();
        expect(currentUser).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });

    it('debe actualizar isAuthenticatedSubject a true después de login exitoso', (done) => {
      service.login('test@example.com', 'password123').subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });

    it('debe emitir isAuthenticated$ observable cuando login es exitoso', (done) => {
      let emissionCount = 0;
      
      service.isAuthenticated$.subscribe(isAuth => {
        emissionCount++;
        if (emissionCount === 2) { // Primera emisión inicial, segunda después de login
          expect(isAuth).toBe(true);
          done();
        }
      });

      service.login('test@example.com', 'password123').subscribe();

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });

    it('debe manejar errores de login correctamente', (done) => {
      service.login('test@example.com', 'wrongpassword').subscribe(
        () => {
          fail('debería haber fallado');
        },
        (error) => {
          expect(error).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('no debe guardar datos cuando login falla', (done) => {
      service.login('test@example.com', 'wrongpassword').subscribe(
        () => {
          fail('debería haber fallado');
        },
        () => {
          const token = localStorage.getItem('auth_token');
          expect(token).toBeNull();

          const user = localStorage.getItem('current_user');
          expect(user).toBeNull();

          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      );

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ============================================================================
  // TESTS: LOGOUT
  // ============================================================================

  describe('logout()', () => {
    beforeEach((done) => {
      // Simular un login previo
      service.login('test@example.com', 'password123').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });

    it('debe limpiar el token de localStorage', () => {
      expect(localStorage.getItem('auth_token')).toBe('test-jwt-token-12345');

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('debe limpiar el usuario de localStorage', () => {
      expect(localStorage.getItem('current_user')).toBeTruthy();

      service.logout();

      expect(localStorage.getItem('current_user')).toBeNull();
    });

    it('debe establecer currentUserSubject a null', () => {
      expect(service.getCurrentUser()).toEqual(mockUser);

      service.logout();

      expect(service.getCurrentUser()).toBeNull();
    });

    it('debe establecer isAuthenticatedSubject a false', () => {
      expect(service.isAuthenticated()).toBe(true);

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
    });

    it('debe emitir isAuthenticated$ como false cuando se realiza logout', (done) => {
      // Hacer login primero para tener algo que limpiar
      service.login('test@example.com', 'password123').subscribe(() => {
        let emissionCount = 0;

        service.isAuthenticated$.subscribe(isAuth => {
          emissionCount++;
          if (emissionCount === 1) { // Después de login está en true
            expect(isAuth).toBe(true);
            service.logout();
          } else if (emissionCount === 2) { // Después de logout está en false
            expect(isAuth).toBe(false);
            done();
          }
        });
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });

    it('debe mostrar un toast de info cuando se realiza logout', () => {
      service.logout();

      expect(toastService.info).toHaveBeenCalledWith(
        'Sesión cerrada correctamente',
        3000
      );
    });
  });

  // ============================================================================
  // TESTS: MÉTODOS AUXILIARES
  // ============================================================================

  describe('getToken()', () => {
    it('debe devolver null si no hay token guardado', () => {
      expect(service.getToken()).toBeNull();
    });

    it('debe devolver el token si está guardado', (done) => {
      service.login('test@example.com', 'password123').subscribe(() => {
        expect(service.getToken()).toBe('test-jwt-token-12345');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });
  });

  describe('hasValidToken()', () => {
    it('debe devolver false si no hay token', () => {
      expect(service.hasValidToken()).toBe(false);
    });

    it('debe devolver true si hay un token válido', (done) => {
      service.login('test@example.com', 'password123').subscribe(() => {
        expect(service.hasValidToken()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });
  });

  describe('isLoggedIn()', () => {
    it('debe ser un alias de isAuthenticated()', () => {
      expect(service.isLoggedIn()).toBe(service.isAuthenticated());
    });

    it('debe devolver true después de login exitoso', (done) => {
      service.login('test@example.com', 'password123').subscribe(() => {
        expect(service.isLoggedIn()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });

    it('debe devolver false después de logout', (done) => {
      service.login('test@example.com', 'password123').subscribe(() => {
        service.logout();
        expect(service.isLoggedIn()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });
  });

  // ============================================================================
  // TESTS: INTEGRACIÓN
  // ============================================================================

  describe('Flujo completo de autenticación', () => {
    it('debe manejar login -> uso -> logout correctamente', (done) => {
      // 1. Verificar estado inicial
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();

      // 2. Login
      service.login('test@example.com', 'password123').subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        expect(service.getCurrentUser()).toEqual(mockUser);

        // 3. Logout
        service.logout();
        expect(service.isAuthenticated()).toBe(false);
        expect(service.getCurrentUser()).toBeNull();

        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('users/login'));
      req.flush(mockAuthResponse);
    });
  });
});
