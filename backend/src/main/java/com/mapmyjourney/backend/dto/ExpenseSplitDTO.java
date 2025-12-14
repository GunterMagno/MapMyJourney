package com.mapmyjourney.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para una división de gasto.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseSplitDTO {

    private Long id;

    private UserDTO participant;

    @NotNull(message = "El monto de la división es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    private BigDecimal percentage;

    private boolean paid;
}
