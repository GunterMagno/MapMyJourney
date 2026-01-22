package com.mapmyjourney.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para crear un nuevo viaje.
 */
public class TripCreateRequestDTO {

    @NotNull(message = "El título del viaje es obligatorio")
    @Size(min = 1, max = 20, message = "El título debe tener entre 1 y 20 caracteres")
    @JsonProperty("title")
    private String title;

    @NotNull(message = "El destino es obligatorio")
    @Size(min = 1, max = 20, message = "El destino debe tener entre 1 y 20 caracteres")
    @JsonProperty("destination")
    private String destination;

    @Size(max = 500)
    @JsonProperty("description")
    private String description;

    @Size(max = 2048)
    @JsonProperty("imageUrl")
    private String imageUrl;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @JsonProperty("startDate")
    private LocalDate startDate;

    @NotNull(message = "La fecha de fin es obligatoria")
    @JsonProperty("endDate")
    private LocalDate endDate;

    @NotNull(message = "El presupuesto es obligatorio")
    @DecimalMin(value = "0.01", message = "El presupuesto debe ser mayor a 0")
    @JsonProperty("budget")
    private BigDecimal budget;
    
    public TripCreateRequestDTO() {
    }
    
    public TripCreateRequestDTO(String title, String destination, String description, 
                               LocalDate startDate, LocalDate endDate, BigDecimal budget) {
        this.title = title;
        this.destination = destination;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.budget = budget;
    }

    public TripCreateRequestDTO(String title, String destination, String description, String imageUrl,
                               LocalDate startDate, LocalDate endDate, BigDecimal budget) {
        this.title = title;
        this.destination = destination;
        this.description = description;
        this.imageUrl = imageUrl;
        this.startDate = startDate;
        this.endDate = endDate;
        this.budget = budget;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDestination() {
        return destination;
    }
    
    public void setDestination(String destination) {
        this.destination = destination;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public BigDecimal getBudget() {
        return budget;
    }
    
    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }
}
