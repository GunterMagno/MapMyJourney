import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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
   * Simulates login. Replace with actual HTTP call when backend is ready.
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return new Observable(observer => {
      // TODO: Replace with actual HTTP POST to backend
      // Example: this.http.post<AuthResponse>('/api/auth/login', { email, password })
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          name: 'Test User',
          email,
          role: 'USER'
        };
        const response: AuthResponse = {
          token: 'mock_jwt_token_' + Date.now(),
          user: mockUser
        };
        this.setAuthData(response);
        observer.next(response);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Simulates signup. Replace with actual HTTP call when backend is ready.
   */
  signup(name: string, email: string, password: string): Observable<AuthResponse> {
    return new Observable(observer => {
      // TODO: Replace with actual HTTP POST to backend
      setTimeout(() => {
        const mockUser: User = {
          id: Math.random().toString(),
          name,
          email,
          role: 'USER'
        };
        const response: AuthResponse = {
          token: 'mock_jwt_token_' + Date.now(),
          user: mockUser
        };
        this.setAuthData(response);
        observer.next(response);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Clears authentication data and logs out user.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Sets authentication data after successful login/signup.
   */
  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Retrieves JWT token from localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Checks if user has a valid token.
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    return !!token && token.length > 0;
  }

  /**
   * Gets current user from storage.
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Gets current user value synchronously.
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Gets authentication status synchronously.
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
