package com.mapmyjourney.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.mapmyjourney.backend.model.TripNote;

public interface TripNoteRepository extends JpaRepository<TripNote, Long>{

    List<TripNote> findAllByTripId(Long tripId);
    
} 
