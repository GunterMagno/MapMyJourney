
FASE 5: SERVICIOS Y COMUNICACIÓN HTTP¶

Criterios: RA7.a, RA7.b, RA7.c, RA7.d, RA7.e, RA7.f, RA7.g

Entrega: 18 de diciembre (paralela a DIW Fases 1-2-3-4-5)

Objetivos:

Implementar comunicación asíncrona con backend usando HttpClient. Consumir APIs REST reales o simuladas para obtener y enviar datos.
Tarea 1: Configuración de HttpClient¶

Ten en cuenta que son tareas que están dispuestas para la realización de un proyecto en Angular. Estamos en Angular

La configuración recomendada en Angular actual es usar provideHttpClient con interceptores funcionales, más un servicio base que envuelva las operaciones HTTP comunes.^1
Importar / configurar HttpClient¶

En lugar de HttpClientModule, define provideHttpClient en tu app.config.ts:

// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]) // aquí se registran los interceptores
    )
  ]
};

Servicio base para HTTP¶

Crea un servicio que centralice la URL base y maneje errores de forma genérica:

// core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://api.miapp.com';

  get<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('HTTP error', error);
    return throwError(() => error);
  }
}

Luego, los servicios de dominio delegan en ApiService:

// features/products/product.service.ts
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  getProducts() {
    return this.api.get<Product[]>('products');
  }

  getProduct(id: string) {
    return this.api.get<Product>(`products/${id}`);
  }
}

Interceptores para headers comunes¶

Define un interceptor funcional para añadir headers como Authorization, Content-Type o cualquier cabecera de tracking.^3

// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token'); // o servicio AuthService

  let headers = req.headers
    .set('Content-Type', 'application/json')
    .set('X-App-Client', 'Angular-DWEC');

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const cloned = req.clone({ headers });
  return next(cloned);
};

Si necesitas varios interceptores (logging, errores, cache), añádelos en orden:

provideHttpClient(
  withInterceptors([
    authInterceptor,
    loggingInterceptor,
    errorInterceptor
  ])
);

Esta configuración deja clara en la documentación:

    cómo se habilita HttpClient a nivel global,
    qué hace el servicio base (ApiService)
    y qué headers añade cada interceptor en todas las peticiones.

⁂
Tarea 2: Operaciones CRUD completas¶

Las operaciones CRUD en Angular se implementan con HttpClient en servicios de dominio, tipando bien las respuestas y usando observables para gestionar el flujo async.^1
GET: listados e individuales¶

// features/products/product.service.ts
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = 'https://api.miapp.com/products';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }
}

Uso en componente:

products$ = this.productService.getAll();
product$  = this.productService.getById(id);

POST: crear recursos¶

create(product: CreateProductDto): Observable<Product> {
  return this.http.post<Product>(this.baseUrl, product);
}

onSubmit() {
  if (this.form.invalid) return;
  this.productService.create(this.form.value).subscribe({
    next: p => this.toast.success('Producto creado'),
    error: () => this.toast.error('Error al crear')
  });
}

PUT/PATCH: actualizar recursos¶

// PUT: reemplazo completo
update(id: string, product: UpdateProductDto): Observable<Product> {
  return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
}

// PATCH: actualización parcial
patch(id: string, partial: Partial<UpdateProductDto>): Observable<Product> {
  return this.http.patch<Product>(`${this.baseUrl}/${id}`, partial);
}

save() {
  const id = this.form.value.id;
  this.productService.update(id, this.form.value).subscribe(/* ... */);
}

DELETE: eliminar recursos¶

delete(id: string): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}

onDelete(id: string) {
  if (!confirm('¿Eliminar producto?')) return;
  this.productService.delete(id).subscribe({
    next: () => this.loadList(),
    error: () => this.toast.error('No se pudo borrar')
  });
}

Buenas prácticas CRUD en la documentación¶

    Centralizar URL base y manejo de errores en un servicio (ApiService) y que cada ProductService, UserService, etc. delegue en él.^3
    Tipar siempre las llamadas (get<Product[]>, post<Product>).
    Documentar en el README qué endpoints se usan para cada operación (GET /products, POST /products, PUT /products/:id, DELETE /products/:id) y en qué componentes se consumen.

