import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { User, AuthResponse } from '../core/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getUserFromStorage();
    if (token && user) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Login con HTTP real al backend
   * POST /api/users/login
   */
  login(email: string, password: string): Observable<AuthResponse> {
    console.log('AuthService.login called with:', email);
    return this.api.post<AuthResponse>('users/login', {
      email,
      password
    }).pipe(
      tap(response => {
        console.log('Login response:', response);
        this.setAuthData(response);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Signup con HTTP real al backend
   * POST /api/users/register
   */
  signup(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('users/register', {
      name,
      email,
      password
    }).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(error => {
        console.error('Signup error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout - limpia tokens y datos de usuario
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Guarda datos de autenticación después de login exitoso
   */
  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Obtiene el JWT token del localStorage
   */
  getToken(): string | null {
    return typeof window !== 'undefined'
      ? localStorage.getItem(this.TOKEN_KEY)
      : null;
  }

  /**
   * Verifica si existe un token válido
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    return !!token && token.length > 0;
  }

  /**
   * Obtiene el usuario actual desde localStorage
   */
  private getUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Obtiene el usuario actual de forma síncrona
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si está autenticado (síncrono)
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Alias de isAuthenticated() - usado por guards
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}
