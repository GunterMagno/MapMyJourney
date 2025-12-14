package com.mapmyjourney.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.mapmyjourney.backend.model.enums.UserRole;

import java.time.LocalDateTime;

/**
 * DTO para información pública de un usuario.
 * No incluye datos sensibles como contraseñas.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long id;

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 2, max = 20)
    private String name;

    @NotBlank(message = "El email no puede estar vacío")
    @Email(message = "El email debe ser válido")
    private String email;

    private UserRole role;

    private String profilePicture;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
