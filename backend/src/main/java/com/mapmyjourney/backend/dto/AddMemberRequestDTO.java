package com.mapmyjourney.backend.dto;

import com.mapmyjourney.backend.model.enums.TripMemberRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para agregar un nuevo miembro a un viaje.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddMemberRequestDTO {
    private Long userId;
    private TripMemberRole role;
}
