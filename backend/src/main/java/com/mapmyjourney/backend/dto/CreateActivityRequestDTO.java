package com.mapmyjourney.backend.dto;

import com.mapmyjourney.backend.model.ActivityType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear una nueva actividad.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateActivityRequestDTO {
    
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 1, max = 100, message = "El título debe tener entre 1 y 100 caracteres")
    private String title;
    
    @NotNull(message = "El tipo de actividad es obligatorio")
    private ActivityType type;
    
    @NotBlank(message = "La hora de inicio es obligatoria")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "El formato de hora debe ser HH:mm")
    private String startTime;
    
    @NotNull(message = "La duración es obligatoria")
    @Min(value = 1, message = "La duración debe ser al menos 1 minuto")
    @Max(value = 1440, message = "La duración no puede exceder 1440 minutos")
    private Integer duration;
    
    @Size(max = 255, message = "La ubicación no puede superar 255 caracteres")
    private String location;
    
    @Size(max = 1000, message = "Las notas no pueden superar 1000 caracteres")
    private String notes;
    
    @NotNull(message = "El índice del día es obligatorio")
    @Min(value = 0, message = "El índice del día no puede ser negativo")
    private Integer dayIndex;
    
    @Size(max = 50, message = "La categoría no puede superar 50 caracteres")
    private String category;
}
