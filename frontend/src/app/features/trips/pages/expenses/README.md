# 📊 Página de Gestión de Gastos - Documentación

## 🎯 Resumen de Implementación

Se ha creado la página completa de **Gestión de Gastos** (`/trips/:id/expenses`) con modal para añadir nuevos gastos. La implementación sigue los patrones de Angular 17+ con Signals y ReactiveForms.

---

## 📁 Estructura de Archivos

```
frontend/src/app/features/trips/pages/expenses/
├── expenses.component.ts          # Componente principal
├── expenses.component.html        # Template
├── expenses.component.scss        # Estilos
├── modals/
│   ├── add-expense-modal.component.ts       # Modal para añadir gasto
│   ├── add-expense-modal.component.html     # Template del modal
│   └── add-expense-modal.component.scss     # Estilos del modal
└── README.md                      # Este archivo
```

---

## 🏗️ Arquitectura de Componentes

### **ExpensesComponent** 
**Ubicación:** `expenses.component.ts`

Componente principal de la página de gastos con 4 secciones:

#### A. **Header Resumen**
- **Estilo:** Fondo `var(--principal-color-disabled)` (Rosa claro)
- **Contenido:**
  - Total de gastos calculado con Signal `expenseStore.totalExpenses()`
  - Últimos 3 gastos (con íconos de categoría)
  - Botón "Añadir Gasto" (abre Modal 1)

**Signals usados:**
```typescript
totalExpenses = this.expenseStore.totalBudgetUsed; // Señal computed
recentExpenses = computed(() => {
  return this.expenses()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
});
```

#### B. **Selector de Días**
- **Estilo:** Scroll horizontal, sin scrollbar
- **Tarjetas cuadradas:**
  - Normal: Borde 1px `var(--border-color)`
  - Seleccionado: Borde 3px `var(--quinary-color)`, fondo `var(--quinary-color-disabled)`
  - Datos: Día (número grande), Mes (texto pequeño), Total del día (€)

**Signal de control:**
```typescript
selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
```

#### C. **Lista Detallada**
- **Filtrado:** Muestra solo gastos del día seleccionado
- **Estilo:** Cards rectangulares blancas con sombra suave
- **Datos por gasto:**
  - Icono de categoría (emoji: ✈️ 🏨 🍽️ 🎭 📦)
  - Descripción (negrita)
  - Pagado por (Avatar + Nombre)
  - Monto (€)
  - Botón eliminar (SVG papelera)

**Signal computed:**
```typescript
expensesForSelectedDate = computed(() => {
  return this.expenses()
    .filter(e => e.date === this.selectedDate())
    .sort(...);
});
```

#### D. **Pagos Pendientes (Deudas)**
- **Estilo:** Acordeón desplegable, fondo `var(--principal-color-disabled)`
- **Contenido:** "X debe Y€ a Z" + Botón "Saldar" (borde verde)

**Signal computed:**
```typescript
debts = computed(() => {
  // Calcula deudas a partir de los gastos
  // Retorna array de {debtor, creditor, amount}
});
```

---

### **AddExpenseModalComponent**
**Ubicación:** `modals/add-expense-modal.component.ts`

Modal para crear nuevos gastos con validación reactiva.

#### Estructura del Modal:
- **Header:** Fondo `var(--quinary-color-disabled)`, borde `var(--quinary-color)`
- **Formulario Reactivo (FormGroup):**
  1. **Descripción** (Input Text, requerido, mín 3 caracteres)
  2. **Monto** (Input Number, step 0.01, requerido, mín 0.01)
  3. **Pagado Por** (Select de participantes del viaje)
  4. **Categoría** (Select: TRANSPORT, ACCOMMODATION, FOOD, ACTIVITIES, OTHER)
  5. **Fecha** (Input Date)
  6. **Dividir Entre** (Checkboxes - multi-select de participantes)

#### Validación:
```typescript
expenseForm = this.fb.group({
  description: ['', [Validators.required, Validators.minLength(3)]],
  amount: ['', [Validators.required, Validators.min(0.01)]],
  payerId: ['', Validators.required],
  category: ['FOOD', Validators.required],
  date: [today, Validators.required],
  participants: [[], Validators.required]
});
```

