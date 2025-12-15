package com.mapmyjourney.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para crear una nueva división de gasto.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSplitRequestDTO {
    private Long participantUserId;
    private BigDecimal amount;
    private BigDecimal percentage;
}
