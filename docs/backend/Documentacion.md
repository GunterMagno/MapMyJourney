# MapMyJourney - Documentación Backend

## Diagrama E/R (Entidad-Relación)

Ver: [`Modelo de datos.txt`]()

---

## Entidades

### 1. User
**Ubicación**: `backend/src/main/java/com/mapmyjourney/backend/model/User.java`

Entidad que representa un usuario del sistema. Contiene información de autenticación y perfil.

**Campos principales**:
- id: Identificador único
- name: Nombre de usuario (2-20 caracteres)
- email: Email único para login
- passwordHash: Contraseña hasheada (mínimo 8 caracteres)
- role: Rol global (ADMIN, USER)
- profilePicture: URL de la foto de perfil
- createdAt/updatedAt: Timestamps de auditoría

**Relaciones**:
- OneToMany con TripMember (usuario en múltiples viajes)

---

### 2. Trip
**Ubicación**: `backend/src/main/java/com/mapmyjourney/backend/model/Trip.java`

Entidad que representa un viaje colaborativo. Actúa como contenedor principal de toda la información del viaje.

**Campos principales**:
- id: Identificador único
- title: Nombre del viaje (1-20 caracteres)
- destination: Destino (1-20 caracteres)
- description: Descripción detallada (máximo 500 caracteres)
- startDate/endDate: Fechas del viaje (endDate >= startDate)
- budget: Presupuesto total
- tripCode: Código único para invitaciones (8 caracteres)
- createdAt/updatedAt: Timestamps de auditoría

**Relaciones**:
- OneToMany con TripMember (múltiples miembros)
- OneToMany con Expense (múltiples gastos)

---

### 3. TripMember
**Ubicación**: `backend/src/main/java/com/mapmyjourney/backend/model/TripMember.java`

Tabla de unión que define la relación Many-to-Many entre usuarios y viajes, con roles específicos por viaje.

**Campos principales**:
- id: Identificador único
- user_id: Referencia a usuario
- trip_id: Referencia a viaje
- role: Rol del usuario en el viaje (OWNER, EDITOR, VIEWER)
- joinedAt: Timestamp de adhesión

**Características**:
- Restricción UNIQUE(user_id, trip_id): Un usuario no puede ser miembro dos veces del mismo viaje
- Permite diferentes roles para un usuario en cada viaje

---

### 4. Expense
**Ubicación**: `backend/src/main/java/com/mapmyjourney/backend/model/Expense.java`

Entidad que representa un gasto realizado durante un viaje, pagado por un usuario y dividido entre múltiples participantes.

**Campos principales**:
- id: Identificador único
- trip_id: Referencia al viaje
- paid_by_user_id: Usuario que pagó el gasto
- description: Descripción (1-150 caracteres)
- amount: Monto total (> 0.01)
- expenseDate: Fecha del gasto
- splitType: Tipo de división (EQUAL, PERCENT, CUSTOM)
- receiptUrl: URL del recibo/ticket
- createdAt/updatedAt: Timestamps de auditoría

**Relaciones**:
- ManyToOne con Trip
- ManyToOne con User (paidBy)
- OneToMany con ExpenseSplit

---

### 5. ExpenseSplit
**Ubicación**: `backend/src/main/java/com/mapmyjourney/backend/model/ExpenseSplit.java`

Entidad que detalla la división de un gasto entre los participantes. Cada gasto tiene múltiples splits, uno por cada participante.

**Campos principales**:
- id: Identificador único
- expense_id: Referencia al gasto
- participant_user_id: Usuario que participa en el gasto
- amount: Monto que debe pagar este usuario
- percentage: Porcentaje (si aplica)
- paid: Flag indicando si el usuario ya liquidó
- createdAt: Timestamp de creación

**Relaciones**:
- ManyToOne con Expense
- ManyToOne con User (participant)

---

## DTOs Iniciales

**Ubicación**: `backend/src/main/java/com/mapmyjourney/backend/dto/`

### UserDTO
Representa la información pública de un usuario (sin incluir passwordHash).
- Contiene: id, name, email, role, profilePicture, createdAt
- Usado en: respuestas de API donde necesitamos datos del usuario

### UserCreateRequestDTO
DTO para solicitudes de creación/registro de usuarios.
- Campos: name, email, password
- Validaciones: name (2-20 caracteres), email válido, password (mínimo 8 caracteres)

### TripDTO
Representa la información completa de un viaje.
- Contiene: id, title, destination, description, startDate, endDate, budget, tripCode, createdAt
- Usado en: respuestas GET de viajes

### TripCreateRequestDTO
DTO para solicitudes de creación de viajes.
- Campos: title, destination, description, startDate, endDate, budget
- Validaciones: dates válidas (endDate >= startDate), presupuesto > 0 si está especificado

### TripMemberDTO
Representa la membresía de un usuario en un viaje.
- Contiene: id, user (UserDTO), tripId, role, joinedAt
- Usado en: respuestas de miembros del viaje

### ExpenseDTO
Representa la información completa de un gasto.
- Contiene: id, tripId, paidBy (UserDTO), description, amount, expenseDate, splitType, receiptUrl, createdAt
- Usado en: respuestas GET de gastos

### ExpenseCreateRequestDTO
DTO para solicitudes de creación de gastos.
- Campos: tripId, description, amount, expenseDate, splitType
- Validaciones: amount > 0.01, description (1-150 caracteres)

