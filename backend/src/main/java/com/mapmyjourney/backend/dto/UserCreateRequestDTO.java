package com.mapmyjourney.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear/registrar un nuevo usuario.
 * Incluye validaciones para el registro inicial.
 */
public class UserCreateRequestDTO {

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 2, max = 20, message = "El nombre debe tener entre 2 y 20 caracteres")
    @JsonProperty("name")
    private String name;

    @NotBlank(message = "El email no puede estar vacío")
    @Email(message = "El email debe ser válido")
    @JsonProperty("email")
    private String email;

    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 8, max = 50, message = "La contraseña debe tener entre 8 y 50 caracteres")
    @JsonProperty("password")
    private String password;
    
    public UserCreateRequestDTO() {
    }
    
    public UserCreateRequestDTO(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}
