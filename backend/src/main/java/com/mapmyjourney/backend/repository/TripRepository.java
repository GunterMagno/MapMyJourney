package com.mapmyjourney.backend.repository;

import com.mapmyjourney.backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    /**
     * Busca un viaje por su código único (para invitaciones).
     */
    Optional<Trip> findByTripCode(String tripCode);
}
