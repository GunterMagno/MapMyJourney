package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.dto.TripCreateRequestDTO;
import com.mapmyjourney.backend.dto.TripDTO;
import com.mapmyjourney.backend.exception.ValidationException;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.model.Trip;
import com.mapmyjourney.backend.model.TripMember;
import com.mapmyjourney.backend.model.User;
import com.mapmyjourney.backend.model.enums.TripMemberRole;
import com.mapmyjourney.backend.repository.TripRepository;
import com.mapmyjourney.backend.repository.TripMemberRepository;
import com.mapmyjourney.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final TripMemberRepository tripMemberRepository;
    private final UserRepository userRepository;

    /**
     * Crea un nuevo viaje.
     */
    @Transactional
    public TripDTO createTrip(TripCreateRequestDTO request, Long creatorUserId) {
        // Validar fechas
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ValidationException("La fecha de fin no puede ser anterior a la de inicio");
        }

        // Obtener usuario creador
        Optional<User> creatorOptional = userRepository.findById(creatorUserId);
        if (!creatorOptional.isPresent()) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        User creator = creatorOptional.get();

        // Crear viaje
        Trip trip = new Trip();
        trip.setTitle(request.getTitle());
        trip.setDestination(request.getDestination());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudget(request.getBudget());
        trip.setTripCode(generateTripCode());

        Trip savedTrip = tripRepository.save(trip);

        // Agregar creador como OWNER
        TripMember owner = new TripMember();
        owner.setTrip(savedTrip);
        owner.setUser(creator);
        owner.setRole(TripMemberRole.OWNER);

        tripMemberRepository.save(owner);

        return mapToDTO(savedTrip);
    }

    /**
     * Obtiene un viaje por ID.
     */
    @Transactional(readOnly = true)
    public TripDTO getTripById(Long tripId) {
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }
        
        return mapToDTO(tripOptional.get());
    }

    /**
     * Obtiene todos los viajes del usuario.
     */
    @Transactional(readOnly = true)
    public List<TripDTO> getUserTrips(Long userId) {
        List<Trip> userTrips = tripRepository.findAllByUserId(userId);
        return userTrips.stream()
            .map(this::mapToDTO)
            .toList();
    }

    /**
     * Agrega un usuario a un viaje con rol VIEWER.
     */
    @Transactional
    public void addMemberToTrip(Long tripId, Long userId) {
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }
        Trip trip = tripOptional.get();

        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        User user = userOptional.get();

        // Verificar que no sea miembro ya
        for (TripMember member : trip.getMembers()) {
            if (member.getUser().getId().equals(userId)) {
                throw new ValidationException("El usuario ya es miembro del viaje");
            }
        }

        TripMember newMember = new TripMember();
        newMember.setTrip(trip);
        newMember.setUser(user);
        newMember.setRole(TripMemberRole.VIEWER);

        tripMemberRepository.save(newMember);
    }

    /**
     * Obtiene un viaje por su código (para invitaciones).
     */
    @Transactional(readOnly = true)
    public TripDTO getTripByCode(String tripCode) {
        Optional<Trip> tripOptional = tripRepository.findByTripCode(tripCode);
        if (!tripOptional.isPresent()) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }
        
        return mapToDTO(tripOptional.get());
    }

    /**
     * Verifica que un usuario pertenece a un viaje.
     */
    @Transactional(readOnly = true)
    public void verifyUserInTrip(Long tripId, Long userId) {
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }
        Trip trip = tripOptional.get();

        boolean isMember = false;
        for (TripMember member : trip.getMembers()) {
            if (member.getUser().getId().equals(userId)) {
                isMember = true;
                break;
            }
        }

        if (!isMember) {
            throw new ValidationException("No eres miembro de este viaje");
        }
    }

    /**
     * Actualiza un viaje existente.
     * Solo el OWNER puede actualizar.
     */
    @Transactional
    public TripDTO updateTrip(Long tripId, TripCreateRequestDTO request, Long userId) {
        // Obtener viaje
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }
        Trip trip = tripOptional.get();

        // Verificar que el usuario es OWNER
        Optional<TripMember> memberOptional = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (!memberOptional.isPresent() || !memberOptional.get().isOwner()) {
            throw new ValidationException("No tienes permisos para actualizar este viaje");
        }

        // Validar fechas
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ValidationException("La fecha de fin no puede ser anterior a la de inicio");
        }

        // Actualizar campos
        trip.setTitle(request.getTitle());
        trip.setDestination(request.getDestination());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudget(request.getBudget());

        Trip updatedTrip = tripRepository.save(trip);
        return mapToDTO(updatedTrip);
    }

    /**
     * Elimina un viaje.
     * Solo el OWNER puede eliminar.
     */
    @Transactional
    public void deleteTrip(Long tripId, Long userId) {
        // Obtener viaje
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }
        Trip trip = tripOptional.get();

        // Verificar que el usuario es OWNER
        Optional<TripMember> memberOptional = tripMemberRepository.findByTripIdAndUserId(tripId, userId);
        if (!memberOptional.isPresent() || !memberOptional.get().isOwner()) {
            throw new ValidationException("No tienes permisos para eliminar este viaje");
        }

        tripRepository.delete(trip);
    }

    /**
     * Genera un código único de 8 caracteres.
     */
    private String generateTripCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Mapea Trip a TripDTO.
     */
    private TripDTO mapToDTO(Trip trip) {
        TripDTO dto = new TripDTO();
        dto.setId(trip.getId());
        dto.setTitle(trip.getTitle());
        dto.setDestination(trip.getDestination());
        dto.setDescription(trip.getDescription());
        dto.setStartDate(trip.getStartDate());
        dto.setEndDate(trip.getEndDate());
        dto.setBudget(trip.getBudget());
        dto.setTripCode(trip.getTripCode());
        dto.setCreatedAt(trip.getCreatedAt());
        dto.setUpdatedAt(trip.getUpdatedAt());
        
        return dto;
    }
}
