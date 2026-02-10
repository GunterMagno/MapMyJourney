package com.mapmyjourney.backend.model;

import jakarta.persistence.*;
import jakarta.persistence.SequenceGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripNote {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "trips_note_id_gen")
    @SequenceGenerator(name = "trips_note_id_gen", sequenceName = "trips_note_id_gen", allocationSize = 1)
    private Long id;
}
