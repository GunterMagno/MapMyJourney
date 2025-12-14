package com.mapmyjourney.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidad que representa un viaje colaborativo.
 * Actúa como contenedor principal de toda la información del viaje:
 * itinerario, gastos, miembros, chat, documentos y votaciones.
 */
@Entity
@Table(name = "trips", indexes = {
    @Index(name = "idx_trip_code", columnList = "trip_code", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título del viaje no puede estar vacío")
    @Size(min = 1, max = 20, message = "El título debe tener entre 1 y 20 caracteres")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "El destino no puede estar vacío")
    @Size(min = 1, max = 20, message = "El destino debe tener entre 1 y 20 caracteres")
    @Column(nullable = false)
    private String destination;

    @Size(max = 500, message = "La descripción no puede superar 500 caracteres")
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @Column(nullable = false)
    private LocalDate startDate;

    @NotNull(message = "La fecha de fin es obligatoria")
    @Column(nullable = false)
    private LocalDate endDate;

    @DecimalMin(value = "0.0", inclusive = false, message = "El presupuesto debe ser mayor a 0")
    @Column(precision = 10, scale = 2)
    private BigDecimal budget;

    /**
     * Código único para invitar a otros usuarios al viaje.
     * Generado automáticamente.
     */
    @Column(nullable = false, unique = true, length = 8)
    private String tripCode;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Builder.Default
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TripMember> members = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Expense> expenses = new HashSet<>();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Valida que la fecha de fin sea posterior a la de inicio.
     */
    @PrePersist
    @PreUpdate
    protected void validateDates() {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la de inicio");
        }
    }
}