⁂
Tarea 3: Manejo de respuestas¶

El manejo de respuestas HTTP en Angular se basa en tipar bien los datos y usar operadores RxJS (map, catchError, retry) sobre los observables que devuelve HttpClient.^1
Tipado con interfaces TypeScript¶

Define interfaces para las respuestas de tu API y úsalo como genérico en HttpClient:

// models/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: string;
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
}

// product.service.ts
getProducts() {
  return this.http.get<ApiListResponse<Product>>('/api/products');
}

getProduct(id: string) {
  return this.http.get<Product>(`/api/products/${id}`);
}

Así data.items ya es Product[] y dispones de autocompletado y chequeo de tipos.^3
Transformación de datos con map¶

Usa map para adaptar la respuesta del backend al modelo de tu UI (añadir campos, convertir fechas, etc.).^5

import { map } from 'rxjs/operators';

getProductsViewModel() {
  return this.http
    .get<ApiListResponse<Product>>('/api/products')
    .pipe(
      map(res => res.items.map(p => ({
        ...p,
        priceWithTax: p.price * 1.21,
        createdAt: new Date(p.createdAt)
      })))
    );
}

En el componente:

products$ = this.productService.getProductsViewModel();

Manejo de errores con catchError¶

Centraliza el tratamiento de errores con catchError, devolviendo un observable “seguro” o relanzando el error.^7^9

import { catchError, throwError } from 'rxjs';

getProduct(id: string) {
  return this.http.get<Product>(`/api/products/${id}`).pipe(
    catchError(err => {
      // logging + mensaje de negocio
      console.error('Error al cargar producto', err);
      return throwError(() => new Error('No se pudo cargar el producto'));
    })
  );
}

En el componente:

this.productService.getProduct(id).subscribe({
  next: product => this.product.set(product),
  error: err => this.toast.error(err.message)
});

También puedes devolver un valor “vacío” para no romper el flujo:

getProductsSafe() {
  return this.http.get<Product[]>('/api/products').pipe(
    catchError(() => of([])) // lista vacía en caso de error
  );
}

Retry logic para peticiones fallidas¶

Para fallos temporales (timeouts, 5xx) puedes reintentar con retry o retryWhen.^10

import { retry } from 'rxjs/operators';

getProductsStable() {
  return this.http.get<Product[]>('/api/products').pipe(
    retry(2), // intenta 2 veces más antes de fallar
    catchError(err => throwError(() => err))
  );
}

Con backoff y condición de estado:

import { retryWhen, delay, scan } from 'rxjs/operators';

getProductsWithBackoff() {
  return this.http.get<Product[]>('/api/products').pipe(
    retryWhen(errors =>
      errors.pipe(
        scan((acc, error) => {
          if (acc >= 3 || error.status < 500) {
            throw error; // no reintentar si no es 5xx o ya reintentó 3 veces
          }
          return acc + 1;
        }, 0),
        delay(1000) // 1s entre reintentos
      )
    ),
    catchError(err => throwError(() => err))
  );
}

En tu documentación de Angular puedes resumir:

    Qué interfaces describen cada respuesta.
    Qué transformaciones aplica cada servicio con map.
    Cómo se gestionan errores (mensaje genérico, logging, toasts).
    En qué endpoints se usa retry y cuántos reintentos se permiten.

⁂
Tarea 4: Diferentes formatos¶

En la documentación de HTTP de tu proyecto Angular puedes explicar así los distintos formatos de petición y respuesta.
JSON como formato principal¶

La API se consume principalmente en JSON, que es el formato por defecto de HttpClient.^1

getProducts() {
  return this.http.get<Product[]>('/api/products');        // JSON -> Product[]
}

createProduct(body: CreateProductDto) {
  return this.http.post<Product>('/api/products', body);   // body JSON
}

El interceptor de headers suele fijar Content-Type: application/json para estas peticiones.
FormData para subida de archivos¶

