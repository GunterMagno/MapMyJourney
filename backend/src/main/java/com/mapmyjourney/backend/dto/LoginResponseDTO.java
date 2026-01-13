package com.mapmyjourney.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para respuesta de login (contiene el token JWT y datos del usuario).
 */
@Data
@NoArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String type = "Bearer";
    private Long expiresIn;
    private UserDTO user;

    public LoginResponseDTO(String token, String type, Long expiresIn, UserDTO user) {
        this.token = token;
        this.type = type;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public LoginResponseDTO(String token, Long expiresIn, UserDTO user) {
        this.token = token;
        this.type = "Bearer";
        this.expiresIn = expiresIn;
        this.user = user;
    }
}
