package com.mapmyjourney.backend.exception;

/**
 * Excepción para operaciones duplicadas (ej: usuario ya existe).
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }
}
