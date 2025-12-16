package com.mapmyjourney.backend.controller;

import com.mapmyjourney.backend.dto.UserCreateRequestDTO;
import com.mapmyjourney.backend.dto.UserDTO;
import com.mapmyjourney.backend.dto.LoginRequestDTO;
import com.mapmyjourney.backend.dto.LoginResponseDTO;
import com.mapmyjourney.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.Parameter;

/**
 * Controlador REST para gestionar usuarios.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "API de gestión de usuarios - Registro, login, perfil")
public class UserController {

    private final UserService userService;

    /**
     * 1. Registra un nuevo usuario.
     * POST /api/users/register
     */
    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario", 
               description = "Crea una nueva cuenta de usuario con nombre, email y contraseña")
    @ApiResponse(responseCode = "201", description = "Usuario creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos (email/contraseña débil)")
    @ApiResponse(responseCode = "409", description = "El email ya está registrado")
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody(description = "Datos del usuario a registrar") UserCreateRequestDTO request) {
        UserDTO createdUser = userService.registerUser(request);
        return ResponseEntity.status(201).body(createdUser);
    }

    /**
     * 2. Inicia sesión con email y contraseña.
     * POST /api/users/login
     */
    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", 
               description = "Autentica un usuario y retorna un token JWT válido por 24 horas")
    @ApiResponse(responseCode = "200", description = "Autenticación exitosa - token JWT retornado")
    @ApiResponse(responseCode = "400", description = "Email o contraseña inválidos")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody(description = "Email y contraseña del usuario") LoginRequestDTO request) {
        LoginResponseDTO response = userService.authenticate(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    /**
     * 3. Obtiene un usuario por ID.
     * GET /api/users/{userId}
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Obtener usuario por ID", 
               description = "Recupera los detalles de un usuario específico")
    @ApiResponse(responseCode = "200", description = "Usuario encontrado con sus datos")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public ResponseEntity<UserDTO> getUserById(
            @Parameter(description = "ID único del usuario", example = "1")
            @PathVariable Long userId) {
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    /**
     * 4. Obtiene un usuario por email.
     * GET /api/users/email/{email}
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Obtener usuario por email", 
               description = "Busca un usuario por su dirección de correo electrónico")
    @ApiResponse(responseCode = "200", description = "Usuario encontrado")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado con ese email")
    public ResponseEntity<UserDTO> getUserByEmail(
            @Parameter(description = "Email del usuario", example = "juan@example.com")
            @PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    /**
     * 5. Actualiza un usuario existente.
     * PUT /api/users/{userId}
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Actualizar datos del usuario", 
               description = "Actualiza nombre, email u otros datos del usuario")
    @ApiResponse(responseCode = "200", description = "Usuario actualizado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @ApiResponse(responseCode = "409", description = "El nuevo email ya está registrado")
    public ResponseEntity<UserDTO> updateUser(
            @Parameter(description = "ID del usuario a actualizar", example = "1")
            @PathVariable Long userId, 
            @Valid @RequestBody(description = "Nuevos datos del usuario") UserCreateRequestDTO request) {
        UserDTO updatedUser = userService.updateUser(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * 6. Elimina un usuario.
     * DELETE /api/users/{userId}
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar usuario", 
               description = "Elimina permanentemente una cuenta de usuario (solo ADMIN)")
    @ApiResponse(responseCode = "204", description = "Usuario eliminado exitosamente")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos para eliminar (requiere rol ADMIN)")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID del usuario a eliminar", example = "1")
            @PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}