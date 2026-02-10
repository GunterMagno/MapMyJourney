package com.mapmyjourney.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripNoteRequestDTO {
    
    @NotBlank(message = "El contenido no puede estar vacío")
    @Size(min = 5, max = 500)
    private String content;

}
