package com.mapmyjourney.backend.repository;

import com.mapmyjourney.backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    /**
     * Busca un viaje por su código único (para invitaciones).
     */
    Optional<Trip> findByTripCode(String tripCode);

    /**
     * Obtiene todos los viajes donde el usuario es miembro.
     */
    @Query("SELECT t FROM Trip t JOIN t.members m WHERE m.user.id = :userId")
    List<Trip> findAllByUserId(@Param("userId") Long userId);
}
