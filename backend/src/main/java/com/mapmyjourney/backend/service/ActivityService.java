package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.dto.ActivityDTO;
import com.mapmyjourney.backend.dto.CreateActivityRequestDTO;
import com.mapmyjourney.backend.dto.UpdateActivityRequestDTO;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.model.Activity;
import com.mapmyjourney.backend.model.Trip;
import com.mapmyjourney.backend.repository.ActivityRepository;
import com.mapmyjourney.backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar las operaciones de las actividades.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {
    
    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE;
    
    /**
     * Obtiene todas las actividades de un viaje.
     */
    @Transactional(readOnly = true)
    public List<ActivityDTO> getActivitiesByTrip(Long tripId) {
        log.info("Obteniendo actividades para el viaje: {}", tripId);
        return activityRepository.findByTripId(tripId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene las actividades de un viaje para una fecha específica.
     */
    @Transactional(readOnly = true)
    public List<ActivityDTO> getActivitiesByDate(Long tripId, LocalDate date) {
        log.info("Obteniendo actividades para el viaje {} en la fecha {}", tripId, date);
        return activityRepository.findByTripIdAndDate(tripId, date)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene una actividad específica.
     */
    @Transactional(readOnly = true)
    public ActivityDTO getActivity(Long tripId, String activityId) {
        log.info("Obteniendo actividad {} del viaje {}", activityId, tripId);
        Activity activity = activityRepository.findByIdAndTripId(activityId, tripId)
            .orElseThrow(() -> new ResourceNotFoundException("Actividad no encontrada"));
        return convertToDTO(activity);
    }
    
    /**
     * Crea una nueva actividad en un viaje.
     */
    @Transactional
    public ActivityDTO createActivity(Long tripId, CreateActivityRequestDTO dto) {
        log.info("Creando nueva actividad en el viaje {}", tripId);
        
        Trip trip = tripRepository.findById(tripId)
            .orElseThrow(() -> new ResourceNotFoundException("Viaje no encontrado"));
        
        // Calcular la fecha basada en el índice del día y la fecha de inicio del viaje
        LocalDate activityDate = trip.getStartDate().plusDays(dto.getDayIndex());
        
        Activity activity = Activity.builder()
            .title(dto.getTitle())
            .type(dto.getType())
            .startTime(dto.getStartTime())
            .duration(dto.getDuration())
            .location(dto.getLocation())
            .notes(dto.getNotes())
            .dayIndex(dto.getDayIndex())
            .activityDate(activityDate)
            .category(dto.getCategory())
            .trip(trip)
            .isCompleted(false)
            .orderIndex(0)
            .build();
        
        Activity savedActivity = activityRepository.save(activity);
        log.info("Actividad creada exitosamente: {}", savedActivity.getId());
        
        return convertToDTO(savedActivity);
    }
    
    /**
     * Actualiza una actividad existente.
     */
    @Transactional
    public ActivityDTO updateActivity(Long tripId, String activityId, UpdateActivityRequestDTO dto) {
        log.info("Actualizando actividad {} del viaje {}", activityId, tripId);
        
        Activity activity = activityRepository.findByIdAndTripId(activityId, tripId)
            .orElseThrow(() -> new ResourceNotFoundException("Actividad no encontrada"));
        
        if (dto.getTitle() != null) {
            activity.setTitle(dto.getTitle());
        }
        if (dto.getType() != null) {
            activity.setType(dto.getType());
        }
        if (dto.getStartTime() != null) {
            activity.setStartTime(dto.getStartTime());
        }
        if (dto.getDuration() != null) {
            activity.setDuration(dto.getDuration());
        }
        if (dto.getLocation() != null) {
            activity.setLocation(dto.getLocation());
        }
        if (dto.getNotes() != null) {
            activity.setNotes(dto.getNotes());
        }
        if (dto.getIsCompleted() != null) {
            activity.setIsCompleted(dto.getIsCompleted());
        }
        if (dto.getDayIndex() != null) {
            activity.setDayIndex(dto.getDayIndex());
            // Recalcular la fecha si cambia el índice del día
            Trip trip = activity.getTrip();
            LocalDate newDate = trip.getStartDate().plusDays(dto.getDayIndex());
            activity.setActivityDate(newDate);
        }
        if (dto.getOrderIndex() != null) {
            activity.setOrderIndex(dto.getOrderIndex());
        }
        if (dto.getCategory() != null) {
            activity.setCategory(dto.getCategory());
        }
        
        Activity updatedActivity = activityRepository.save(activity);
        log.info("Actividad actualizada exitosamente");
        
        return convertToDTO(updatedActivity);
    }
    
    /**
     * Elimina una actividad.
     */
    @Transactional
    public void deleteActivity(Long tripId, String activityId) {
        log.info("Eliminando actividad {} del viaje {}", activityId, tripId);
        
        Activity activity = activityRepository.findByIdAndTripId(activityId, tripId)
            .orElseThrow(() -> new ResourceNotFoundException("Actividad no encontrada"));
        
        activityRepository.delete(activity);
        log.info("Actividad eliminada exitosamente");
    }
    
    /**
     * Reordena las actividades de una fecha.
     */
    @Transactional
    public void reorderActivities(Long tripId, LocalDate date, List<String> activityIds) {
        log.info("Reordenando actividades para el viaje {} en la fecha {}", tripId, date);
        
        List<Activity> activities = activityRepository.findByTripIdAndDate(tripId, date);
        
        for (int i = 0; i < activityIds.size(); i++) {
            String activityId = activityIds.get(i);
            Activity activity = activities.stream()
                .filter(a -> a.getId().equals(activityId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Actividad no encontrada: " + activityId));
            activity.setOrderIndex(i);
        }
        
        activityRepository.saveAll(activities);
        log.info("Actividades reordenadas exitosamente");
    }
    
    /**
     * Convierte una entidad Activity a DTO.
     */
    private ActivityDTO convertToDTO(Activity activity) {
        return ActivityDTO.builder()
            .id(activity.getId())
            .title(activity.getTitle())
            .type(activity.getType())
            .startTime(activity.getStartTime())
            .duration(activity.getDuration())
            .location(activity.getLocation())
            .notes(activity.getNotes())
            .isCompleted(activity.getIsCompleted())
            .dayIndex(activity.getDayIndex())
            .date(activity.getActivityDate())
            .orderIndex(activity.getOrderIndex())
            .category(activity.getCategory())
            .createdAt(activity.getCreatedAt())
            .updatedAt(activity.getUpdatedAt())
            .build();
    }
}
