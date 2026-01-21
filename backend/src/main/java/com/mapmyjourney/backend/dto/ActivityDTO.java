package com.mapmyjourney.backend.dto;

import com.mapmyjourney.backend.model.ActivityType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para la entidad Activity.
 * Se utiliza tanto para respuestas como para operaciones de lectura.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityDTO {
    
    private String id;
    private String title;
    private ActivityType type;
    private String startTime;
    private Integer duration;
    private String location;
    private String notes;
    
    @JsonProperty("isCompleted")
    private Boolean isCompleted;
    
    private Integer dayIndex;
    private LocalDate date;
    
    @JsonProperty("order")
    private Integer orderIndex;
    
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
