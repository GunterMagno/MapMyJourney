package com.mapmyjourney.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador para verificar el estado de los servicios del backend
 * Usado por la página de estado para comprobar que el backend está disponible
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    /**
     * Verifica que el servidor backend está disponible
     * @return ResponseEntity con estado OK
     */
    @GetMapping
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend OK");
    }

    /**
     * Verifica que el servicio de autenticación está disponible
     * @return ResponseEntity con estado OK
     */
    @GetMapping("/auth")
    public ResponseEntity<String> authHealth() {
        return ResponseEntity.ok("Auth Service OK");
    }

    /**
     * Verifica que el servicio de viajes está disponible
     * @return ResponseEntity con estado OK
     */
    @GetMapping("/trips")
    public ResponseEntity<String> tripsHealth() {
        return ResponseEntity.ok("Trips Service OK");
    }

    /**
     * Verifica que el servicio de usuarios está disponible
     * @return ResponseEntity con estado OK
     */
    @GetMapping("/users")
    public ResponseEntity<String> usersHealth() {
        return ResponseEntity.ok("Users Service OK");
    }
}
