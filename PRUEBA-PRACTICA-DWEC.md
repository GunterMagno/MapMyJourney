# Documentación de Componentes - Trip Notes

## Jerarquía de Componentes

```
NotesComponent (Página)
└── NoteCardComponent (Componente reutilizable)
```

### 1. **NotesComponent** (Página)
- **Ubicación**: `frontend/src/app/components/pages/trip-notes/trip-notes.component.ts`
- **Selector**: `app-trip-notes`
- **Función**: Página principal que muestra la lista de notas de un viaje
- **Carga**: Lazy-loading (se carga bajo demanda mediante `loadComponent` en las rutas)
- **Ruta**: `/trips/:id/notas`
- **Dependencias**: 
  - `TripNotesService` (para obtener datos)
  - `NoteCardComponent` (para mostrar cada nota)

### 2. **NoteCardComponent** (Componente compartido)
- **Ubicación**: `frontend/src/app/components/shared/note-card/note-card.ts`
- **Selector**: `app-note-card`
- **Función**: Tarjeta reutilizable para mostrar el contenido de una nota
- **Inputs**:
  - `content`: Contenido de la nota
  - `createdAt`: Fecha de creación
  - `variant`: Estilo ('vertical' | 'horizontal')

### 3. **TripNotesService** (Servicio)
- **Ubicación**: `frontend/src/app/features/trips/services/tripNotes.service.ts`
- **Función**: Gestiona las peticiones HTTP para las notas de viaje
- **Métodos**:
  - `getNotes(tripId)`: Obtiene las notas de un viaje
  - `createNote(tripId, dto)`: Crea una nueva nota
- **Signals**:
  - `notes`: Contenido de las notas
  - `isLoading`: Estado de carga
  - `error`: Mensajes de error

## Instrucciones de Ejecución

### Requisitos
- Node.js y npm instalados
- Docker instalado

### Pasos para ejecutar

**Iniciar docker compose que ejecuta los tres servicios**:
```bash
docker compose up -d 
```