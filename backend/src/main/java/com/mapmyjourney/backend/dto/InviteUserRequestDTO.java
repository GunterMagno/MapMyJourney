package com.mapmyjourney.backend.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteUserRequestDTO {

    @Email(message = "El email no es valido.")
    @NotBlank(message = "El email es requerido.")
    private String email;
}