Cuando se suben archivos (imágenes, documentos) se usa FormData, que envía multipart/form-data y permite mezclar campos texto + ficheros.^3

uploadProductImage(productId: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('productId', productId);

  return this.http.post<UploadResponse>('/api/products/upload-image', formData);
}

No se debe fijar manualmente Content-Type en este caso; el navegador genera el boundary correcto.
Query params para filtros y paginación¶

Filtros, búsqueda y paginación se envían en la URL como query params, manteniendo las peticiones idempotentes.^4

getProductsFiltered(page: number, pageSize: number, search?: string) {
  const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize)
    .set('search', search ?? '');

  return this.http.get<ApiListResponse<Product>>('/api/products', { params });
}

Ejemplos de URL generadas:

    /api/products?page=1&pageSize=10
    /api/products?page=2&pageSize=20&search=angular

Headers personalizados cuando sea necesario¶

Además de los headers comunes gestionados por interceptores (Authorization, Content-Type, etc.), algunos endpoints pueden requerir cabeceras específicas (locale, API key, feature flag).^5

getSecureReport(format: 'pdf' | 'csv') {
  const headers = new HttpHeaders()
    .set('X-Report-Format', format)
    .set('X-Client-Version', 'web-1.0.0');

  return this.http.get<Blob>('/api/reports/sales', {
    headers,
    responseType: 'blob' as 'json'
  });
}

En la documentación indica:

    JSON como formato estándar de entrada/salida.
    Uso de FormData en servicios de upload.
    Convención de query params para page, pageSize, sort, search.
    Qué headers personalizados existen y qué significado tienen (por ejemplo X-Client-Version, X-Tenant-Id).^3

⁂
Tarea 5: Estados de carga y error¶

Los estados de carga y error se gestionan mejor con un pequeño “view model” por petición: loading, error, data y, opcionalmente, success, en lugar de solo un observable de datos.^1
Loading state durante peticiones¶

En el componente:

state = signal<{ loading: boolean; error: string | null; data: Product[] | null }>({
  loading: false,
  error: null,
  data: null
});

loadProducts() {
  this.state.update(() => ({ loading: true, error: null, data: null }));

  this.productService.getAll().subscribe({
    next: products => this.state.update(() => ({ loading: false, error: null, data: products })),
    error: () => this.state.update(() => ({ loading: false, error: 'Error al cargar productos', data: null }))
  });
}

En la plantilla:

<button (click)="loadProducts()">Recargar</button>

<div *ngIf="state().loading" class="loading">
  Cargando productos...
</div>

Error state con mensajes al usuario¶

<div *ngIf="state().error && !state().loading" class="error">
  {{ state().error }}
  <button type="button" (click)="loadProducts()">Reintentar</button>
</div>

Puedes combinarlo con toasts globales para errores generales (interceptor HTTP) y mensajes específicos en la vista para errores de dominio.^3
Empty state cuando no hay datos¶

<ul *ngIf="state().data as products">
  <li *ngFor="let p of products">{{ p.name }} - {{ p.price | currency }}</li>
</ul>

<div *ngIf="!state().loading && !state().error && state().data?.length === 0" class="empty">
  No hay productos disponibles.
</div>

Buenas prácticas:

    Diferenciar entre “no se ha cargado nada todavía” (data: null) y “cargado pero vacío” (data: []).^5

Success feedback después de operaciones¶

Para operaciones de escritura (POST/PUT/DELETE), combina:

    Estado local (isSaving, isDeleting, etc.).
    Toasts o mensajes inline de éxito.^6

isSaving = signal(false);

save() {
  if (this.form.invalid) return;
  this.isSaving.set(true);

  this.productService.save(this.form.value).subscribe({
    next: () => {
      this.isSaving.set(false);
      this.toast.success('Producto guardado correctamente');
    },
    error: () => {
      this.isSaving.set(false);
      this.toast.error('No se pudo guardar el producto');
    }
  });
}

<button type="submit" [disabled]="form.invalid || isSaving()">
  {{ isSaving() ? 'Guardando...' : 'Guardar' }}
