package com.mapmyjourney.backend.exception;

/**
 * Excepción para errores de negocio (ej: viaje con fechas inválidas).
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
