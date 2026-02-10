package com.mapmyjourney.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mapmyjourney.backend.dto.TripNoteRequestDTO;
import com.mapmyjourney.backend.dto.TripNoteResponseDTO;
import com.mapmyjourney.backend.service.TripNoteService;

import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/trips/{tripId}/notes")
@RequiredArgsConstructor
@Tag(name = "Notes", description = "API de gestion de notas")
public class TripNoteController {
    private final TripNoteService tripNoteService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Registrar nueva nota", 
               description = "Registra un nueva nota en el viaje.")
    @ApiResponse(responseCode = "201", description = "Nota registrado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Viaje no encontrado")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    public ResponseEntity<TripNoteResponseDTO> createTripNote(
        @Parameter(description = "Id del Viaje", example = "1")
        @PathVariable Long tripId,
        @Valid @org.springframework.web.bind.annotation.RequestBody
        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos de la nota a registrar") 
        TripNoteRequestDTO request){
            TripNoteResponseDTO createdNote = tripNoteService.createNote(tripId, request);
            return ResponseEntity.status(201).body(createdNote);
        }
}
