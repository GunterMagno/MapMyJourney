FASE 6: GESTIÓN DE ESTADO Y ACTUALIZACIÓN DINÁMICA¶

Criterios: RA7.e, RA7.h, RA7.i

Entrega: Después de Navidad (paralela a DIW Fase 6)

Objetivos:

Implementar gestión de estado reactiva y actualización dinámica del DOM sin recargas. Evaluar y usar librerías modernas.
Fase 6: Gestión de estado y actualización dinámica

Tareas:

- Actualización dinámica sin recargas
   - Actualizar listas después de crear/editar/eliminar  
   - Actualizar contadores y estadísticas en tiempo real  
   - Refrescar datos sin perder scroll position
- Patrón de gestión de estado - **Elige uno**:
   - Servicios con BehaviorSubject (más simple)  
   - Signals de Angular (moderno, recomendado)  
   - NgRx (avanzado, opcional)
- Optimización de rendimiento
   - OnPush ChangeDetectionStrategy donde aplicable  
   - TrackBy en ngFor para listas grandes  
   - Unsubscribe de observables para evitar memory leaks  
   - Async pipe para gestión automática de suscripciones
- Paginación y scroll infinito
   - Implementar paginación en listados  
   - O implementar infinite scroll  
   - Loading states durante carga de más datos
- Búsqueda y filtrado en tiempo real
   - Input de búsqueda con debounce  
   - Filtrado local o remoto según volumen de datos  
   - Actualización de resultados sin flickering
- WebSockets o polling (OPCIONAL)
   - Si tu aplicación lo justifica, implementa notificaciones en tiempo real  
   - Actualización de datos sin intervención del usuario
- Documentación
   - Patrón de estado elegido y justificación  
   - Estrategias de optimización aplicadas  
   - Comparativa de opciones evaluadas

Criterios y entregables

    Criterios: RA7.e, RA7.h, RA7.i
    Entregables:
        Gestión de estado implementada (servicios/Signals/NgRx)
        Actualización dinámica sin recargas
        Paginación o infinite scroll
        Búsqueda con debounce
        Optimizaciones de rendimiento aplicadas
        Documentación de patrón de estado

Tarea 1: Actualización dinámica sin recargas¶

Para actualizar la UI sin recargar la página en Angular conviene usar servicios con BehaviorSubject/signals y que los componentes se suscriban; así cualquier CRUD dispara cambios reactivos en listas, contadores y vistas sin perder el scroll.^1
Actualizar listas tras crear/editar/eliminar¶

Crea un “store” de dominio que mantenga la lista en memoria y la exponga como observable.

// products.store.ts
@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor(private api: ProductService) {
    this.refresh(); // carga inicial
  }

  refresh() {
    this.api.getAll().subscribe(list => this.productsSubject.next(list));
  }

  add(product: Product) {
    const current = this.productsSubject.value;
    this.productsSubject.next([...current, product]);
  }

  update(product: Product) {
    const current = this.productsSubject.value;
    this.productsSubject.next(
      current.map(p => (p.id === product.id ? product : p))
    );
  }

  remove(id: string) {
    const current = this.productsSubject.value;
    this.productsSubject.next(current.filter(p => p.id !== id));
  }
}

Uso en componentes:

// listado
products$ = this.productsStore.products$;

// después de crear
this.productService.create(dto).subscribe(p => {
  this.productsStore.add(p);
  this.toast.success('Producto creado');
});

La lista se actualiza automáticamente en todos los componentes suscritos sin recarga.^3
Contadores y estadísticas en tiempo real¶

Mantén contadores derivados en el propio store o con map sobre el observable de lista.

// en ProductsStore
totalCount$ = this.products$.pipe(map(list => list.length));
totalPrice$ = this.products$.pipe(
  map(list => list.reduce((acc, p) => acc + p.price, 0))
);

Template:

<p>Total productos: {{ totalCount$ | async }}</p>
<p>Valor total: {{ totalPrice$ | async | currency:'EUR' }}</p>