#### Lógica de Envío:
```typescript
onSubmit() {
  // 1. Valida el formulario
  // 2. Crea DTO con datos
  // 3. Llama a expenseStore.addExpense(dto)
  // 4. Cierra modal al completar
}
```

---

## 🎨 Guía de Estilos SCSS

### Variables CSS Utilizadas:
```scss
// Colores
--principal-color           // Color principal del viaje
--principal-color-disabled  // Rosa claro para fondos
--quinary-color             // Azul para acciones/selección
--quinary-color-disabled    // Azul claro para fondos
--quaternary-color          // Rojo para acciones destructivas
--border-color              // Gris para bordes
--text-primary              // Texto oscuro
--text-secondary            // Texto gris claro
--text-tertiary             // Texto muy claro

// Sombras
--shadow-sm                 // Sombra pequeña
--shadow-md                 // Sombra media
--shadow-lg                 // Sombra grande
```

### Breakpoints Responsive:
```scss
@media (max-width: 768px) {
  // Tablets y dispositivos pequeños
  // Se ajusta el layout de los gastos
  // Se reorganiza el selector de fechas
}

@media (max-width: 640px) {
  // Móviles
  // Modal a pantalla completa
  // Botones apilados verticalmente
}
```

---

## 🔌 Integración con Store

### ExpenseStore (Signals)
**Archivo:** `src/app/core/store/expense.store.ts`

**Señales expuestas:**
```typescript
expenses()              // Array de todos los gastos
totalBudgetUsed()       // Total gastado (computed)
totalExpenses()         // Cantidad de gastos (computed)
expensesByCategory()    // Gastos agrupados por categoría (computed)
expensesByPayer()       // Gastos agrupados por quién pagó (computed)
```

**Métodos principales:**
```typescript
loadExpensesByTrip(tripId: string)  // Cargar gastos del viaje
addExpense(dto: CreateExpenseDto)   // Crear gasto (Optimistic UI)
deleteExpense(id: string)           // Eliminar gasto
updateExpense(id, changes)          // Actualizar gasto
```

**Ejemplo de uso en componente:**
```typescript
expenseStore = inject(ExpenseStore);

// Acceso a datos
totalExpenses = this.expenseStore.totalBudgetUsed;

// En template
<p>{{ totalExpenses() | number: '1.2-2' }} €</p>

// Crear gasto
this.expenseStore.addExpense(dto).subscribe({
  next: () => { /* actualizar UI */ },
  error: (err) => { /* manejar error */ }
});
```

---

## 🎯 Flujos de Datos (Data Flow)

### Crear Gasto (Optimistic UI)
```
1. Usuario abre modal
   ↓
2. Completa formulario y envía
   ↓
3. ExpenseStore.addExpense(dto):
   a) Crea gasto temporal con ID "temp-*"
   b) Actualiza estado local inmediatamente (optimistic)
   c) Hace llamada a ExpenseService.addExpense(dto)
   ↓
4. Si API responde exitosamente:
   - Reemplaza gasto temporal con respuesta del servidor
   - totalBudgetUsed() se recalcula automáticamente
   ↓
5. Si API falla:
   - Componente muestra error
   - Store revierte cambio (rollback)
```

### Eliminar Gasto
```
1. Usuario hace click en botón eliminar
   ↓
2. Muestra confirmación
   ↓
3. ExpenseStore.deleteExpense(id):
   a) Guarda gasto para posible rollback
   b) Actualiza estado local (optimistic)
   c) Hace llamada a ExpenseService.deleteExpense(id)
   ↓
4. Si API responde exitosamente:
   - Gasto se mantiene eliminado
   - totalBudgetUsed() se recalcula
   ↓
5. Si API falla:
   - Store revierte eliminar (rollback)
   - Usuario ve mensaje de error
```

### Filtrado por Fecha
```
1. Usuario selecciona una fecha en el selector
   ↓
2. selectedDate signal se actualiza
   ↓
3. expensesForSelectedDate computed signal:
   - Filtra gastos por date === selectedDate()
   - Se recalcula automáticamente
   ↓
4. Template reactúa y muestra gastos del día
```

---

## 📊 Modelos de Datos

