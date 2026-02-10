package com.mapmyjourney.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.mapmyjourney.backend.dto.TripNoteRequestDTO;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.model.Trip;
import com.mapmyjourney.backend.model.TripNote;
import com.mapmyjourney.backend.repository.TripNoteRepository;
import com.mapmyjourney.backend.repository.TripRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripNoteService {
    private final TripRepository tripRepository;
    private final TripNoteRepository tripNoteRepository;

    @Transactional
    public TripNoteRequestDTO createNote(Long tripId, TripNoteRequestDTO request){
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }

        Trip trip = tripOptional.get();

        TripNote note = new TripNote();
        note.setTrip(trip);
        note.setContent(request.getContent());

        TripNote savedNote = tripNoteRepository.
    }
}