Cada alta/baja/modificación en el store recalcula automáticamente las estadísticas.^5
Refrescar datos sin perder scroll¶

Mientras no reemplaces todo el árbol de componentes, Angular mantiene el scroll; solo actualiza el contenido de la lista.^6

Recomendaciones:

    Usar *ngFor con trackBy para evitar re-render completo.

<div class="list" #listContainer>
  <div
    *ngFor="let p of (products$ | async); trackBy: trackById"
    class="item"
  >
    {{ p.name }}
  </div>
</div>

trackById(index: number, item: Product) {
  return item.id;
}

    Actualizar la colección de forma inmutable (añadir/quitar/editar en el array, no recrear IDs) como en el store anterior, de modo que Angular preserve los nodos DOM y el scroll.^6
    Si navegas entre rutas y quieres restaurar el scroll, habilita scrollPositionRestoration: 'enabled' al configurar el router:

provideRouter(routes, { scrollPositionRestoration: 'enabled' });

⁂
Tarea 2: Patrón de gestión de estado Elige uno:¶

La opción más alineada con un proyecto docente moderno en Angular es usar services + Signals como patrón principal de estado, apoyándote puntualmente en BehaviorSubject donde ya lo tengas montado.
Servicios con BehaviorSubject¶

    Servicio singleton por feature (ProductsStore, UserStore).
    Expone BehaviorSubject/Observable para listas y estados (loading, error).
    Componentes se suscriben con async pipe.

Ventajas: sencillo, RxJS conocido, ideal para comunicación entre componentes.^1 Inconvenientes: más boilerplate y riesgo de fugas si se abusa de subscribe manual.
Signals de Angular (recomendado)¶

    Servicio de estado basado en signal, computed y effect.
    Los componentes leen con store.products() sin observables ni subscribe.

Ejemplo de store:

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private _products = signal<Product[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  products = this._products.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  constructor(private api: ProductService) {
    this.load();
  }

  load() {
    this._loading.set(true);
    this._error.set(null);

    this.api.getAll().subscribe({
      next: list => {
        this._products.set(list);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Error al cargar productos');
        this._loading.set(false);
      }
    });
  }

  add(p: Product) {
    this._products.update(list => [...list, p]);
  }
}

Uso en componente:

store = inject(ProductsStore);

products = this.store.products;
loading = this.store.loading;
error = this.store.error;

Template:

<div *ngIf="loading()">Cargando...</div>
<div *ngIf="error()">{{ error() }}</div>
<ul>
  <li *ngFor="let p of products()">{{ p.name }}</li>
</ul>

Ventajas: integración nativa con el nuevo motor de Angular, menos RxJS, muy adecuado para FP y proyectos medianos.^2
NgRx (opcional)¶

    Store global, acciones, reducers, efectos.
    Ideal para apps grandes con muchos equipos o requisitos de time-travel debugging.

⁂
Tarea 3: Optimización de rendimiento¶

Para este proyecto puedes documentar un pequeño “checklist” de rendimiento con estos cuatro puntos.
OnPush ChangeDetectionStrategy¶

Activa OnPush en componentes de listas y vistas “puros” para que Angular solo los revise cuando cambian sus inputs, emiten eventos o se actualizan signals.^1

@Component({
  selector: 'app-product-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.component.html'
})
export class ProductListComponent {
  @Input() products: Product[] = [];
}

Recomendaciones:

    Tratar los inputs como inmutables: crear nuevos arrays/objetos en lugar de mutarlos (this.products = [...this.products, nuevo]).^2

TrackBy en ngFor¶

Usa trackBy en listas medianas/grandes para evitar recrear todo el DOM cuando cambia un elemento.^4

<li *ngFor="let p of products; trackBy: trackById">
  {{ p.name }} - {{ p.price | currency }}
</li>

trackById(index: number, item: Product): string {
  return item.id;
}

