package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.dto.UserCreateRequestDTO;
import com.mapmyjourney.backend.dto.UserDTO;
import com.mapmyjourney.backend.dto.LoginResponseDTO;
import com.mapmyjourney.backend.exception.DuplicateResourceException;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.model.User;
import com.mapmyjourney.backend.repository.UserRepository;
import com.mapmyjourney.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

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
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    /**
     * Registra un nuevo usuario y lo autentica automáticamente.
     * Retorna un token JWT junto con los datos del usuario.
     * 
     * @param request DTO con los datos del usuario
     * @return LoginResponseDTO con token JWT y datos del usuario
     * @throws DuplicateResourceException si el email ya existe
     */
    @Transactional
    public LoginResponseDTO registerUserAndAuthenticate(UserCreateRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("El email ya está registrado");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        // Autentica al usuario automáticamente
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Genera el token JWT
        String token = jwtTokenProvider.generateToken(authentication);
        long expiresIn = jwtTokenProvider.getExpirationTime();

        // Retorna respuesta con token y datos del usuario
        return new LoginResponseDTO(token, expiresIn, mapToDTO(savedUser));
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
     * Obtiene el ID del usuario a partir del email.
     * 
     * @param email Email del usuario
     * @return ID del usuario
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @Transactional(readOnly = true)
    public Long getUserIdByEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (!userOptional.isPresent()) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        
        return userOptional.get().getId();
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
     * 6. Autentica un usuario con email y contraseña.
     * 
     * @param email Email del usuario
     * @param password Contraseña en texto plano
     * @return LoginResponseDTO con token JWT y datos del usuario
     * @throws ResourceNotFoundException si el usuario no existe
     * @throws org.springframework.security.authentication.BadCredentialsException si la contraseña es incorrecta
     */
    @Transactional(readOnly = true)
    public LoginResponseDTO authenticate(String email, String password) {
        // Validar que email y password no sean nulos
        if (email == null || email.trim().isEmpty()) {
            throw new ResourceNotFoundException("El email es requerido");
        }
        if (password == null || password.isEmpty()) {
            throw new ResourceNotFoundException("La contraseña es requerida");
        }
        
        // Verifica que el usuario exista
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));

        // Autentica usando AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        // Genera el token JWT
        String token = jwtTokenProvider.generateToken(authentication);
        long expiresIn = jwtTokenProvider.getExpirationTime();

        // Retorna respuesta con token y datos del usuario
        return new LoginResponseDTO(token, expiresIn, mapToDTO(user));
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
