package com.mapmyjourney.backend.repository;

import com.mapmyjourney.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Busca un usuario por su email.
     * @param email el email del usuario
     * @return Optional con el usuario si existe
     */
    Optional<User> findByEmail(String email);

    /**
     * Verifica si existe un usuario con ese email.
     * @param email el email a verificar
     * @return true si existe, false si no
     */
    boolean existsByEmail(String email);
}
