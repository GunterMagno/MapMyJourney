/**
 * Barrel export para Core Guards
 * Simplifica los imports en app.routes.ts
 */

export { authGuard } from './auth.guard';
export { pendingChangesGuard, type FormComponent } from './pending-changes.guard';
