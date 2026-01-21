package com.mapmyjourney.backend.repository;

import com.mapmyjourney.backend.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Activity.
 * Proporciona métodos de acceso a datos para las actividades.
 */
@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {
    
    /**
     * Obtiene todas las actividades de un viaje, ordenadas por fecha y hora.
     */
    @Query("SELECT a FROM Activity a WHERE a.trip.id = :tripId ORDER BY a.activityDate, a.startTime")
    List<Activity> findByTripId(@Param("tripId") Long tripId);
    
    /**
     * Obtiene las actividades de un viaje para una fecha específica.
     */
    @Query("SELECT a FROM Activity a WHERE a.trip.id = :tripId AND a.activityDate = :date ORDER BY a.orderIndex, a.startTime")
    List<Activity> findByTripIdAndDate(@Param("tripId") Long tripId, @Param("date") LocalDate date);
    
    /**
     * Obtiene las actividades de un viaje para un rango de fechas.
     */
    @Query("SELECT a FROM Activity a WHERE a.trip.id = :tripId AND a.activityDate BETWEEN :startDate AND :endDate ORDER BY a.activityDate, a.startTime")
    List<Activity> findByTripIdAndDateRange(@Param("tripId") Long tripId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    /**
     * Obtiene las actividades de un viaje para un día índice específico.
     */
    @Query("SELECT a FROM Activity a WHERE a.trip.id = :tripId AND a.dayIndex = :dayIndex ORDER BY a.orderIndex, a.startTime")
    List<Activity> findByTripIdAndDayIndex(@Param("tripId") Long tripId, @Param("dayIndex") Integer dayIndex);
    
    /**
     * Verifica si existe una actividad para un viaje y una fecha.
     */
    boolean existsByTripIdAndActivityDate(Long tripId, LocalDate date);
    
    /**
     * Obtiene el máximo orden de una actividad para una fecha.
     */
    @Query("SELECT MAX(a.orderIndex) FROM Activity a WHERE a.trip.id = :tripId AND a.activityDate = :date")
    Integer findMaxOrderByTripIdAndDate(@Param("tripId") Long tripId, @Param("date") LocalDate date);
    
    /**
     * Obtiene una actividad por ID y verifica que pertenece a un viaje específico.
     */
    @Query("SELECT a FROM Activity a WHERE a.id = :id AND a.trip.id = :tripId")
    Optional<Activity> findByIdAndTripId(@Param("id") String id, @Param("tripId") Long tripId);
}
