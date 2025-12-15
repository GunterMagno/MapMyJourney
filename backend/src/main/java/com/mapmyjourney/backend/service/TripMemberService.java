package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.dto.TripMemberDTO;
import com.mapmyjourney.backend.dto.UserDTO;
import com.mapmyjourney.backend.exception.ValidationException;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.model.Trip;
import com.mapmyjourney.backend.model.TripMember;
import com.mapmyjourney.backend.model.User;
import com.mapmyjourney.backend.model.enums.TripMemberRole;
import com.mapmyjourney.backend.repository.TripMemberRepository;
import com.mapmyjourney.backend.repository.TripRepository;
import com.mapmyjourney.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestionar la membresía de usuarios en viajes.
 * Maneja la adición, eliminación y cambio de roles de miembros.
 */
@Service
@RequiredArgsConstructor
public class TripMemberService {

    private final TripMemberRepository tripMemberRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    /**
     * Agrega un nuevo miembro a un viaje.
     * 
     * @param tripId ID del viaje
     * @param userId ID del usuario a agregar
     * @param role Rol inicial del usuario (por defecto VIEWER)
     * @return DTO del miembro creado
     */
    @Transactional
    public TripMemberDTO addMemberToTrip(Long tripId, Long userId, TripMemberRole role) {
        // Validar que el viaje existe
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }
        Trip trip = tripOptional.get();

        // Validar que el usuario existe
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        User user = userOptional.get();

        // Verificar que el usuario no sea ya miembro
        Optional<TripMember> existingMember = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (existingMember.isPresent()) {
            throw new ValidationException("El usuario ya es miembro de este viaje");
        }

        // Crear nuevo miembro
        TripMember newMember = TripMember.builder()
                .trip(trip)
                .user(user)
                .role(role != null ? role : TripMemberRole.VIEWER)
                .joinedAt(LocalDateTime.now())
                .build();

        TripMember savedMember = tripMemberRepository.save(newMember);
        return mapToDTO(savedMember);
    }

    /**
     * Obtiene un miembro específico de un viaje.
     * 
     * @param tripId ID del viaje
     * @param userId ID del usuario
     * @return DTO del miembro
     */
    @Transactional(readOnly = true)
    public TripMemberDTO getMember(Long tripId, Long userId) {
        Optional<TripMember> memberOptional = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (!memberOptional.isPresent()) {
            throw new ResourceNotFoundException("El usuario no es miembro de este viaje");
        }

        return mapToDTO(memberOptional.get());
    }

    /**
     * Obtiene todos los miembros de un viaje.
     * 
     * @param tripId ID del viaje
     * @return Lista de DTOs de miembros
     */
    @Transactional(readOnly = true)
    public List<TripMemberDTO> getTripMembers(Long tripId) {
        // Validar que el viaje existe
        if (!tripRepository.existsById(tripId)) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }

        List<TripMember> members = tripMemberRepository.findAllByTripId(tripId);
        List<TripMemberDTO> dtos = new ArrayList<>();

        for (TripMember member : members) {
            dtos.add(mapToDTO(member));
        }

        return dtos;
    }

    /**
     * Cambia el rol de un miembro en un viaje.
     * 
     * @param tripId ID del viaje
     * @param userId ID del usuario
     * @param newRole Nuevo rol
     * @return DTO del miembro actualizado
     */
    @Transactional
    public TripMemberDTO changeMemberRole(Long tripId, Long userId, TripMemberRole newRole) {
        Optional<TripMember> memberOptional = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (!memberOptional.isPresent()) {
            throw new ResourceNotFoundException("El usuario no es miembro de este viaje");
        }

        TripMember member = memberOptional.get();
        
        // No se puede quitar el rol OWNER si es el único owner
        if (member.getRole() == TripMemberRole.OWNER && newRole != TripMemberRole.OWNER) {
            List<TripMember> owners = tripMemberRepository.findAllByTripId(tripId).stream()
                    .filter(m -> m.getRole() == TripMemberRole.OWNER)
                    .toList();
            
            if (owners.size() <= 1) {
                throw new ValidationException("No se puede remover el único propietario del viaje");
            }
        }

        member.setRole(newRole);
        TripMember updatedMember = tripMemberRepository.save(member);
        return mapToDTO(updatedMember);
    }

    /**
     * Elimina un miembro de un viaje.
     * 
     * @param tripId ID del viaje
     * @param userId ID del usuario a eliminar
     */
    @Transactional
    public void removeMemberFromTrip(Long tripId, Long userId) {
        Optional<TripMember> memberOptional = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (!memberOptional.isPresent()) {
            throw new ResourceNotFoundException("El usuario no es miembro de este viaje");
        }

        TripMember member = memberOptional.get();

        // No se puede remover el único owner
        if (member.getRole() == TripMemberRole.OWNER) {
            List<TripMember> owners = tripMemberRepository.findAllByTripId(tripId).stream()
                    .filter(m -> m.getRole() == TripMemberRole.OWNER)
                    .toList();
            
            if (owners.size() <= 1) {
                throw new ValidationException("No se puede remover el único propietario del viaje");
            }
        }

        tripMemberRepository.delete(member);
    }

    /**
     * Verifica si un usuario es miembro de un viaje.
     * 
     * @param tripId ID del viaje
     * @param userId ID del usuario
     * @return true si es miembro, false en caso contrario
     */
    @Transactional(readOnly = true)
    public boolean isMemberOfTrip(Long tripId, Long userId) {
        return tripMemberRepository.findByTripIdAndUserId(tripId, userId).isPresent();
    }

    /**
     * Verifica si un usuario tiene un rol específico en un viaje.
     * 
     * @param tripId ID del viaje
     * @param userId ID del usuario
     * @param role Rol a verificar
     * @return true si el usuario tiene el rol, false en caso contrario
     */
    @Transactional(readOnly = true)
    public boolean hasRole(Long tripId, Long userId, TripMemberRole role) {
        Optional<TripMember> memberOptional = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (!memberOptional.isPresent()) {
            return false;
        }
        return memberOptional.get().getRole() == role;
    }

    /**
     * Mapea TripMember a TripMemberDTO.
     */
    private TripMemberDTO mapToDTO(TripMember member) {
        TripMemberDTO dto = new TripMemberDTO();
        dto.setId(member.getId());
        dto.setTripId(member.getTrip().getId());
        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());

        // Mapear usuario
        UserDTO userDTO = new UserDTO();
        userDTO.setId(member.getUser().getId());
        userDTO.setName(member.getUser().getName());
        userDTO.setEmail(member.getUser().getEmail());
        userDTO.setRole(member.getUser().getRole());
        userDTO.setCreatedAt(member.getUser().getCreatedAt());
        dto.setUser(userDTO);

        return dto;
    }
}
