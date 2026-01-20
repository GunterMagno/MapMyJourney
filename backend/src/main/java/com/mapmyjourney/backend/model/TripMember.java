package com.mapmyjourney.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.mapmyjourney.backend.model.enums.TripMemberRole;

import java.time.LocalDateTime;

/**
 * Entidad que representa la relación entre un Usuario y un Viaje.
 * Define el rol y los permisos del usuario dentro de un viaje específico.
 */
@Entity
@Table(name = "trip_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "trip_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripMember {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "trip_members_id_gen")
    @SequenceGenerator(name = "trip_members_id_gen", sequenceName = "trip_members_id_seq", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TripMemberRole role = TripMemberRole.VIEWER;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();

    /**
     * Verifica si este miembro tiene el permiso requerido.
     */
    public boolean hasPermission(TripMemberRole required) {
        return role.hasPermission(required);
    }

    /**
     * Verifica si este miembro es el propietario del viaje.
     */
    public boolean isOwner() {
        return role == TripMemberRole.OWNER;
    }
}
