package com.mapmyjourney.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad que representa una actividad en un itinerario de viaje.
 * Cada actividad pertenece a un viaje y tiene una fecha específica.
 */
@Entity
@Table(name = "activities", indexes = {
    @Index(name = "idx_activity_trip", columnList = "trip_id"),
    @Index(name = "idx_activity_date", columnList = "activity_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "El título de la actividad no puede estar vacío")
    @Size(min = 1, max = 100, message = "El título debe tener entre 1 y 100 caracteres")
    @Column(nullable = false)
    private String title;

    @NotNull(message = "El tipo de actividad es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;

    @NotBlank(message = "La hora de inicio es obligatoria")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "El formato de hora debe ser HH:mm")
    @Column(nullable = false)
    private String startTime;

    @NotNull(message = "La duración es obligatoria")
    @Min(value = 1, message = "La duración debe ser al menos 1 minuto")
    @Max(value = 1440, message = "La duración no puede exceder 1440 minutos")
    @Column(nullable = false)
    private Integer duration;

    @Size(max = 255, message = "La ubicación no puede superar 255 caracteres")
    private String location;

    @Size(max = 1000, message = "Las notas no pueden superar 1000 caracteres")
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isCompleted = false;

    @NotNull(message = "El índice del día es obligatorio")
    @Min(value = 0, message = "El índice del día no puede ser negativo")
    @Column(nullable = false)
    private Integer dayIndex;

    @NotNull(message = "La fecha es obligatoria")
    @Column(nullable = false)
    private LocalDate activityDate;

    @Builder.Default
    @Min(value = 0, message = "El orden no puede ser negativo")
    @Column(nullable = false)
    private Integer orderIndex = 0;

    @Size(max = 50, message = "La categoría no puede superar 50 caracteres")
    private String category;

    @NotNull(message = "El viaje es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
