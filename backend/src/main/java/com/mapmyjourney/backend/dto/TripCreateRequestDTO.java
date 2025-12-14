package com.mapmyjourney.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para crear un nuevo viaje.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripCreateRequestDTO {

    @NotNull(message = "El título del viaje es obligatorio")
    @Size(min = 1, max = 20, message = "El título debe tener entre 1 y 20 caracteres")
    private String title;

    @NotNull(message = "El destino es obligatorio")
    @Size(min = 1, max = 20, message = "El destino debe tener entre 1 y 20 caracteres")
    private String destination;

    @Size(max = 500)
    private String description;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate startDate;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate endDate;

    private BigDecimal budget;
}
