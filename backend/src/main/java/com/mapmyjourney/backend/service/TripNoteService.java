package com.mapmyjourney.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.mapmyjourney.backend.dto.TripNoteResponseDTO;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.model.Trip;
import com.mapmyjourney.backend.model.TripNote;
import com.mapmyjourney.backend.repository.TripNoteRepository;
import com.mapmyjourney.backend.repository.TripRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class TripNoteService {
    private final TripRepository tripRepository;
    private final TripNoteRepository tripNoteRepository;

    @Transactional
    public TripNoteResponseDTO createNote(Long tripId, TripNoteResponseDTO request){
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }

        Trip trip = tripOptional.get();

        TripNote note = new TripNote();
        note.setTrip(trip);
        note.setContent(request.getContent());

        TripNote savedNote = tripNoteRepository.save(note);

        return mapToDTO(savedNote);
    }

    @Transactional()
    public List<TripNoteResponseDTO> getTripNotes(Long tripId) {
        List<TripNote> notes = tripNoteRepository.findAllByTripId(tripId);
        List<TripNoteResponseDTO> result = new ArrayList<>();

        for( TripNote note : notes) {
            result.add(mapToDTO(note));
        }

        return result;
    }

    private TripNoteResponseDTO mapToDTO(TripNote note) {
        TripNoteResponseDTO dto = new TripNoteResponseDTO();
        dto.setId(note.getId());
        dto.setContent(note.getContent());
        dto.setCreatedAt(note.getCreatedAt());

        return dto;
    }
}
