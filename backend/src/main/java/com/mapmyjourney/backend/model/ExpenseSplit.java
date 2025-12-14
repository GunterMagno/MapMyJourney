package com.mapmyjourney.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que representa la división de un gasto entre un usuario.
 * Cada gasto puede tener múltiples divisiones (una por cada participante).
 */
@Entity
@Table(name = "expense_splits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_user_id", nullable = false)
    private User participant;

    @NotNull(message = "El monto de la división es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * Porcentaje que representa este monto en el gasto total.
     * Útil para divisiones por porcentaje.
     */
    @Column(precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Indica si este participante ya ha pagado su parte.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean paid = false;
}
