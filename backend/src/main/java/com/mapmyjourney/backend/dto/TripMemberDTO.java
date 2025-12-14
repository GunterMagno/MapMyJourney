package com.mapmyjourney.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.mapmyjourney.backend.model.enums.TripMemberRole;

import java.time.LocalDateTime;

/**
 * DTO para información de un miembro de un viaje.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripMemberDTO {

    private Long id;

    private UserDTO user;

    private TripMemberRole role;

    private LocalDateTime joinedAt;
}
