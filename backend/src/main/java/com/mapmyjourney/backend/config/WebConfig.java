package com.mapmyjourney.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * Configuración Web - CORS Global
 * 
 * Este filtro CORS se ejecuta ANTES de todos los filtros de seguridad,
 * asegurando que el preflight (OPTIONS) sea procesado correctamente.
 */
@Configuration
public class WebConfig {

    /**
     * Bean de CorsFilter - Ejecuta ANTES que Security Filters
     * Esto es crítico para manejar preflight correctamente
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir orígenes específicos
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://localhost:3000",
            "http://127.0.0.1:4200",
            "http://127.0.0.1:3000"
        ));
        
        // Permitir todos los métodos
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        
        // Permitir todos los headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Permitir credentials
        config.setAllowCredentials(true);
        
        // Exponer headers
        config.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Total-Count"
        ));
        
        // Cache preflight
        config.setMaxAge(3600L);
        
        // Registrar configuración para todos los paths
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
