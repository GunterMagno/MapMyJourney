package com.mapmyjourney.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuración de Spring Security con JWT y CORS.
 * - Define rutas públicas (/register, /login, Swagger)
 * - Protege endpoints privados que requieren autenticación
 * - Configura CORS para Angular Frontend (localhost:4200)
 * - Integra JwtAuthenticationFilter
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Configura la cadena de filtros de seguridad HTTP.
     * Define rutas públicas y privadas, y configura CORS.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Habilitar CORS - DEBE IR PRIMERO
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Deshabilitar CSRF (usando JWT)
                .csrf(csrf -> csrf.disable())
                // Usar sesiones STATELESS (sin cookies)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Configurar autorización de endpoints
                .authorizeHttpRequests(authorize -> authorize
                        // Permitir todas las solicitudes OPTIONS (preflight CORS)
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        // Rutas públicas - permitir sin autenticación
                        .requestMatchers("/users/login", "/users/register").permitAll()
                        .requestMatchers("/health/**", "/health").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        // Todos los demás endpoints requieren autenticación
                        .anyRequest().authenticated()
                )
                // Agregar JWT filter antes de UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // Permitir acceso a H2 Console
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));

        return http.build();
    }

    /**
     * Configura CORS para permitir solicitudes desde el frontend en localhost:4200.
     * Explícitamente permite el preflight (OPTIONS) que es obligatorio para CORS en navegadores.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Permitir orígenes específicos
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200", 
            "http://localhost:3000",
            "http://127.0.0.1:4200",
            "http://127.0.0.1:3000"
        ));
        
        // Permitir todos los métodos HTTP incluyendo OPTIONS (preflight)
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        
        // Permitir headers específicos
        configuration.setAllowedHeaders(Arrays.asList(
            "*",
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "X-App-Client"
        ));
        
        // Permitir credenciales (cookies, tokens)
        configuration.setAllowCredentials(true);
        
        // Permitir exponerExposeHeaders para el frontend
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Total-Count"
        ));
        
        // Cache preflight por 1 hora
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Configura el AuthenticationManager con DaoAuthenticationProvider.
     */
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.authenticationProvider(daoAuthenticationProvider());
        return authBuilder.build();
    }

    /**
     * Configura el proveedor de autenticación DAO.
     * Usa CustomUserDetailsService para cargar usuarios de la base de datos.
     */
    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * Define el encoder de contraseñas (BCrypt).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
