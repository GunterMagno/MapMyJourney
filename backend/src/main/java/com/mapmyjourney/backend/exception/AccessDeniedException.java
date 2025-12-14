package com.mapmyjourney.backend.exception;

/**
 * Excepción para acceso denegado (falta de permisos).
 */
public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException(String message) {
        super(message);
    }

    public AccessDeniedException(String message, Throwable cause) {
        super(message, cause);
    }
}
