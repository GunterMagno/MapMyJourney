package com.mapmyjourney.backend.controller;

import com.mapmyjourney.backend.dto.ActivityDTO;
import com.mapmyjourney.backend.dto.CreateActivityRequestDTO;
import com.mapmyjourney.backend.dto.UpdateActivityRequestDTO;
import com.mapmyjourney.backend.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controlador REST para gestionar las actividades del itinerario de un viaje.
 * 
 * Endpoints:
 * GET /api/trips/{tripId}/activities - Obtener todas las actividades de un viaje
 * GET /api/trips/{tripId}/activities/{activityId} - Obtener una actividad específica
 * POST /api/trips/{tripId}/activities - Crear una nueva actividad
 * PUT /api/trips/{tripId}/activities/{activityId} - Actualizar una actividad
 * DELETE /api/trips/{tripId}/activities/{activityId} - Eliminar una actividad
 */
@RestController
@RequestMapping("/api/trips/{tripId}/activities")
@RequiredArgsConstructor
@Slf4j
public class ActivityController {
    
    private final ActivityService activityService;
    
    /**
     * Obtiene todas las actividades de un viaje.
     * 
     * @param tripId ID del viaje
     * @return Lista de actividades
     */
    @GetMapping
    public ResponseEntity<List<ActivityDTO>> getActivitiesByTrip(@PathVariable Long tripId) {
        log.info("GET /api/trips/{}/activities", tripId);
        List<ActivityDTO> activities = activityService.getActivitiesByTrip(tripId);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Obtiene las actividades de un viaje para una fecha específica.
     * 
     * @param tripId ID del viaje
     * @param date Fecha en formato ISO (YYYY-MM-DD)
     * @return Lista de actividades para esa fecha
     */
    @GetMapping("/date")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByDate(
            @PathVariable Long tripId,
            @RequestParam LocalDate date) {
        log.info("GET /api/trips/{}/activities/date?date={}", tripId, date);
        List<ActivityDTO> activities = activityService.getActivitiesByDate(tripId, date);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Obtiene una actividad específica.
     * 
     * @param tripId ID del viaje
     * @param activityId ID de la actividad
     * @return Datos de la actividad
     */
    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityDTO> getActivity(
            @PathVariable Long tripId,
            @PathVariable String activityId) {
        log.info("GET /api/trips/{}/activities/{}", tripId, activityId);
        ActivityDTO activity = activityService.getActivity(tripId, activityId);
        return ResponseEntity.ok(activity);
    }
    
    /**
     * Crea una nueva actividad en un viaje.
     * 
     * @param tripId ID del viaje
     * @param dto Datos de la nueva actividad
     * @return Actividad creada
     */
    @PostMapping
    public ResponseEntity<ActivityDTO> createActivity(
            @PathVariable Long tripId,
            @Valid @RequestBody CreateActivityRequestDTO dto) {
        log.info("POST /api/trips/{}/activities", tripId);
        ActivityDTO activity = activityService.createActivity(tripId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(activity);
    }
    
    /**
     * Actualiza una actividad existente.
     * 
     * @param tripId ID del viaje
     * @param activityId ID de la actividad a actualizar
     * @param dto Datos a actualizar
     * @return Actividad actualizada
     */
    @PutMapping("/{activityId}")
    public ResponseEntity<ActivityDTO> updateActivity(
            @PathVariable Long tripId,
            @PathVariable String activityId,
            @Valid @RequestBody UpdateActivityRequestDTO dto) {
        log.info("PUT /api/trips/{}/activities/{}", tripId, activityId);
        ActivityDTO activity = activityService.updateActivity(tripId, activityId, dto);
        return ResponseEntity.ok(activity);
    }
    
    /**
     * Elimina una actividad.
     * 
     * @param tripId ID del viaje
     * @param activityId ID de la actividad a eliminar
     * @return Respuesta sin contenido
     */
    @DeleteMapping("/{activityId}")
    public ResponseEntity<Void> deleteActivity(
            @PathVariable Long tripId,
            @PathVariable String activityId) {
        log.info("DELETE /api/trips/{}/activities/{}", tripId, activityId);
        activityService.deleteActivity(tripId, activityId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Reordena las actividades de una fecha específica.
     * 
     * @param tripId ID del viaje
     * @param date Fecha en formato ISO (YYYY-MM-DD)
     * @param activityIds Lista de IDs de actividades en el nuevo orden
     * @return Respuesta sin contenido
     */
    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderActivities(
            @PathVariable Long tripId,
            @RequestParam LocalDate date,
            @RequestBody List<String> activityIds) {
        log.info("PUT /api/trips/{}/activities/reorder?date={}", tripId, date);
        activityService.reorderActivities(tripId, date, activityIds);
        return ResponseEntity.noContent().build();
    }
}
