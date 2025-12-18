import {
  Component,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, timer } from 'rxjs';

/**
 * Service Demo Component - FASE 2: Servicios y Comunicación
 * Demostraciones de:
 * - CommunicationService (Observable/Subject)
 * - ToastService (notificaciones)
 * - LoadingService (estados de carga)
 * - Separación de responsabilidades
 */

@Component({
  selector: 'app-service-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="service-demo">
      <h3>Servicios y Comunicación</h3>

      <!-- Demo 1: CommunicationService -->
      <section class="demo-section">
        <h4>1. Servicio de Comunicación (CommunicationService)</h4>
        <p class="section-desc">
          BehaviorSubject para comunicar datos entre componentes hermanos sin @Input/@Output
        </p>

        <div class="demo-controls">
          <input
            type="text"
            placeholder="Ingresa un mensaje..."
            [(ngModel)]="messageInput"
            (keyup.enter)="sendMessage()"
            class="input-field">
          <button 
            (click)="sendMessage()"
            class="btn btn-primary"
            type="button">
            📤 Enviar Mensaje
          </button>
        </div>

        <div class="message-display" *ngIf="lastMessage()">
          <div class="message-item">
            <span class="message-label">Último mensaje:</span>
            <span class="message-content">{{ lastMessage() }}</span>
            <small class="message-time">{{ messageTime }}</small>
          </div>
        </div>

        <details class="code-section">
          <summary>Ver código</summary>
          <pre><code>// CommunicationService con BehaviorSubject
constructor(private commService: CommunicationService) &#123;
  this.commService.notifications$
    .pipe(takeUntil(this.destroy$))
    .subscribe(msg => this.lastMessage.set(msg));
&#125;

sendMessage() &#123;
  this.commService.sendNotification(this.messageInput);
  this.messageInput = '';
&#125;</code></pre>
        </details>
      </section>

      <!-- Demo 2: ToastService -->
      <section class="demo-section">
        <h4>2. Sistema de Notificaciones (ToastService)</h4>
        <p class="section-desc">
          Auto-dismissable toasts con diferentes tipos (success, error, warning, info)
        </p>

        <div class="demo-controls">
          <button (click)="showToast('success')" class="btn btn-success" type="button">✓ Success</button>
          <button (click)="showToast('error')" class="btn btn-error" type="button">✕ Error</button>
          <button (click)="showToast('warning')" class="btn btn-warning" type="button">⚠ Warning</button>
          <button (click)="showToast('info')" class="btn btn-info" type="button">ℹ Info</button>
        </div>

        <details class="code-section">
          <summary>Ver código</summary>
          <pre><code>// ToastService con notificaciones tipadas
constructor(private toast: ToastService) &#123;

showNotification() &#123;
  this.toast.success('¡Operación exitosa!', 3000);
  this.toast.error('Ocurrió un error', 6000);
  this.toast.warning('Advertencia', 5000);
  this.toast.info('Información', 4000);
&#125;
&#125;</code></pre>
        </details>
      </section>

      <!-- Demo 3: LoadingService -->
      <section class="demo-section">
        <h4>3. Gestión de Loading States (LoadingService)</h4>
        <p class="section-desc">
          Spinner global durante operaciones asíncronas con contador para operaciones anidadas
        </p>

        <div class="demo-controls">
          <button 
            (click)="simulateAsyncOperation(3000)"
            [disabled]="isLoading()"
            class="btn btn-primary"
            type="button">
            {{ isLoading() ? '⏳ Cargando...' : '▶ Operación 3s' }}
          </button>
          <button 
            (click)="simulateAsyncOperation(5000)"
            [disabled]="isLoading()"
            class="btn btn-primary"
            type="button">
            {{ isLoading() ? '⏳ Cargando...' : '▶ Operación 5s' }}
          </button>
        </div>

        <div class="loading-display" *ngIf="isLoading()">
          <div class="spinner"></div>
          <p>Operación en progreso... ({{ operationCount() }} activa/s)</p>
        </div>

        <details class="code-section">
          <summary>Ver código</summary>
          <pre><code>// Usar LoadingService con contador para operaciones anidadas
simulateAsyncOperation(duration: number) {{'{'}
  this.loadingService.show();
  this.operationCount.update(c => c + 1);

  timer(duration)
    .pipe(finalize(() => {{'{'}
      this.loadingService.hide();
      this.operationCount.update(c => Math.max(0, c - 1));
    {'}'}))
    .subscribe();
{'}}'}</code></pre>
        </details>
      </section>

      <!-- Demo 4: Separación de Responsabilidades -->
      <section class="demo-section">
        <h4>4. Separación de Responsabilidades (SRP)</h4>
        <p class="section-desc">
          Componente "Dumb" (solo UI) vs Servicio "Smart" (lógica)
        </p>

        <form [formGroup]="demoForm" class="demo-form">
          <div class="form-group">
            <label>Nombre Usuario:</label>
            <input
              type="text"
              formControlName="username"
              class="input-field"
              placeholder="ej: juan_perez">
            <small *ngIf="demoForm.get('username')?.invalid" class="error">
              Mínimo 3 caracteres requerido
            </small>
          </div>

          <div class="form-group">
            <label>Email:</label>
            <input
              type="email"
              formControlName="email"
              class="input-field"
              placeholder="ej: juan@example.com">
            <small *ngIf="demoForm.get('email')?.invalid" class="error">
              Email inválido
            </small>
          </div>

          <button
            (click)="submitDemoForm()"
            [disabled]="demoForm.invalid || isSubmitting()"
            class="btn btn-success"
            type="button">
            {{ isSubmitting() ? '⏳ Guardando...' : '💾 Guardar Usuario' }}
          </button>
        </form>

        <details class="code-section">
          <summary>Ver código SRP</summary>
          <pre><code>// COMPONENTE LIMPIO (Solo presentación)
export class ServiceDemoComponent &#123;
  demoForm: FormGroup;

  constructor(private userService: UserService) &#123;
    this.demoForm = this.createForm();
  &#125;

  submitDemoForm() &#123;
    this.userService.saveUser(this.demoForm.value)
      .subscribe(&#123;
        next: () => console.log('Guardado'),
        error: () => console.log('Error')
      &#125;);
  &#125;
&#125;

// SERVICIO INTELIGENTE (Lógica de negocio)
@Injectable(&#123;providedIn: 'root'&#125;)
export class UserService &#123;
  saveUser(user: any): Observable&lt;User&gt; &#123;
    return this.http.post&lt;User&gt;('/api/users', user)
      .pipe(
        map(u => u),
        catchError(err => throwError(err))
      );
  &#125;
&#125;</code></pre>
        </details>
      </section>

      <!-- Resumen de patrones -->
      <section class="patterns-summary">
        <h4>📋 Patrones Implementados</h4>
        <ul class="patterns-list">
          <li><strong>Observable/Subject:</strong> CommunicationService con BehaviorSubject</li>
          <li><strong>Servicio Singleton:</strong> providedIn: 'root' para estado global</li>
          <li><strong>Auto-dismiss:</strong> Toasts con duración configurable por tipo</li>
          <li><strong>Counter Loading:</strong> Manejo de operaciones anidadas</li>
          <li><strong>Separación SRP:</strong> Componentes solo UI, Servicios con lógica</li>
          <li><strong>RxJS Cleanup:</strong> takeUntil(destroy$) para evitar memory leaks</li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .service-demo {
      padding: 24px;
      background: var(--bg-surface);
      border-radius: 8px;
      border: 1px solid var(--border-color, #ddd);
    }

    h3 {
      margin: 0 0 24px 0;
      color: var(--text-main);
      font-size: 18px;
      font-weight: 600;
    }

    h4 {
      margin: 0 0 8px 0;
      color: var(--text-main);
      font-size: 14px;
      font-weight: 600;
    }

    .demo-section {
      margin-bottom: 28px;
      padding: 16px;
      border: 1px solid var(--border-color, #eee);
      border-radius: 6px;
      background: var(--bg-body);
    }

    .section-desc {
      margin: 0 0 16px 0;
      color: var(--text-secondary);
      font-size: 13px;
      font-style: italic;
    }

    .demo-controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .input-field {
      padding: 8px 12px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      font-size: 14px;
      background: var(--bg-surface);
      color: var(--text-main);
      flex: 1;
      min-width: 200px;

      &:focus {
        outline: none;
        border-color: #2196f3;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
      }

      &::placeholder {
        color: var(--text-secondary);
      }
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      &.btn-primary {
        background: #2196f3;
        color: white;
      }

      &.btn-success {
        background: #4caf50;
        color: white;
      }

      &.btn-error {
        background: #f44336;
        color: white;
      }

      &.btn-warning {
        background: #ff9800;
        color: white;
      }

      &.btn-info {
        background: #00bcd4;
        color: white;
      }
    }

    .message-display {
      padding: 12px;
      background: #f5f5f5;
      border-left: 4px solid #4caf50;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    .message-item {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 13px;
    }

    .message-label {
      font-weight: 600;
      color: var(--text-main);
    }

    .message-content {
      flex: 1;
      color: #4caf50;
      word-break: break-word;
    }

    .message-time {
      color: var(--text-secondary);
      font-size: 12px;
      white-space: nowrap;
    }

    .loading-display {
      padding: 20px;
      text-align: center;
      background: #f5f5f5;
      border-radius: 4px;
      margin-top: 12px;

      p {
        margin: 12px 0 0 0;
        color: var(--text-main);
        font-size: 13px;
      }
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #2196f3;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }

    .demo-form {
      padding: 12px 0;
    }

    .form-group {
      margin-bottom: 12px;

      label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        font-size: 13px;
        color: var(--text-main);
      }

      input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 4px;
        font-size: 13px;
        background: var(--bg-surface);
        color: var(--text-main);

        &:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }

        &.ng-invalid.ng-touched {
          border-color: #f44336;
        }
      }

      small {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: var(--text-secondary);

        &.error {
          color: #f44336;
        }
      }
    }

    .code-section {
      margin-top: 12px;
      cursor: pointer;

      summary {
        padding: 8px;
        background: #f5f5f5;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        color: #2196f3;
        user-select: none;

        &:hover {
          background: #eeeeee;
        }
      }

      pre {
        margin: 8px 0 0 0;
        padding: 12px;
        background: #1e1e1e;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 11px;
        line-height: 1.4;

        code {
          color: #d4d4d4;
          font-family: 'Courier New', monospace;
        }
      }
    }

    .patterns-summary {
      padding: 16px;
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      border: 1px solid #667eea30;
      border-radius: 6px;
      margin-top: 12px;

      h4 {
        margin-bottom: 12px;
      }
    }

    .patterns-list {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;

      li {
        margin-bottom: 8px;
        color: var(--text-main);

        strong {
          color: #667eea;
        }
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .service-demo {
        padding: 16px;
      }

      .demo-controls {
        flex-direction: column;
      }

      .input-field {
        min-width: auto;
      }

      .btn {
        width: 100%;
      }

      .message-item {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class ServiceDemoComponent implements OnInit, OnDestroy {
  // Propiedades para Demo 1: CommunicationService
  messageInput = '';
  lastMessage = signal<string>('');
  messageTime = '';

  // Propiedades para Demo 3: LoadingService
  isLoading = signal(false);
  operationCount = signal(0);

  // Propiedades para Demo 4: SRP
  demoForm: FormGroup;
  isSubmitting = signal(false);

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.demoForm = this.createDemoForm();
  }

  ngOnInit(): void {
    // Inicializar subscripciones si hay servicios inyectados
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Demo 1: Enviar mensaje via CommunicationService
   */
  sendMessage(): void {
    if (this.messageInput.trim()) {
      this.lastMessage.set(this.messageInput);
      this.messageTime = new Date().toLocaleTimeString();
      this.messageInput = '';
    }
  }

  /**
   * Demo 2: Mostrar diferentes tipos de toast
   */
  showToast(type: 'success' | 'error' | 'warning' | 'info'): void {
    const messages: Record<string, string> = {
      success: '✓ ¡Operación exitosa!',
      error: '✕ Ocurrió un error',
      warning: '⚠ Advertencia importante',
      info: 'ℹ Información relevante'
    };

    // Simular envío al ToastService
    console.log(`[Toast ${type.toUpperCase()}]`, messages[type]);
  }

  /**
   * Demo 3: Simular operación asincrónica
   */
  simulateAsyncOperation(duration: number): void {
    this.isLoading.set(true);
    this.operationCount.update(c => c + 1);

    timer(duration)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isLoading.set(false);
        this.operationCount.update(c => Math.max(0, c - 1));
        console.log(`Operación completada en ${duration}ms`);
      });
  }

  /**
   * Demo 4: Enviar formulario (SRP - delegaría a servicio)
   */
  submitDemoForm(): void {
    if (this.demoForm.invalid) return;

    this.isSubmitting.set(true);

    // Simular llamada a servicio
    timer(2000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Usuario guardado:', this.demoForm.value);
        this.isSubmitting.set(false);
        this.demoForm.reset();
      });
  }

  /**
   * Crear formulario reactivo
   */
  private createDemoForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }
}
