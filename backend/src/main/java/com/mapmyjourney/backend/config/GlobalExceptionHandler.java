package com.mapmyjourney.backend.config;

import com.mapmyjourney.backend.exception.*;
import com.mapmyjourney.backend.util.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones para la API REST.
 * Convierte excepciones en respuestas JSON estandarizadas.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja excepciones de validación de argumentos (ej: @Valid fallido).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationExceptions(
        MethodArgumentNotValidException ex,
        WebRequest request) {

        log.warn("Validation error: {}", ex.getMessage());

        List<ApiResponse.FieldError> errors = ex.getBindingResult()
            .getAllErrors()
            .stream()
            .map(error -> {
                String fieldName = error instanceof FieldError 
                    ? ((FieldError) error).getField() 
                    : error.getObjectName();
                return ApiResponse.FieldError.builder()
                    .field(fieldName)
                    .message(error.getDefaultMessage())
                    .build();
            })
            .collect(Collectors.toList());

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(
                HttpStatus.BAD_REQUEST.value(),
                "Errores de validación",
                errors
            ));
    }

    /**
     * Maneja excepciones de recurso no encontrado (404).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceNotFound(
        ResourceNotFoundException ex,
        WebRequest request) {

        log.info("Resource not found: {}", ex.getMessage());

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage()
            ));
    }

    /**
     * Maneja excepciones de acceso denegado (403).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(
        AccessDeniedException ex,
        WebRequest request) {

        log.warn("Access denied: {}", ex.getMessage());

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error(
                HttpStatus.FORBIDDEN.value(),
                ex.getMessage()
            ));
    }

    /**
     * Maneja excepciones de negocio (400).
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(
        BusinessException ex,
        WebRequest request) {

        log.warn("Business exception: {}", ex.getMessage());

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage()
            ));
    }

    /**
     * Maneja excepciones de recurso duplicado (409).
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<?>> handleDuplicateResource(
        DuplicateResourceException ex,
        WebRequest request) {

        log.warn("Duplicate resource: {}", ex.getMessage());

        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ApiResponse.error(
                HttpStatus.CONFLICT.value(),
                ex.getMessage()
            ));
    }

    /**
     * Maneja todas las excepciones no capturadas (500).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGeneralException(
        Exception ex,
        WebRequest request) {

        log.error("Unexpected error: ", ex);

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error interno del servidor. Por favor, intenta más tarde."
            ));
    }
}
