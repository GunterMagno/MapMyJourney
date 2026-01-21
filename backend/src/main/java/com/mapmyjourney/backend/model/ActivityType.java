package com.mapmyjourney.backend.model;

/**
 * Enum que representa los tipos de actividades disponibles en un itinerario.
 */
public enum ActivityType {
    ACTIVITY("Actividad"),
    TRANSITION("Transición");

    private final String displayName;

    ActivityType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
