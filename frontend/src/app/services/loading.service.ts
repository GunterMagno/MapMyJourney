import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Global loading state service.
 * Manages loading indicators for HTTP requests and async operations.
 * Uses a counter approach: loading = true when counter > 0
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCounterSubject = new BehaviorSubject<number>(0);
  public isLoading$ = this.loadingCounterSubject.asObservable()
    .pipe();

  constructor() {}

  /**
   * Gets current loading status synchronously.
   */
  isLoading(): boolean {
    return this.loadingCounterSubject.value > 0;
  }

  /**
   * Starts a loading operation. Returns a function to stop it.
   * Useful for HTTP interceptors or async operations.
   * Usage: const stop = this.loadingService.start();
   *        stop(); // when done
   */
  start(): () => void {
    this.show();
    return () => this.hide();
  }

  /**
   * Increments the loading counter.
   */
  increment(): void {
    this.loadingCounterSubject.next(this.loadingCounterSubject.value + 1);
  }

  /**
   * Decrements the loading counter.
   */
  decrement(): void {
    const current = this.loadingCounterSubject.value;
    if (current > 0) {
      this.loadingCounterSubject.next(current - 1);
    }
  }

  /**
   * Alias for increment() - shows loading.
   */
  show(): void {
    this.increment();
  }

  /**
   * Alias for decrement() - hides loading.
   */
  hide(): void {
    this.decrement();
  }

  /**
   * Resets loading counter to 0.
   */
  reset(): void {
    this.loadingCounterSubject.next(0);
  }

  /**
   * Simulates a loading operation with timeout.
   * Useful for testing or demo purposes.
   */
  simulateLoading(durationMs: number = 2000): Promise<void> {
    const stop = this.start();
    return new Promise(resolve => {
      setTimeout(() => {
        stop();
        resolve();
      }, durationMs);
    });
  }
}