</button>

En la documentación indica qué patrón se sigue:

    loading mientras se espera respuesta.
    error con mensaje y botón de reintento.
    empty cuando la respuesta está vacía.
    success con feedback visual (toast o mensaje bajo el formulario).^8

⁂
Tarea 6: Interceptores HTTP¶

Un interceptor HTTP en Angular actúa como middleware para añadir lógica común (auth, errores, logs) a todas las peticiones de HttpClient sin repetir código en cada servicio.^1
Interceptor para añadir token de autenticación¶

// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token'); // o AuthService

  // opcional: no añadir token a rutas públicas
  const isAuthUrl = req.url.includes('/login') || req.url.includes('/public');
  if (!token || isAuthUrl) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq);
};

Registro en app.config.ts:

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

provideHttpClient(
  withInterceptors([authInterceptor])
);

Interceptor para manejo global de errores¶

// core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Error inesperado. Inténtalo de nuevo más tarde.';

      if (error.status === 0) {
        message = 'No hay conexión con el servidor.';
      } else if (error.status === 401) {
        message = 'Sesión no válida. Vuelve a iniciar sesión.';
      } else if (error.status === 403) {
        message = 'No tienes permisos para realizar esta acción.';
      } else if (error.status >= 500) {
        message = 'Error interno del servidor.';
      }

      // Aquí puedes inyectar un servicio de notificaciones
      // toast.error(message);

      return throwError(() => error);
    })
  );
};

Registro junto al de auth:

provideHttpClient(
  withInterceptors([
    authInterceptor,
    errorInterceptor
  ])
);

Interceptor para logging de requests¶

// core/interceptors/logging.interceptor.ts
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();
  console.log(`[HTTP] ${req.method} ${req.urlWithParams}`, req);

  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - started;
          console.log(
            `[HTTP] Respuesta ${req.method} ${req.urlWithParams} ${event.status} (${elapsed} ms)`,
            event.body
          );
        }
      },
      error: err => {
        const elapsed = Date.now() - started;
        console.error(
          `[HTTP] Error ${req.method} ${req.urlWithParams} (${elapsed} ms)`,
          err
        );
      }
    })
  );
};

Registro (normalmente el logging va al final para ver la request/response ya modificada por otros interceptores):^2

provideHttpClient(
  withInterceptors([
    authInterceptor,
    errorInterceptor,
    loggingInterceptor
  ])
);

En la documentación de tu proyecto especifica:

    Qué interceptor añade el token y de dónde lo obtiene (localStorage, servicio, etc.).
    Qué códigos de estado gestiona el interceptor de errores y qué mensajes ve el usuario.
    Que el interceptor de logging está pensado solo para desarrollo y puede desactivarse en producción.^4

⁂
Tarea 7: Documentación¶

La documentación de HTTP de tu proyecto Angular puede estructurarse en estas tres secciones.
Catálogo de endpoints consumidos¶

Incluye una tabla con todos los endpoints que usa la SPA, el método, descripción y servicio Angular que los consume.^1

### Endpoints REST

| Método | URL                         | Descripción                       | Servicio / método                    |
|--------|-----------------------------|-----------------------------------|--------------------------------------|
| GET    | `/api/products`            | Listado paginado de productos     | `ProductService.getAll()`           |
| GET    | `/api/products/:id`        | Detalle de producto               | `ProductService.getById(id)`        |
| POST   | `/api/products`            | Crear nuevo producto              | `ProductService.create(dto)`        |
| PUT    | `/api/products/:id`        | Actualizar producto completo      | `ProductService.update(id, dto)`    |
| DELETE | `/api/products/:id`        | Eliminar producto                 | `ProductService.delete(id)`         |
| GET    | `/api/users/me`            | Datos del usuario autenticado     | `UserService.getProfile()`          |
| PUT    | `/api/users/me`            | Actualizar perfil                 | `UserService.updateProfile(dto)`    |
| POST   | `/api/auth/login`          | Login, devuelve token JWT         | `AuthService.login(credentials)`    |
| POST   | `/api/upload`             | Subida de ficheros (FormData)     | `UploadService.upload(file)`        |

