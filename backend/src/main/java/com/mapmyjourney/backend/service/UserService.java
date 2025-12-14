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
     * Registra un nuevo usuario.
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
     * Obtiene un usuario por ID.
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
     * Obtiene un usuario por email.
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
