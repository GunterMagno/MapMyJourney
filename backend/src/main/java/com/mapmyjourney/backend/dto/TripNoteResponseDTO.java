package com.mapmyjourney.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripNoteResponseDTO {
    
    private Long id;

    @NotBlank(message = "El contenido de la nota no puede estar vacío.")
    @Size(min = 5, max = 500)
    private String content;

    private LocalDateTime createdAt;
}
