package com.mapmyjourney.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * Permite que el frontend pueda hacer solicitudes al backend
 * 
 * CORS permite solicitudes desde:
 * - http://localhost:4200 (desarrollo Angular local)
 * - http://localhost:3000 (desarrollo Node local)
 * - https://mapmyjourney-4w93.onrender.com (producción)
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Configura los parámetros CORS para todas las rutas.
     * Permite peticiones GET, POST, PUT, DELETE con credenciales.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // Orígenes permitidos
                .allowedOrigins(
                    "http://localhost:4200",      // Desarrollo Angular
                    "http://localhost:3000",      // Desarrollo Node
                    "http://127.0.0.1:4200",      // Desarrollo local alternativo
                    "https://mapmyjourney-4w93.onrender.com"  // Producción
                )
                // Métodos HTTP permitidos
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                // Headers permitidos en peticiones
                .allowedHeaders("*")
                // Permitir envío de cookies y credenciales
                .allowCredentials(true)
                // Tiempo de caché de la política CORS en segundos (1 hora)
                .maxAge(3600);
    }
}
