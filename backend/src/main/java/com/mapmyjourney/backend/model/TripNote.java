package com.mapmyjourney.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "trip_notes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trip_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripNote {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "trips_note_id_gen")
    @SequenceGenerator(name = "trips_note_id_gen", sequenceName = "trips_note_id_gen", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Size(min = 5, max = 500, message = "La nota debe tener entre 5 y 500 caraceres")
    @Column(nullable = false)
    private String content;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
