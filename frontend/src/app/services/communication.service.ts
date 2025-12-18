import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

/**
 * Unidirectional Data Flow: Service acts as a centralized state manager
 * for sibling components to communicate without direct dependencies.
 */
@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  // Example subjects for different communication channels
  private modalSubject = new Subject<{ type: string; data?: any }>();
  public modal$ = this.modalSubject.asObservable();

  private sidebarStateSubject = new BehaviorSubject<boolean>(false);
  public sidebarState$ = this.sidebarStateSubject.asObservable();

  private navStateSubject = new BehaviorSubject<any>(null);
  public navState$ = this.navStateSubject.asObservable();

  constructor() {}

  /**
   * Emits modal event to open/close modals across the app.
   * Example: openModal('confirm', { title: 'Delete?', message: 'Sure?' })
   */
  openModal(type: string, data?: any): void {
    this.modalSubject.next({ type, data });
  }

  /**
   * Closes any open modal.
   */
  closeModal(): void {
    this.openModal('close');
  }

  /**
   * Toggles sidebar visibility state.
   */
  toggleSidebar(): void {
    this.sidebarStateSubject.next(!this.sidebarStateSubject.value);
  }

  /**
   * Sets sidebar state explicitly.
   */
  setSidebarState(isOpen: boolean): void {
    this.sidebarStateSubject.next(isOpen);
  }

  /**
   * Gets current sidebar state synchronously.
   */
  getSidebarState(): boolean {
    return this.sidebarStateSubject.value;
  }

  /**
   * Emits navigation state changes.
   */
  updateNavState(state: any): void {
    this.navStateSubject.next(state);
  }

  /**
   * Gets current navigation state synchronously.
   */
  getNavState(): any {
    return this.navStateSubject.value;
  }
}
