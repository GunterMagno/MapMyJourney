package com.mapmyjourney.backend.dto;

import com.mapmyjourney.backend.model.enums.TripMemberRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para cambiar el rol de un miembro en un viaje.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangeMemberRoleRequestDTO {
    private TripMemberRole role;
}