Estructura de datos (interfaces)¶

Documenta las interfaces TypeScript que tipan las respuestas y cuerpos de petición.^3

### Interfaces de dominio

// Producto export interface Product { id: string; name: string; description: string; price: number; imageUrl?: string; createdAt: string; updatedAt?: string; }

// Usuario autenticado export interface User { id: string; name: string; email: string; role: 'admin' | 'user'; }

// Respuesta genérica paginada export interface PaginatedResponse { items: T[]; total: number; page: number; pageSize: number; }


// DTOs de entrada export interface CreateProductDto { name: string; description: string; price: number; }

export interface UpdateProductDto extends Partial {}

export interface LoginResponse { token: string; user: User; }


Estrategia de manejo de errores¶

Explica el flujo global de errores: interceptor + servicios + feedback en UI.^5^7

### Manejo de errores HTTP

1. **Interceptor global (`errorInterceptor`)**
   - Intercepta todas las respuestas de `HttpClient`.
   - Mapea códigos de estado a mensajes de usuario:
     - `0` → "No hay conexión con el servidor."
     - `401` → "Sesión caducada, vuelve a iniciar sesión."
     - `403` → "No tienes permisos para esta acción."
     - `5xx` → "Ha ocurrido un error en el servidor."
   - Lanza el error con `throwError` para que el servicio/componente pueda reaccionar.

export const errorInterceptor: HttpInterceptorFn = (req, next) => next(req).pipe( catchError((error: HttpErrorResponse) => { const message = mapStatusToMessage(error.status); toast.error(message); // servicio de notificaciones return throwError(() => error); }) );

2. **Servicios de dominio**
   - Pueden aplicar `catchError` adicional solo para casos de negocio (por ejemplo, transformar un `409` en mensaje específico).
   - Devuelven observables tipados (`Observable<Product[]>`, etc.).

3. **Componentes**
   - Gestionan estados `loading`, `error`, `empty`, `success` a nivel de UI.
   - No conocen detalles de HTTP, solo mensajes de alto nivel.

state = signal<{ loading: boolean; error: string | null }>({ loading: false, error: null });

load() { this.state.set({ loading: true, error: null }); this.productService.getAll().subscribe({ next: () => this.state.set({ loading: false, error: null }), error: () => this.state.set({ loading: false, error: 'No se pudieron cargar los productos' }) }); }

```

Esta sección deja claro para el lector:

    Qué endpoints existen y quién los usa.
    Qué forma tienen los datos que entran/salen.
    Cómo se tratan los errores de red y de negocio en toda la aplicación.[web:228][web:209]

⁂

Tareas:

    Configuración de HttpClient

    Importar HttpClientModule
    Crear servicio base para HTTP
    Configurar interceptores para headers comunes

    Operaciones CRUD completas

    GET: Obtener listados y elementos individuales
    POST: Crear nuevos recursos
    PUT/PATCH: Actualizar recursos
    DELETE: Eliminar recursos

    Manejo de respuestas

    Tipado de respuestas con interfaces TypeScript
    Transformación de datos con map
    Manejo de errores con catchError
    Retry logic para peticiones fallidas

    Diferentes formatos

    JSON (principal)
    FormData para upload de archivos
    Query params para filtros y paginación
    Headers personalizados cuando necesario

    Estados de carga y error

    Loading state durante peticiones
    Error state con mensajes al usuario
    Empty state cuando no hay datos
    Success feedback después de operaciones

    Interceptores HTTP

    Interceptor para añadir token de autenticación
    Interceptor para manejo global de errores
    Interceptor para logging de requests

    Documentación

    Catálogo de endpoints consumidos
    Estructura de datos (interfaces)
    Estrategia de manejo de errores

Entregables:

    Servicio HTTP con operaciones CRUD completas
    Consumo de API REST (real o simulada con json-server)
    Manejo de errores robusto
    Loading/error/empty states en UI
    Interceptores HTTP implementados
    Interfaces TypeScript para todas las respuestas
    Documentación de API