### ExpenseSplitDTO
Representa la división de un gasto para un participante.
- Contiene: id, expenseId, participant (UserDTO), amount, percentage, paid
- Usado en: respuestas de detalles de gastos

---

## Repositorios con Consultas Personalizadas

**Ubicación**: `backend/src/main/java/com/mapmyjourney/backend/repository/`

### UserRepository
**Métodos**:
- `findByEmail(String email): Optional<User>`
  - Busca un usuario por su email (login)
  
- `existsByEmail(String email): boolean`
  - Verifica si existe un usuario con ese email (evita duplicados)

---

### TripRepository
**Métodos**:
- `findByUserId(Long userId): List<Trip>`
  - Obtiene todos los viajes de un usuario específico
  - Usa @Query personalizado con JOIN a trip_members
  
- `findByTripCode(String tripCode): Optional<Trip>`
  - Busca un viaje por su código de invitación

---

### TripMemberRepository
**Métodos**:
- `findByTripIdAndUserId(Long tripId, Long userId): Optional<TripMember>`
  - Obtiene el rol específico de un usuario en un viaje
  
- `findAllByTripId(Long tripId): List<TripMember>`
  - Obtiene todos los miembros de un viaje
  
- `findByTripIdAndRole(Long tripId, TripMemberRole role): List<TripMember>`
  - Obtiene todos los miembros con un rol específico en un viaje

---

### ExpenseRepository
**Métodos**:
- `findByTripId(Long tripId): List<Expense>`
  - Obtiene todos los gastos de un viaje
  
- `findByPaidById(Long userId): List<Expense>`
  - Obtiene todos los gastos pagados por un usuario
  
- `findByTripAndDateRange(Long tripId, LocalDate startDate, LocalDate endDate): List<Expense>`
  - Obtiene gastos de un viaje en un rango de fechas específico
  - Usa @Query personalizado con filtros de fecha

---

### ExpenseSplitRepository
**Métodos**:
- `findByExpenseId(Long expenseId): List<ExpenseSplit>`
  - Obtiene todas las divisiones de un gasto específico
  
- `findByParticipantUserIdAndPaidFalse(Long userId): List<ExpenseSplit>`
  - Obtiene todas las deudas pendientes de un usuario
  
- `findByParticipantUserIdAndPaidTrue(Long userId): List<ExpenseSplit>`
  - Obtiene todas las deudas pagadas por un usuario
  
- `calculateUserDebtInTrip(Long userId, Long tripId): BigDecimal`
  - Calcula la deuda total de un usuario en un viaje específico
  - Usa @Query personalizado con SUM y agregación


## Flujo Completo: Registrar un usuario
```
  1. Cliente HTTP
     POST /api/users/register
     { "name": "Juan", "email": "juan@example.com", "password": "1234" }
     ↓
  2. Controlador
     @PostMapping("/register")
     public ResponseEntity<UserDTO> register(@RequestBody UserCreateRequestDTO req) {
         return userService.registerUser(req);
     }
     ↓
  3. Servicio (UserService)
     @Transactional
     public UserDTO registerUser(UserCreateRequestDTO request) {
         // Validación
         if (userRepository.existsByEmail(request.getEmail())) {
             throw new DuplicateResourceException(...);
         }
         
         // Creación
         User user = new User();
         user.setName(request.getName());
         // ...
         
         // Persistencia
         User saved = userRepository.save(user);
         
         // Mapeo a DTO
         return mapToDTO(saved);
     }
     ↓
  4. Repositorio
     userRepository.save(user);
     // Ejecuta: INSERT INTO users (name, email, password) VALUES (...)
     ↓
  5. Base de Datos
     Inserta el registro
     ↓
  6. Respuesta al Cliente
     200 OK
     { "id": 1, "name": "Juan", "email": "juan@example.com", "role": "USER" }

```

# Importante (notas)
Servicios = lógica de negocio
@Transactional = garantiza que todo se guarda o nada
@Transactional(readOnly=true) = optimización para lecturas
DTOs = protegen tus datos internos
Excepciones = comunican errores de negocio

---

## Separación de Responsabilidades en Servicios

### ¿Por qué separar TripService de TripMemberService?

**TripService** gestiona el viaje en sí (datos):
- Crear/actualizar/eliminar viajes
- Modificar título, destino, fechas, presupuesto

**TripMemberService** gestiona el acceso y permisos:
- Agregar/remover usuarios
- Cambiar roles (OWNER, EDITOR, VIEWER)
- Verificar quién puede hacer qué

Un viaje puede existir sin miembros, y los permisos son completamente independientes de los datos del viaje. **Responsabilidades diferentes = Servicios separados**.

### ¿Por qué separar ExpenseService de ExpenseSplitService?

**ExpenseService** gestiona el gasto total:
- Crear/actualizar/eliminar gastos
- Gasto = 100€ pagado por Juan en restaurante

**ExpenseSplitService** gestiona cómo se divide:
- Crear divisiones (Juan debe 25€, María debe 25€, etc.)
- Marcar pagos individuales
- Calcular deudas pendientes

Cada gasto requiere múltiples divisiones, y cada división tiene su propio ciclo de vida. **Contextos diferentes = Servicios separados**.

### Beneficios

- **Mantenibilidad** -> Cada servicio tiene una única responsabilidad  
- **Reutilización** -> Un servicio puede usarse desde múltiples controladores  
- **Testing** -> Fácil hacer pruebas unitarias independientes  
- **Escalabilidad** -> Puedes cambiar un servicio sin afectar los otros