Así Angular solo actualiza los elementos cuyo id cambia, mejorando el rendimiento y evitando parpadeos.
Unsubscribe de observables¶

    Evita subscribe manual siempre que puedas; usa async pipe.
    Si necesitas suscripción manual, usa patrones como takeUntil o take(1)/first().^6

// Riesgo de leak
this.sub = this.service.get().subscribe();

// Seguro con take(1)
this.service.get().pipe(take(1)).subscribe();

O patrón destroy$:

private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.get()
    .pipe(takeUntil(this.destroy$))
    .subscribe(...);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

Async pipe para suscripciones automáticas¶

AsyncPipe se encarga de suscribirse y desuscribirse al destruir el componente.^8

products$ = this.productsStore.products$;
loading$  = this.productsStore.loading$;

<div *ngIf="loading$ | async" class="loading">Cargando...</div>

<li *ngFor="let p of (products$ | async); trackBy: trackById">
  {{ p.name }}
</li>

⁂
Tarea 4: Paginación y scroll infinito¶

Para esta parte de la documentación puedes describir dos alternativas (paginación clásica e infinite scroll) y cómo se gestionan los loading states al cargar más datos.
Paginación en listados¶

Paginación basada en API con page y pageSize en query params.^1

// product.service.ts
getPage(page: number, pageSize: number) {
  const params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize);

  return this.http.get<PaginatedResponse<Product>>('/api/products', { params });
}

// product-list.component.ts
page = signal(1);
pageSize = 10;
state = signal<{ loading: boolean; data: Product[]; total: number }>({
  loading: false,
  data: [],
  total: 0
});

loadPage(p: number) {
  this.page.set(p);
  this.state.update(s => ({ ...s, loading: true }));

  this.service.getPage(p, this.pageSize).subscribe(res => {
    this.state.set({ loading: false, data: res.items, total: res.total });
  });
}

<ul>
  <li *ngFor="let p of state().data">{{ p.name }}</li>
</ul>

<button (click)="loadPage(page()-1)" [disabled]="page() === 1">Anterior</button>
<button (click)="loadPage(page()+1)"
        [disabled]="page() * pageSize >= state().total">Siguiente</button>

Infinite scroll¶

Uso típico: Intersection Observer para cargar la siguiente página cuando un sentinel entra en viewport.^3^5

// product-infinite.component.ts
state = signal<{ loading: boolean; data: Product[]; page: number; eof: boolean }>({
  loading: false,
  data: [],
  page: 1,
  eof: false
});

@ViewChild('anchor', { static: true }) anchor!: ElementRef<HTMLElement>;
private observer!: IntersectionObserver;

ngOnInit() {
  this.observer = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      this.loadMore();
    }
  });
  this.observer.observe(this.anchor.nativeElement);
  this.loadMore(); // primera página
}

loadMore() {
  const { loading, page, eof } = this.state();
  if (loading || eof) return;

  this.state.update(s => ({ ...s, loading: true }));

  this.service.getPage(page, 20).subscribe(res => {
    this.state.update(s => ({
      loading: false,
      data: [...s.data, ...res.items],
      page: s.page + 1,
      eof: res.items.length === 0
    }));
  });
}

ngOnDestroy() {
  this.observer.disconnect();
}

<div class="list">
  <div *ngFor="let p of state().data">{{ p.name }}</div>

  <div #anchor></div>

  <div *ngIf="state().loading" class="loading">
    Cargando más productos...
  </div>

  <div *ngIf="state().eof && !state().loading" class="end">
    No hay más resultados.
  </div>
</div>

Loading states al cargar más datos¶

    En paginación clásica: loading se activa al cambiar de página y se muestra un spinner sobre la tabla/lista.^6
    En infinite scroll: loading solo afecta al “pie” de la lista (“Cargando más…”) sin bloquear lo ya cargado.
    En ambos casos se recomienda:
        Deshabilitar botones mientras loading es true.
        Controlar fin de datos con un flag (eof) para no seguir llamando a la API.

