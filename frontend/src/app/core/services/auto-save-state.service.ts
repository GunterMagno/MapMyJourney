import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoSaveStateService {
  private isSaved$ = new BehaviorSubject<boolean>(true);
  private isAutoSaving$ = new BehaviorSubject<boolean>(false);
  private saveCallback$ = new BehaviorSubject<(() => Promise<void>) | null>(null);

  constructor() {}

  getIsSaved(): Observable<boolean> {
    return this.isSaved$.asObservable();
  }

  setIsSaved(value: boolean): void {
    this.isSaved$.next(value);
  }

  getIsAutoSaving(): Observable<boolean> {
    return this.isAutoSaving$.asObservable();
  }

  setIsAutoSaving(value: boolean): void {
    this.isAutoSaving$.next(value);
  }

  registerSaveCallback(callback: () => Promise<void>): void {
    this.saveCallback$.next(callback);
  }

  getSaveCallback(): Observable<(() => Promise<void>) | null> {
    return this.saveCallback$.asObservable();
  }

  async executeSave(): Promise<void> {
    const callback = this.saveCallback$.getValue();
    if (callback) {
      this.setIsAutoSaving(true);
      try {
        await callback();
      } finally {
        this.setIsAutoSaving(false);
      }
    }
  }
}
