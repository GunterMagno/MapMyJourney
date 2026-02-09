package com.mapmyjourney.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

/**
 * Proveedor de tokens JWT.
 * Maneja la generación, validación y extracción de información de tokens JWT.
 * 
 * Usa JJWT (Java JWT) para crear tokens seguros con firma HMAC SHA-512.
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;  // Clave secreta para firmar tokens (debe tener 256+ caracteres)

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;  // Tiempo de expiración en milisegundos (ej: 86400000 = 24 horas)

    /**
     * Obtiene la clave de firma HMAC a partir del secreto.
     * Spring Security requiere claves de al menos 256 bits.
     * 
     * @return Key para firmar tokens
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Genera un token JWT a partir de una Authentication de Spring.
     * Extrae el email del usuario autenticado como "subject" del token.
     * 
     * @param authentication Objeto Authentication de Spring con el usuario logueado
     * @return Token JWT codificado en Base64
     */
    public String generateToken(Authentication authentication) {
        String email = authentication.getName();  // Email es el nombre del usuario
        return generateToken(email);
    }

    /**
     * Genera un token JWT para un email específico.
     * El token contiene:
     * - subject: Email del usuario
     * - issuedAt: Fecha/hora de creación
     * - expiration: Fecha/hora de expiración
     * - firma: HMAC SHA-512
     * 
     * @param email Email del usuario
     * @return Token JWT codificado
     */
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)  // El email es el "subject" del token
                .issuedAt(new Date())  // Marca con la fecha/hora actual
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))  // Expira en 24h
                .signWith(getSigningKey())  // Firma con HMAC SHA-512
                .compact();  // Serializa a string Base64
    }

    /**
     * Extrae el email (subject) de un token JWT válido.
     * 
     * @param token Token JWT a parsear
     * @return Email del usuario contenido en el token
     */
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Valida que el token JWT sea válido.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Retorna el tiempo de expiración del token en milisegundos.
     */
    public long getExpirationTime() {
        return jwtExpirationMs;
    }
}