⁂
Tarea 5: Búsqueda y filtrado en tiempo real¶

La búsqueda en tiempo real se resuelve combinando un input reactivo con debounceTime, filtrado local o remoto según el tamaño de los datos y actualizaciones inmutables para evitar flickering.
Input de búsqueda con debounce¶

// search-bar.component.ts
searchControl = new FormControl('');
search$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged()
);

<input type="search" [formControl]="searchControl" placeholder="Buscar productos...">

El observable search$ se conecta al servicio que filtra (local o remoto).^1^3
Filtrado local o remoto¶

    Local (dataset pequeño, ya cargado en memoria).^4

// products.store.ts
allProducts: Product[] = []; // lista completa
filtered = signal<Product[]>([]);

init() {
  this.api.getAll().subscribe(list => {
    this.allProducts = list;
    this.filtered.set(list);
  });
}

connectSearch(search$: Observable<string>) {
  search$.subscribe(term => {
    const t = term.toLowerCase().trim();
    this.filtered.set(
      this.allProducts.filter(p =>
        p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t)
      )
    );
  });
}

    Remoto (muchos registros o filtros complejos).^6

// product.service.ts
search(term: string) {
  const params = new HttpParams().set('q', term).set('pageSize', 20);
  return this.http.get<Product[]>('/api/products/search', { params });
}

// componente
results$ = this.search$.pipe(
  switchMap(term => this.productService.search(term))
);

Actualización sin flickering¶

Para evitar parpadeos al actualizar resultados:

    Usa *ngFor con trackBy para conservar los elementos DOM estables.^7

<li *ngFor="let p of (results$ | async); trackBy: trackById">
  {{ p.name }}
</li>

trackById(index: number, item: Product) {
  return item.id;
}

    Actualiza arrays de forma inmutable (nuevos arrays, no mutar in-place).
    Muestra estados claros:

<div *ngIf="(results$ | async) as results">
  <p *ngIf="!results.length">Sin resultados para la búsqueda.</p>
  <ul>
    <li *ngFor="let p of results; trackBy: trackById">{{ p.name }}</li>
  </ul>
</div>

<div *ngIf="(searchControl.valueChanges | async) && loading">Buscando...</div>

Este enfoque combina UX fluida (debounce), rendimiento (filtrado adecuado al volumen de datos) y una UI sin saltos visuales.^1^7
⁂
Tarea 6: WebSockets o polling (OPCIONAL)¶

Para este proyecto puedes documentar esta sección como opcional, explicando dos enfoques para datos en “tiempo real”: WebSockets y polling con RxJS.
Notificaciones en tiempo real con WebSockets¶

Para casos donde los cambios son frecuentes (chat, panel en vivo, notificaciones) es preferible un canal WebSocket bidireccional.^1

// core/services/realtime.service.ts
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket$: WebSocketSubject<any> | null = null;

  connect(url = 'wss://api.miapp.com/ws/notifications'): WebSocketSubject<any> {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket(url);
    }
    return this.socket$;
  }

  listen<T>(): Observable<T> {
    return this.connect().asObservable();
  }

  send(message: unknown) {
    this.connect().next(message);
  }

  close() {
    this.socket$?.complete();
    this.socket$ = null;
  }
}

Uso en un componente de notificaciones:

notifications: Notification[] = [];

ngOnInit() {
  this.realtime.listen<Notification>().subscribe(msg => {
    this.notifications = [msg, ...this.notifications];
  });
}

La documentación puede indicar que este mecanismo permite actualizar listas, contadores o toasts en cuanto el backend emite un evento, sin que el usuario toque nada.^3
Polling periódico con RxJS¶

Si la API no expone WebSockets, se puede simular “tiempo real” con polling HTTP controlado.^4

