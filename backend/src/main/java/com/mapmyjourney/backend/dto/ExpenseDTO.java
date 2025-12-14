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
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO para información completa de un gasto.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseDTO {

    private Long id;

    @NotBlank(message = "La descripción del gasto no puede estar vacía")
    @Size(min = 1, max = 150)
    private String description;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    @NotNull(message = "La fecha del gasto es obligatoria")
    private LocalDate expenseDate;

    private UserDTO paidBy;

    @NotNull(message = "El tipo de división es obligatorio")
    private ExpenseSplitType splitType;

    private String receiptUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Set<ExpenseSplitDTO> splits;
}
