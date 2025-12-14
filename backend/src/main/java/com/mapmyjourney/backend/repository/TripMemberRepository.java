package com.mapmyjourney.backend.repository;

import com.mapmyjourney.backend.model.TripMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripMemberRepository extends JpaRepository<TripMember, Long> {

    /**
     * Obtiene el rol de un usuario en un viaje.
     */
    Optional<TripMember> findByTripIdAndUserId(Long tripId, Long userId);

    /**
     * Obtiene todos los miembros de un viaje.
     */
    List<TripMember> findAllByTripId(Long tripId);
}