// notifications.service.ts
pollNotifications(intervalMs = 30000): Observable<Notification[]> {
  return timer(0, intervalMs).pipe(
    switchMap(() => this.http.get<Notification[]>('/api/notifications')),
    shareReplay(1) // reutiliza la última respuesta entre suscriptores
  );
}

En el componente:

notifications$ = this.notificationsService.pollNotifications(30000);

Este patrón actualiza datos automáticamente cada X segundos; es más simple de implementar pero menos eficiente que WebSocket para actualizaciones muy frecuentes.^6
Actualización de datos sin intervención del usuario¶

En la documentación, aclara que:

    El estado de la UI (listas, contadores, badges de notificaciones) se alimenta desde un store/servicio que escucha WebSocket o polling y actualiza signals/subjects.
    Los componentes solo se suscriben a ese estado; cuando llega un mensaje o una nueva respuesta del polling, la vista se refresca sola (sin F5, sin recargar ruta).

De este modo cumples el objetivo de “actualización de datos sin intervención del usuario” usando el mecanismo que mejor se adapte al back-end del proyecto.^3

⁂
Tarea 7: Documentación¶

Se documenta un patrón de estado centrado en servicios con Signals de Angular, complementado con RxJS donde aporta valor, y se explican las optimizaciones aplicadas y otras opciones evaluadas.
Patrón de estado elegido y justificación¶

    Patrón: servicios de dominio (store por feature) que exponen estado mediante signal, computed y métodos para mutarlo (set, update).
    Justificación:
        Integración nativa con el nuevo modelo de Angular (change detection más eficiente y código más simple que con Subjects puros).^1
        Curva de aprendizaje adecuada para un proyecto docente, sin la complejidad de NgRx pero manteniendo un flujo de datos unidireccional claro.
        Facilita el encapsulamiento de lógica de negocio y HTTP en servicios, manteniendo componentes de presentación ligeros.

Ejemplo resumido de store:

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private _products = signal<Product[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  products = this._products.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  constructor(private api: ProductService) {
    this.load();
  }

  load() { /* actualiza _products/_loading/_error */ }
  add(product: Product) { this._products.update(l => [...l, product]); }
}

Estrategias de optimización aplicadas¶

En la documentación se detallan las siguientes decisiones de rendimiento:

    ChangeDetectionStrategy.OnPush en componentes de listas y vistas de sólo lectura, para reducir ciclos de detección de cambios y aprovechar las actualizaciones inmutables.^2
    Uso sistemático de trackBy en *ngFor en listados grandes, evitando recrear nodos DOM al refrescar datos (CRUD, filtros, scroll infinito).^4
    Preferencia por async pipe y signals frente a subscribe manual para prevenir memory leaks y simplificar la gestión del ciclo de vida de observables.^6
    Servicios de loading y toasts centralizados para manejar estados de carga y error de forma coherente, sin lógica repetida por componente.^8
    Paginación o infinite scroll en vez de cargar grandes volúmenes de datos de golpe, combinados con debounceTime en búsquedas para reducir llamadas al servidor.^10

Comparativa de opciones evaluadas¶

En la sección de arquitectura se incluye una tabla que explica las alternativas de gestión de estado y por qué se eligió signals:

### Opciones de gestión de estado evaluadas

| Opción                              | Complejidad | Ventajas principales                                     | Inconvenientes / Motivo de descarte           |
|-------------------------------------|------------|---------------------------------------------------------|-----------------------------------------------|
| Servicios + `BehaviorSubject`       | Baja       | Patrón conocido, bueno para comunicación entre comps    | Más RxJS “plumbing”, riesgo de leaks si mal usado.[web:292] |
| Servicios + **Signals (elegida)**   | Media      | Integración nativa Angular, sintaxis simple, OnPush      | Requiere Angular moderno, menos material legacy. |
| NgRx (store global, actions, etc.)  | Alta       | Escalable, tooling avanzado, time-travel                | Sobredimensionado para el tamaño del proyecto.[web:221] |

⁂