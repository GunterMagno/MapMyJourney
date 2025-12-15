package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.dto.UserCreateRequestDTO;
import com.mapmyjourney.backend.dto.UserDTO;
import com.mapmyjourney.backend.exception.DuplicateResourceException;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.model.User;
import com.mapmyjourney.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * 1. Registra un nuevo usuario.
     * Verifica que el email no esté ya registrado.
     * 
     * @param request DTO con los datos del usuario
     * @return DTO del usuario creado
     * @throws DuplicateResourceException si el email ya existe
     */
    @Transactional
    public UserDTO registerUser(UserCreateRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("El email ya está registrado");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(request.getPassword()); // TODO: Hashear con BCrypt

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    /**
     * 2. Obtiene un usuario por ID.
     * 
     * @param userId ID del usuario
     * @return DTO del usuario encontrado
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        
        return mapToDTO(userOptional.get());
    }

    /**
     * 3. Obtiene un usuario por email.
     * 
     * @param email Email del usuario
     * @return DTO del usuario encontrado
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (!userOptional.isPresent()) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        
        return mapToDTO(userOptional.get());
    }

    /**
     * 4. Actualiza un usuario existente.
     * Verifica que el nuevo email no esté en uso por otro usuario.
     * 
     * @param userId ID del usuario a actualizar
     * @param request DTO con los nuevos datos
     * @return DTO del usuario actualizado
     * @throws ResourceNotFoundException si el usuario no existe
     * @throws DuplicateResourceException si el nuevo email ya existe
     */
    @Transactional
    public UserDTO updateUser(Long userId, UserCreateRequestDTO request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        // Verificar si el email ya está en uso por otro usuario
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("El email ya está registrado");
        }
        
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(request.getPassword()); // TODO: Hashear con BCrypt
        
        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    /**
     * 5. Elimina un usuario.
     * 
     * @param userId ID del usuario a eliminar
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        userRepository.delete(user);
    }

    /**
     * Mapea User a UserDTO.
     */
    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        
        return dto;
    }
}
