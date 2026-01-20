package com.mapmyjourney.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * DTO para actualizar datos de un usuario existente.
 * Los campos son opcionales - solo se actualizan los que se envían.
 */
public class UserUpdateRequestDTO {

    @Size(min = 2, max = 20, message = "El nombre debe tener entre 2 y 20 caracteres")
    @JsonProperty("name")
    private String name;

    @Email(message = "El email debe ser válido")
    @JsonProperty("email")
    private String email;

    @JsonProperty("currentPassword")
    private String currentPassword;

    @Size(min = 8, max = 50, message = "La contraseña debe tener entre 8 y 50 caracteres")
    @JsonProperty("newPassword")
    private String newPassword;

    @JsonProperty("newPasswordConfirm")
    private String newPasswordConfirm;

    @JsonProperty("profilePicture")
    private String profilePicture;
    
    public UserUpdateRequestDTO() {
    }
    
    public UserUpdateRequestDTO(String name, String email, String profilePicture) {
        this.name = name;
        this.email = email;
        this.profilePicture = profilePicture;
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

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getNewPasswordConfirm() {
        return newPasswordConfirm;
    }

    public void setNewPasswordConfirm(String newPasswordConfirm) {
        this.newPasswordConfirm = newPasswordConfirm;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
}
