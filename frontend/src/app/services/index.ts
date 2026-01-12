/**
 * Services Index - Quick Reference
 *
 * This file provides exports for all application services.
 * Import services directly from './services' instead of full paths.
 */

export { AuthService } from './auth.service';
export type { User, AuthResponse } from '../core/models';
export { CommunicationService } from './communication.service';
export { ToastService } from './toast.service';
export type { Toast, ToastType } from './toast.service';
export { LoadingService } from './loading.service';
export { ThemeService } from './theme.service';
export { TripService } from './trip.service';
export type { Trip, TripFormData } from './trip.service';
export { CustomValidators } from './custom-validators';
