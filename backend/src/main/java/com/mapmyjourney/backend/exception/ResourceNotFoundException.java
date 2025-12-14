package com.mapmyjourney.backend.exception;

/**
 * Excepción base para errores de recursos no encontrados.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
