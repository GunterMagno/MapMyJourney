/**
 * MapMyJourney Frontend - Phase Implementation Status
 * Angular v21 with Standalone Components, Signals, Reactive Forms
 * 
 * COMPLETED PHASES:
 * ✅ PHASE 1: DOM & Events (Modal, Tabs, Tooltip, Button, Demo Page)
 * ✅ PHASE 2: Services & Communication (Auth, Communication, Toast, Loading, Theme services)
 * ✅ PHASE 3: Advanced Reactive Forms (Login, Signup with FormBuilder, validators, FormArray)
 */

// PHASE 1: Interactive Components
export { ModalComponent } from './components/shared/modal/modal';
export type { TabItem } from './components/shared/tabs/tabs';
export { TabsComponent } from './components/shared/tabs/tabs';
export type { TooltipPosition } from './components/shared/tooltip/tooltip';
export { TooltipComponent } from './components/shared/tooltip/tooltip';
export { ButtonComponent } from './components/shared/button/button';
export { DemoPageComponent } from './components/pages/demo-page/demo-page';

// PHASE 2: Global Components
export { ToastComponent } from './components/shared/toast/toast';
export { LoadingComponent } from './components/shared/loading/loading';

// PHASE 3: Form Components
export { FormInputComponent } from './components/shared/form-input/form-input';
export { FormSelectComponent } from './components/shared/form-select/form-select';
export { FormTextareaComponent } from './components/shared/form-textarea/form-textarea';
export { FormCheckboxComponent } from './components/shared/form-checkbox/form-checkbox';
export { LoginFormComponent } from './components/auth/login-form/login-form';
export { SignupFormComponent } from './components/auth/signup-form/signup-form';

// Page Components
export { TripsPageComponent } from './components/pages/trips-page/trips-page';

// Services
export { AuthService } from './services/auth.service';
export { CommunicationService } from './services/communication.service';
export { ToastService } from './services/toast.service';
export { LoadingService } from './services/loading.service';
export { ThemeService } from './services/theme.service';
export { CustomValidators } from './services/custom-validators';

// Routes Configuration
export { routes } from './app.routes';

/**
 * IMPLEMENTATION CHECKLIST
 * 
 * PHASE 1 - DOM & EVENTS:
 * ✅ Modal component with ESC-key close and backdrop dismiss
 * ✅ Tabs component with dynamic content switching
 * ✅ Tooltip component with multiple positions
 * ✅ Button component with variants and sizes
 * ✅ Demo page showcasing all Phase 1 components
 * ✅ Modern @if/@for template syntax (no *ngIf/*ngFor)
 * ✅ @HostListener for keyboard and mouse events
 * ✅ Renderer2 for safe DOM manipulation
 * 
 * PHASE 2 - SERVICES & COMMUNICATION:
 * ✅ AuthService with login/signup/logout
 * ✅ CommunicationService for component events
 * ✅ ToastService for notifications (success/error/warning/info)
 * ✅ LoadingService for global loading indicator
 * ✅ ThemeService for dark/light mode toggle
 * ✅ BehaviorSubject for persistent state
 * ✅ Subject for event streams
 * ✅ Toast and Loading global components
 * ✅ RxJS operators: takeUntil, debounceTime, switchMap
 * 
 * PHASE 3 - ADVANCED REACTIVE FORMS:
 * ✅ FormBuilder for group creation
 * ✅ FormControl binding in templates
 * ✅ Sync validators: required, minLength, maxLength, email, pattern
 * ✅ Custom sync validators: passwordStrength, nif, matchPassword
 * ✅ Custom async validators: uniqueEmail, uniqueNif
 * ✅ Cross-field validation (password match)
 * ✅ FormArray for dynamic controls (phone numbers)
 * ✅ Error message computation and display
 * ✅ LoginForm with email/password
 * ✅ SignupForm with 8 fields and complex validation
 * ✅ Form submission with service integration
 * ✅ Accessibility: role="alert", labels, focus management
 * 
 * ANGULAR 21 FEATURES:
 * ✅ Standalone Components (standalone: true)
 * ✅ Signals API (signal())
 * ✅ Control Flow Blocks (@if, @for, @switch)
 * ✅ Reactive Forms with TypeScript generics
 * ✅ Dependency Injection with inject()
 * ✅ Async Pipe in templates
 * ✅ @HostListener/@ViewChild/@Input/@Output
 * ✅ Route navigation and configuration
 * 
 * STYLING:
 * ✅ SCSS with CSS variables
 * ✅ Dark mode support (.dark-mode class)
 * ✅ Responsive design (mobile first)
 * ✅ Accessibility: focus states, color contrast
 * ✅ Transitions and animations
 * ✅ Component-scoped styles
 * 
 * ROUTES:
 * ✅ /demo - Phase 1 demonstration
 * ✅ /auth/login - Login form
 * ✅ /auth/signup - Signup form
 * ✅ /trips - Trips list page
 * ✅ /style-guide - Design system
 * 
 * NEXT STEPS (Optional):
 * ☐ Backend API integration
 * ☐ HTTP interceptors for auth tokens
 * ☐ Route guards (@CanActivate)
 * ☐ Trip details page and edit form
 * ☐ Expense management components
 * ☐ Unit tests
 * ☐ E2E tests with Cypress
 * ☐ PWA setup
 */