### Expense
```typescript
interface Expense {
  id: string;
  tripId: string;
  payerId: string;              // Usuario que pagó
  amount: number;               // Monto en €
  description: string;          // Descripción del gasto
  category: 'ACCOMMODATION' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'OTHER';
  date: string;                 // ISO 8601: "2024-01-21"
  participants: string[];       // IDs de usuarios que comparten el gasto
  createdAt: string;
  updatedAt: string;
}
```

### CreateExpenseDto
```typescript
interface CreateExpenseDto {
  tripId: string;
  payerId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  participants: string[];
}
```

### ExpenseWithDetails
```typescript
interface ExpenseWithDetails extends Expense {
  payer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  participantDetails: {
    id: string;
    name: string;
    email: string;
    shareAmount: number;  // Monto que le corresponde
  }[];
}
```

---

## 🔄 Endpoints API Utilizados

### GET - Obtener gastos
```
GET /api/trips/{tripId}/expenses?page=1&pageSize=20
Response: { items: Expense[], total: number }
```

### POST - Crear gasto
```
POST /api/trips/{tripId}/expenses
Body: CreateExpenseDto
Response: Expense
```

### DELETE - Eliminar gasto
```
DELETE /api/expenses/{expenseId}
Response: void
```

---

## ✨ Características Principales

### 1. **Reactividad en Tiempo Real**
- Signals de Angular 17+ para estado reactivo
- Computed signals que se recalculan automáticamente
- Sin necesidad de async pipe en algunos casos
- Mejor rendimiento que BehaviorSubject

### 2. **Validación Reactiva**
- FormGroup con validadores sincronos
- Errores mostrados en tiempo real
- Estados visuales clara (input-error)
- Mensajes de error específicos

### 3. **Optimistic UI**
- Actualización inmediata de la UI
- Rollback automático si hay error
- Mejor UX (sensación de velocidad)

### 4. **Cálculos Derivados Automáticos**
```typescript
// Cuando se agrega/elimina un gasto:
totalBudgetUsed()           // Se recalcula automáticamente
expensesByCategory()        // Se actualiza
debts computed signal       // Se recalcula deudas
```

### 5. **Diseño Responsive**
- Mobile-first
- Adaptado para tablets y desktop
- Modal a pantalla completa en móvil
- Selector de fechas con scroll horizontal

### 6. **Accesibilidad**
- Uso de `aria-label` en botones
- `aria-pressed` para estado de selección
- Etiquetas `<label>` asociadas a inputs
- Contraste de colores adecuado

---

## 🚀 Cómo Usar

### Acceder a la página
```
http://localhost:4200/trips/:id/expenses
```

### Añadir un gasto
1. Hacer click en botón "+ Añadir Gasto"
2. Completar formulario:
   - Descripción del gasto
   - Monto en €
   - Quién pagó
   - Categoría
   - Fecha
   - Seleccionar quiénes comparten el gasto
3. Hacer click en "Guardar Gasto"

### Eliminar un gasto
1. Hacer click en icono 🗑️ del gasto
2. Confirmar eliminación
3. El gasto se elimina y se recalculan los totales

### Ver deudas
1. Expandir sección "💳 Deudas" (si existen)
2. Ver quién debe dinero a quién
3. (Opcional) Hacer click en "Saldar" para resolver deuda

---

## 🐛 Troubleshooting

### Los gastos no se cargan
- Verificar que el `tripId` es correcto
- Revisar si hay error en la API
- Ver console del navegador para errores

### El modal no se abre
- Verificar que `showAddExpenseModal` signal está en true
- Revisar que el modal está importado en imports

### Los totales no se actualizan
- Los Signals computed debería actualizar automáticamente
- Si no ocurre, revisar que el Store está inyectado correctamente

---

## 📝 Mejoras Futuras

- [ ] Editar gastos existentes
- [ ] Exportar gastos a PDF
- [ ] Gráficos de gastos por categoría
- [ ] Filtro avanzado (rango de fechas, categoría)
- [ ] Soporte para múltiples divisas
- [ ] Recordatorios de deudas pendientes
- [ ] Historial de cambios en gastos

---

## 📄 Licencia

Parte del proyecto MapMyJourney
