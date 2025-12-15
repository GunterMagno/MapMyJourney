package com.mapmyjourney.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.mapmyjourney.backend.model.enums.TripMemberRole;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO para información completa de un viaje.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDTO {

    private Long id;

    private String title;

    private String destination;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private BigDecimal budget;

    private String tripCode;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * El rol del usuario actual en este viaje.
     * Se establece en el servicio según el contexto.
     */
    private TripMemberRole currentUserRole;

    private Set<TripMemberDTO> members;
}

