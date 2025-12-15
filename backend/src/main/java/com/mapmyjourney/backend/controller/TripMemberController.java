package com.mapmyjourney.backend.controller;

import com.mapmyjourney.backend.dto.AddMemberRequestDTO;
import com.mapmyjourney.backend.dto.ChangeMemberRoleRequestDTO;
import com.mapmyjourney.backend.dto.TripMemberDTO;
import com.mapmyjourney.backend.service.TripMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestionar miembros de viajes.
 */
@RestController
@RequestMapping("/api/trips/{tripId}/members")
@RequiredArgsConstructor
public class TripMemberController {

    private final TripMemberService tripMemberService;

    /**
     * 1. Agrega un nuevo miembro al viaje.
     * POST /api/trips/{tripId}/members
     */
    @PostMapping
    public ResponseEntity<TripMemberDTO> addMember(@PathVariable Long tripId, @RequestBody AddMemberRequestDTO request) {
        TripMemberDTO newMember = tripMemberService.addMemberToTrip(tripId, request.getUserId(), request.getRole());
        return ResponseEntity.status(201).body(newMember);
    }

    /**
     * 2. Obtiene todos los miembros del viaje.
     * GET /api/trips/{tripId}/members
     */
    @GetMapping
    public ResponseEntity<List<TripMemberDTO>> getTripMembers(@PathVariable Long tripId) {
        List<TripMemberDTO> members = tripMemberService.getTripMembers(tripId);
        return ResponseEntity.ok(members);
    }

    /**
     * 3. Obtiene un miembro específico.
     * GET /api/trips/{tripId}/members/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<TripMemberDTO> getMember(@PathVariable Long tripId, @PathVariable Long userId) {
        TripMemberDTO member = tripMemberService.getMember(tripId, userId);
        return ResponseEntity.ok(member);
    }

    /**
     * 4. Cambia el rol de un miembro.
     * PUT /api/trips/{tripId}/members/{userId}/role
     * Solo OWNER puede cambiar roles.
     */
    @PutMapping("/{userId}/role")
    public ResponseEntity<TripMemberDTO> changeMemberRole(@PathVariable Long tripId, @PathVariable Long userId, @RequestBody ChangeMemberRoleRequestDTO request) {
        TripMemberDTO updatedMember = tripMemberService.changeMemberRole(tripId, userId, request.getRole());
        return ResponseEntity.ok(updatedMember);
    }

    /**
     * 5. Elimina un miembro del viaje.
     * DELETE /api/trips/{tripId}/members/{userId}
     * Solo OWNER puede remover miembros.
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long tripId, @PathVariable Long userId) {
        tripMemberService.removeMemberFromTrip(tripId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 6. Permite que el usuario abandone el viaje.
     * POST /api/trips/{tripId}/members/leave
     */
    @PostMapping("/leave")
    public ResponseEntity<Void> leaveTrip(@PathVariable Long tripId) {
        // TODO: Obtener userId del contexto de seguridad
        Long userId = 1L; // Placeholder
        tripMemberService.removeMemberFromTrip(tripId, userId);
        return ResponseEntity.noContent().build();
    }

}