package com.mapmyjourney.backend.model.enums;

/**
 * Enum que define cómo se divide un gasto entre los participantes.
 */
public enum ExpenseSplitType {
    EQUAL("División equitativa"),
    MANUAL("División manual"),
    PERCENTAGE("División por porcentaje"),
    CUSTOM("Personalizada");

    private final String displayName;

    ExpenseSplitType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
