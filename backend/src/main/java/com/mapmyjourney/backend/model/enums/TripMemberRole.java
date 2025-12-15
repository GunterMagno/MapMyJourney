package com.mapmyjourney.backend.model.enums;

/**
 * Enumeración que define los roles de un usuario dentro de un viaje.
 */
public enum TripMemberRole {
    OWNER("Propietario"),
    EDITOR("Editor"),
    VIEWER("Visualizador");

    private final String description;

    TripMemberRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Verifica si este rol tiene un permiso específico.
     */
    public boolean hasPermission(TripMemberRole required) {
        if (required == OWNER) {
            return this == OWNER;
        } else if (required == EDITOR) {
            return this == OWNER || this == EDITOR;
        } else {
            return true; // VIEWER puede hacer todo excepto editar
        }
    }
}