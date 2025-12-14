package com.mapmyjourney.backend.model.enums;

/**
 * Enum que define los roles de los usuarios en el sistema.
 * Actualmente, un usuario tiene un único rol global (no por viaje).
 */
public enum UserRole {
    USER("Usuario"),
    ADMIN("Administrador");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
