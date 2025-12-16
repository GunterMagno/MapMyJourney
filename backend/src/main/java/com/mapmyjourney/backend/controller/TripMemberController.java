package com.mapmyjourney.backend.controller;

import com.mapmyjourney.backend.dto.AddMemberRequestDTO;
import com.mapmyjourney.backend.dto.ChangeMemberRoleRequestDTO;
import com.mapmyjourney.backend.dto.TripMemberDTO;
import com.mapmyjourney.backend.service.TripMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

/**
 * Controlador REST para gestionar miembros de viajes.
 */
@RestController
@RequestMapping("/api/trips/{tripId}/members")
@RequiredArgsConstructor
@Tag(name = "TripMembers", description = "API de gestión de miembros - Agregar, remover, cambiar roles")
public class TripMemberController {

    private final TripMemberService tripMemberService;

    /**
     * 1. Agrega un nuevo miembro al viaje.
     * POST /api/trips/{tripId}/members
     */
    @PreAuthorize("hasRole('USER')")
    @PostMapping
    @Operation(summary = "Agregar miembro al viaje", 
               description = "Agrega un usuario al viaje con un rol específico (OWNER, EDITOR, VIEWER)")
    @ApiResponse(responseCode = "201", description = "Miembro agregado exitosamente")
    @ApiResponse(responseCode = "400", description = "Usuario ya es miembro o datos inválidos")
    @ApiResponse(responseCode = "404", description = "Viaje o usuario no encontrado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos (solo OWNER puede agregar)")
    public ResponseEntity<TripMemberDTO> addMember(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId, 
            @Valid @RequestBody(description = "Datos del miembro a agregar") AddMemberRequestDTO request) {
        TripMemberDTO newMember = tripMemberService.addMemberToTrip(tripId, request.getUserId(), request.getRole());
        return ResponseEntity.status(201).body(newMember);
    }

    /**
     * 2. Obtiene todos los miembros del viaje.
     * GET /api/trips/{tripId}/members
     */
    @PreAuthorize("hasRole('USER')")
    @GetMapping
    @Operation(summary = "Listar miembros del viaje", 
               description = "Obtiene todos los miembros y sus roles en el viaje")
    @ApiResponse(responseCode = "200", description = "Lista de miembros del viaje")
    @ApiResponse(responseCode = "404", description = "Viaje no encontrado")
    public ResponseEntity<List<TripMemberDTO>> getTripMembers(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId) {
        List<TripMemberDTO> members = tripMemberService.getTripMembers(tripId);
        return ResponseEntity.ok(members);
    }

    /**
     * 3. Obtiene un miembro específico.
     * GET /api/trips/{tripId}/members/{userId}
     */
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{userId}")
    @Operation(summary = "Obtener miembro específico", 
               description = "Recupera la información de un miembro en el viaje")
    @ApiResponse(responseCode = "200", description = "Miembro encontrado")
    @ApiResponse(responseCode = "404", description = "Miembro no encontrado en el viaje")
    public ResponseEntity<TripMemberDTO> getMember(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId, 
            @Parameter(description = "ID del usuario", example = "5")
            @PathVariable Long userId) {
        TripMemberDTO member = tripMemberService.getMember(tripId, userId);
        return ResponseEntity.ok(member);
    }

    /**
     * 4. Cambia el rol de un miembro.
     * PUT /api/trips/{tripId}/members/{userId}/role
     * Solo OWNER puede cambiar roles.
     */
    @PreAuthorize("hasRole('USER')")
    @PutMapping("/{userId}/role")
    @Operation(summary = "Cambiar rol del miembro", 
               description = "Cambia el rol de un miembro en el viaje (solo OWNER puede hacerlo)")
    @ApiResponse(responseCode = "200", description = "Rol actualizado exitosamente")
    @ApiResponse(responseCode = "404", description = "Miembro no encontrado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos (solo OWNER puede cambiar roles)")
    public ResponseEntity<TripMemberDTO> changeMemberRole(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId, 
            @Parameter(description = "ID del usuario", example = "5")
            @PathVariable Long userId, 
            @Valid @RequestBody(description = "Nuevo rol del miembro") ChangeMemberRoleRequestDTO request) {
        TripMemberDTO updatedMember = tripMemberService.changeMemberRole(tripId, userId, request.getRole());
        return ResponseEntity.ok(updatedMember);
    }

    /**
     * 5. Elimina un miembro del viaje.
     * DELETE /api/trips/{tripId}/members/{userId}
     * Solo OWNER puede remover miembros.
     */
    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{userId}")
    @Operation(summary = "Remover miembro del viaje", 
               description = "Elimina un miembro del viaje (solo OWNER puede hacerlo)")
    @ApiResponse(responseCode = "204", description = "Miembro removido exitosamente")
    @ApiResponse(responseCode = "404", description = "Miembro no encontrado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos (solo OWNER puede remover)")
    public ResponseEntity<Void> removeMember(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId, 
            @Parameter(description = "ID del usuario a remover", example = "5")
            @PathVariable Long userId) {
        tripMemberService.removeMemberFromTrip(tripId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 6. Permite que el usuario abandone el viaje.
     * POST /api/trips/{tripId}/members/leave
     */
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/leave")
    @Operation(summary = "Abandonar viaje", 
               description = "Permite que el usuario autenticado abandone el viaje")
    @ApiResponse(responseCode = "204", description = "Viaje abandonado exitosamente")
    @ApiResponse(responseCode = "404", description = "Usuario no es miembro del viaje")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    public ResponseEntity<Void> leaveTrip(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId) {
        Long userId = extractUserIdFromContext();
        tripMemberService.removeMemberFromTrip(tripId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Extrae el userId del contexto de seguridad de Spring Security.
     */
    private Long extractUserIdFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        // TODO: Obtener userId a partir del email desde UserService
        return 1L;
    }

}