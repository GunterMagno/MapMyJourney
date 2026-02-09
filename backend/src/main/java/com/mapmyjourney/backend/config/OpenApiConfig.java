package com.mapmyjourney.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de OpenAPI/Swagger para documentación automática de la API REST.
 * 
 * Genera documentación interactiva en:
 * http://localhost:8080/swagger-ui/index.html
 * 
 * También disponible en formato JSON:
 * http://localhost:8080/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    /**
     * Crea la configuración personalizada de OpenAPI.
     * Define información general, esquema de seguridad (JWT) y contacto.
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // Información general de la API
                .info(new Info()
                    .title("MapMyJourney API")
                    .version("1.0.0")
                    .description("API REST para gestión colaborativa de viajes con división de gastos. " +
                        "Permite crear viajes, agregar miembros, registrar gastos y crear itinerarios.")
                    .contact(new Contact()
                        .name("API Support")
                        .email("soporte@mapmyjourney.com")
                        .url("https://github.com/GunterelMagno/MapMyJourney"))
                )
                // Configuración de esquemas de seguridad
                .components(new Components()
                    // Scheme JWT para Bearer tokens
                    .addSecuritySchemes("Bearer Authentication",
                        new SecurityScheme()
                            .type(SecurityScheme.Type.HTTP)  // HTTP Basic/Bearer
                            .scheme("bearer")                 // Tipo Bearer
                            .bearerFormat("JWT")              // Formato JWT
                            .description("JWT token para autenticación de peticiones. " +
                                "Usar formato: Authorization: Bearer <token>")))
                // Aplicar el esquema de seguridad globalmente
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"));
    }
}
