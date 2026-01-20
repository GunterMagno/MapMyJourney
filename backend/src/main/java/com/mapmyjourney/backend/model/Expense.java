package com.mapmyjourney.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.mapmyjourney.backend.model.enums.ExpenseSplitType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidad que representa un gasto en un viaje.
 * Un gasto tiene un monto total y se divide entre miembros del viaje.
 * Inspirado en Splitwise/Tricount.
 */
@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "expenses_id_gen")
    @SequenceGenerator(name = "expenses_id_gen", sequenceName = "expenses_id_seq", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paid_by_user_id", nullable = false)
    private User paidBy;

    @NotBlank(message = "La descripción del gasto no puede estar vacía")
    @Size(min = 1, max = 150, message = "La descripción debe tener entre 1 y 150 caracteres")
    @Column(nullable = false)
    private String description;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "La fecha del gasto es obligatoria")
    @Column(nullable = false)
    private LocalDate expenseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ExpenseSplitType splitType = ExpenseSplitType.EQUAL;

    /**
     * URL o ruta al archivo del recibo/ticket adjunto.
     */
    @Column(columnDefinition = "TEXT")
    private String receiptUrl;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Builder.Default
    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ExpenseSplit> splits = new HashSet<>();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Calcula el total de los splits. Debe coincidir con el amount.
     */
    public BigDecimal getTotalSplits() {
        return splits.stream()
            .map(ExpenseSplit::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
