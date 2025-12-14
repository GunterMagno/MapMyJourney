package com.mapmyjourney.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.mapmyjourney.backend.model.enums.ExpenseSplitType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO para crear un nuevo gasto.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseCreateRequestDTO {

    @NotBlank(message = "La descripción del gasto no puede estar vacía")
    @Size(min = 1, max = 150)
    private String description;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    @NotNull(message = "La fecha del gasto es obligatoria")
    private LocalDate expenseDate;

    @NotNull(message = "El tipo de división es obligatorio")
    private ExpenseSplitType splitType;

    /**
     * URL del recibo o comprobante del gasto.
     */
    private String receiptUrl;

    /**
     * IDs de usuarios entre los que se divide el gasto.
     * Si es división equitativa, se distribuye por igual entre todos.
     * Si es manual, se proporcionan los montos específicos en splitAmounts.
     */
    @NotNull(message = "Debe haber al menos un participante en la división")
    private List<Long> participantUserIds;

    /**
     * Si splitType es MANUAL o PERCENTAGE, proporciona los montos o porcentajes.
     * Formato: {userId: monto/porcentaje}
     */
    private java.util.Map<Long, BigDecimal> splitAmounts;
}
