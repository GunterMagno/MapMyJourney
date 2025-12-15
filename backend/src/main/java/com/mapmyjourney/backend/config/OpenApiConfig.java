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
 * Configuración de OpenAPI/Swagger para la API REST.
 * Genera documentación automática en http://localhost:8080/swagger-ui/index.html
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                    .title("MapMyJourney API")
                    .version("1.0.0")
                    .description("API REST para gestión colaborativa de viajes con división de gastos")
                    .contact(new Contact()
                        .name("API Support")
                        .email("soporte@mapmyjourney.com")
                        .url("https://github.com/GunterelMagno/MapMyJourney"))
                )
                .components(new Components()
                    .addSecuritySchemes("Bearer Authentication",
                        new SecurityScheme()
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                            .description("JWT token para autenticación. Ejemplo: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"));
    }
}
