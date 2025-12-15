package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.dto.LoginResponseDTO;
import com.mapmyjourney.backend.dto.UserCreateRequestDTO;
import com.mapmyjourney.backend.dto.UserDTO;
import com.mapmyjourney.backend.exception.DuplicateResourceException;
import com.mapmyjourney.backend.model.User;
import com.mapmyjourney.backend.repository.UserRepository;
import com.mapmyjourney.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para UserService
 */
@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private UserService userService;

    private UserCreateRequestDTO validRequest;
    private User existingUser;

    @BeforeEach
    void setUp() {
        validRequest = new UserCreateRequestDTO();
        validRequest.setName("Juan Pérez");
        validRequest.setEmail("juan@example.com");
        validRequest.setPassword("Password123456");

        existingUser = new User();
        existingUser.setId(1L);
        existingUser.setName("Juan Pérez");
        existingUser.setEmail("juan@example.com");
        existingUser.setPasswordHash("hashedPassword");
    }

    @Test
    void testRegisterUserSuccess() {
        // Arrange
        when(userRepository.existsByEmail(validRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(validRequest.getPassword())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        // Act
        UserDTO result = userService.registerUser(validRequest);

        // Assert
        assertNotNull(result);
        assertEquals("juan@example.com", result.getEmail());
        assertEquals("Juan Pérez", result.getName());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterUserEmailAlreadyExists() {
        // Arrange
        when(userRepository.existsByEmail(validRequest.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateResourceException.class, () -> {
            userService.registerUser(validRequest);
        });
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testGetUserByIdSuccess() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));

        // Act
        UserDTO result = userService.getUserById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("juan@example.com", result.getEmail());
    }

    @Test
    void testAuthenticateUserSuccess() {
        // Arrange
        Authentication authMock = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authMock);
        when(userRepository.findByEmail("juan@example.com")).thenReturn(Optional.of(existingUser));
        when(jwtTokenProvider.generateToken(authMock)).thenReturn("jwt-token-xyz");
        when(jwtTokenProvider.getExpirationTime()).thenReturn(86400000L);

        // Act
        LoginResponseDTO result = userService.authenticate("juan@example.com", "Password123456");

        // Assert
        assertNotNull(result);
        assertEquals("jwt-token-xyz", result.getToken());
        assertEquals("Bearer", result.getType());
        assertEquals(86400000L, result.getExpiresIn());
    }

    @Test
    void testAuthenticateUserNotFound() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(Exception.class, () -> {
            userService.authenticate("nonexistent@example.com", "Password123456");
        });
    }
}
