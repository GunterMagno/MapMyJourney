package com.mapmyjourney.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración Web - CORS Global
 * 
 * Este filtro CORS se ejecuta ANTES de todos los filtros de seguridad,
 * asegurando que el preflight (OPTIONS) sea procesado correctamente.
 */
@Configuration
public class WebConfig {

    @Value("${spring.web.cors.allowed-origins:http://localhost:4200,http://localhost:3000,http://127.0.0.1:4200,https://mapmyjourney-frontend.onrender.com,https://mapmyjourney-4w93.onrender.com,https://mapmyjourney.onrender.com}")
    private String allowedOrigins;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    /**
     * Bean de CorsFilter - Ejecuta ANTES que Security Filters
     * Esto es crítico para manejar preflight correctamente
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // En ambiente de producción, solo permitir orígenes específicos
        // En desarrollo, permitir localhost y variantes
        if (activeProfiles.contains("prod")) {
            // Ambiente de producción - orígenes específicos
            List<String> origins = Arrays.asList(allowedOrigins.split(","));
            config.setAllowedOrigins(origins);
        } else {
            // Desarrollo - permitir cualquier origen
            config.setAllowedOriginPatterns(Arrays.asList("*"));
        }
        
        // Permitir todos los métodos HTTP
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        
        // Permitir todos los headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Permitir credentials (cookies, headers de autorización)
        config.setAllowCredentials(true);
        
        // Exponer headers necesarios al cliente
        config.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Total-Count"
        ));
        
        // Cache preflight por 1 hora
        config.setMaxAge(3600L);
        
        // Registrar configuración para todos los paths
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
