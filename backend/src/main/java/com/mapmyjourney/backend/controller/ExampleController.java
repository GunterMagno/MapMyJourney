package com.mapmyjourney.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de ejemplo para Swagger
 */
@RestController
@RequestMapping("/example")
@Tag(name = "Ejemplo", description = "Endpoint de prueba")
public class ExampleController {

    @GetMapping("/hello")
    @Operation(summary = "Saludo simple", description = "Retorna un mensaje de bienvenida")
    public String hello() {
        return "¡Hola desde MapMyJourney! 🗺️";
    }

    @GetMapping("/hello/{name}")
    @Operation(summary = "Saludo personalizado")
    public String helloName(@PathVariable String name) {
        return "¡Hola " + name + "! Bienvenido a MapMyJourney 🗺️";
    }
}
