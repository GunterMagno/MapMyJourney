package com.mapmyjourney.backend.controller;

import com.mapmyjourney.backend.dto.TripCreateRequestDTO;
import com.mapmyjourney.backend.dto.TripDTO;
import com.mapmyjourney.backend.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

/**
 * Controlador REST para gestionar viajes.
 */
@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
@Tag(name = "Trips", description = "API de gestión de viajes - Crear, editar, unirse a viajes")
public class TripController {

    private final TripService tripService;

    /**
     * 1. Crea un nuevo viaje.
     * POST /api/trips
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Crear nuevo viaje", 
               description = "Crea un nuevo viaje colaborativo. El usuario autenticado será el OWNER")
    @ApiResponse(responseCode = "201", description = "Viaje creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos (fechas, presupuesto, etc)")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    public ResponseEntity<TripDTO> createTrip(@Valid @RequestBody(description = "Datos del viaje a crear") TripCreateRequestDTO request) {
        Long userId = extractUserIdFromContext();
        TripDTO createdTrip = tripService.createTrip(request, userId);
        return ResponseEntity.status(201).body(createdTrip);
    }

    /**
     * 2. Obtiene un viaje por ID.
     * GET /api/trips/{tripId}
     */
    @GetMapping("/{tripId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Obtener viaje por ID", 
               description = "Recupera los detalles completos de un viaje específico")
    @ApiResponse(responseCode = "200", description = "Viaje encontrado con sus datos")
    @ApiResponse(responseCode = "404", description = "Viaje no encontrado")
    public ResponseEntity<TripDTO> getTripById(
            @Parameter(description = "ID único del viaje", example = "1")
            @PathVariable Long tripId) {
        TripDTO trip = tripService.getTripById(tripId);
        return ResponseEntity.ok(trip);
    }

    /**
     * 3. Obtiene todos los viajes del usuario logueado (con paginación).
     * GET /api/trips/my-trips?page=0&amp;size=10&amp;sort=createdAt,desc
     */
    @GetMapping("/my-trips")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Obtener mis viajes", 
               description = "Lista todos los viajes del usuario autenticado con paginación")
    @ApiResponse(responseCode = "200", description = "Lista de viajes del usuario")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    public ResponseEntity<List<TripDTO>> getMyTrips(
            @Parameter(description = "Número de página (comienza en 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad de registros por página", example = "10")
            @RequestParam(defaultValue = "10") int size) {
        Long userId = extractUserIdFromContext();
        List<TripDTO> trips = tripService.getUserTrips(userId);
        return ResponseEntity.ok(trips);
    }

    /**
     * 4. Obtiene un viaje por código (para invitaciones).
     * GET /api/trips/code/{tripCode}
     */
    @GetMapping("/code/{tripCode}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Obtener viaje por código", 
               description = "Busca un viaje usando su código de invitación (8 caracteres)")
    @ApiResponse(responseCode = "200", description = "Viaje encontrado")
    @ApiResponse(responseCode = "404", description = "Viaje no encontrado con ese código")
    public ResponseEntity<TripDTO> getTripByCode(
            @Parameter(description = "Código único del viaje", example = "ABC123XY")
            @PathVariable String tripCode) {
        TripDTO trip = tripService.getTripByCode(tripCode);
        return ResponseEntity.ok(trip);
    }

    /**
     * 5. Actualiza un viaje.
     * PUT /api/trips/{tripId}
     * Solo el OWNER puede actualizar.
     */
    @PutMapping("/{tripId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Actualizar viaje", 
               description = "Actualiza los datos del viaje (solo el OWNER puede hacerlo)")
    @ApiResponse(responseCode = "200", description = "Viaje actualizado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Viaje no encontrado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos (solo OWNER puede editar)")
    public ResponseEntity<TripDTO> updateTrip(
            @Parameter(description = "ID del viaje a actualizar", example = "1")
            @PathVariable Long tripId, 
            @Valid @RequestBody(description = "Nuevos datos del viaje") TripCreateRequestDTO request) {
        Long userId = extractUserIdFromContext();
        TripDTO updatedTrip = tripService.updateTrip(tripId, request, userId);
        return ResponseEntity.ok(updatedTrip);
    }

    /**
     * 6. Elimina un viaje.
     * DELETE /api/trips/{tripId}
     * Solo el OWNER puede eliminar.
     */
    @DeleteMapping("/{tripId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Eliminar viaje", 
               description = "Elimina permanentemente un viaje (solo el OWNER puede hacerlo)")
    @ApiResponse(responseCode = "204", description = "Viaje eliminado exitosamente")
    @ApiResponse(responseCode = "404", description = "Viaje no encontrado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos (solo OWNER puede eliminar)")
    public ResponseEntity<Void> deleteTrip(
            @Parameter(description = "ID del viaje a eliminar", example = "1")
            @PathVariable Long tripId) {
        Long userId = extractUserIdFromContext();
        tripService.deleteTrip(tripId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Extrae el userId del contexto de seguridad de Spring Security.
     * El nombre de usuario en el token JWT es el email del usuario.
     */
    private Long extractUserIdFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // El nombre de usuario es el email, necesitas obtener el ID desde el servicio
        String email = authentication.getName();
        // TODO: Implementar método que obtenga userId a partir del email
        // Por ahora retorna 1L como placeholder, esto debe venir del UserService
        return 1L;
    }
}
