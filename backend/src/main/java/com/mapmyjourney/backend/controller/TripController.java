package com.mapmyjourney.backend.controller;

import com.mapmyjourney.backend.dto.TripCreateRequestDTO;
import com.mapmyjourney.backend.dto.TripDTO;
import com.mapmyjourney.backend.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestionar viajes.
 */
@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    /**
     * 1. Crea un nuevo viaje.
     * POST /api/trips
     */
    @PostMapping
    public ResponseEntity<TripDTO> createTrip(@RequestBody TripCreateRequestDTO request) {
        // TODO: Obtener userId del contexto de seguridad
        Long userId = 1L; // Placeholder
        TripDTO createdTrip = tripService.createTrip(request, userId);
        return ResponseEntity.status(201).body(createdTrip);
    }

    /**
     * 2. Obtiene un viaje por ID.
     * GET /api/trips/{tripId}
     */
    @GetMapping("/{tripId}")
    public ResponseEntity<TripDTO> getTripById(@PathVariable Long tripId) {
        TripDTO trip = tripService.getTripById(tripId);
        return ResponseEntity.ok(trip);
    }

    /**
     * 3. Obtiene todos los viajes del usuario logueado.
     * GET /api/trips/my-trips
     */
    @GetMapping("/my-trips")
    public ResponseEntity<List<TripDTO>> getMyTrips() {
        // TODO: Obtener userId del contexto de seguridad
        Long userId = 1L; // Placeholder
        List<TripDTO> trips = tripService.getUserTrips(userId);
        return ResponseEntity.ok(trips);
    }

    /**
     * 4. Obtiene un viaje por código (para invitaciones).
     * GET /api/trips/code/{tripCode}
     */
    @GetMapping("/code/{tripCode}")
    public ResponseEntity<TripDTO> getTripByCode(@PathVariable String tripCode) {
        TripDTO trip = tripService.getTripByCode(tripCode);
        return ResponseEntity.ok(trip);
    }

    /**
     * 5. Actualiza un viaje.
     * PUT /api/trips/{tripId}
     * Solo el OWNER puede actualizar.
     */
    @PutMapping("/{tripId}")
    public ResponseEntity<TripDTO> updateTrip(@PathVariable Long tripId, @RequestBody TripCreateRequestDTO request) {
        // TODO: Obtener userId del contexto de seguridad
        Long userId = 1L; // Placeholder
        TripDTO updatedTrip = tripService.updateTrip(tripId, request, userId);
        return ResponseEntity.ok(updatedTrip);
    }

    /**
     * 6. Elimina un viaje.
     * DELETE /api/trips/{tripId}
     * Solo el OWNER puede eliminar.
     */
    @DeleteMapping("/{tripId}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long tripId) {
        // TODO: Obtener userId del contexto de seguridad
        Long userId = 1L; // Placeholder
        tripService.deleteTrip(tripId, userId);
        return ResponseEntity.noContent().build();
    }
}

