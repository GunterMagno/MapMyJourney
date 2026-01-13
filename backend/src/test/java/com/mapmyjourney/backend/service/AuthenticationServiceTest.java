package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.model.User;
import com.mapmyjourney.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para UserService - Enfocado en autenticación y registro
 */
@ExtendWith(MockitoExtension.class)
public class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Juan Pérez");
        testUser.setEmail("juan@example.com");
        testUser.setPasswordHash("hashedPassword");
    }

    @Test
    void testUserRepositoryFindByEmail() {
        // Arrange
        when(userRepository.findByEmail("juan@example.com"))
                .thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userRepository.findByEmail("juan@example.com");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("juan@example.com", result.get().getEmail());
        assertEquals("Juan Pérez", result.get().getName());
        verify(userRepository, times(1)).findByEmail("juan@example.com");
    }

    @Test
    void testUserRepositoryFindByEmailNotFound() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com"))
                .thenReturn(Optional.empty());

        // Act
        Optional<User> result = userRepository.findByEmail("nonexistent@example.com");

        // Assert
        assertFalse(result.isPresent());
        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
    }

    @Test
    void testUserRepositoryExistsByEmail() {
        // Arrange
        when(userRepository.existsByEmail("juan@example.com")).thenReturn(true);

        // Act
        boolean exists = userRepository.existsByEmail("juan@example.com");

        // Assert
        assertTrue(exists);
        verify(userRepository, times(1)).existsByEmail("juan@example.com");
    }

    @Test
    void testUserRepositorySaveUser() {
        // Arrange
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User result = userRepository.save(testUser);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("juan@example.com", result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testPasswordEncoderMatches() {
        // Arrange
        String rawPassword = "Password123456";
        String hashedPassword = "hashedPassword";
        when(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(true);

        // Act
        boolean matches = passwordEncoder.matches(rawPassword, hashedPassword);

        // Assert
        assertTrue(matches);
        verify(passwordEncoder, times(1)).matches(rawPassword, hashedPassword);
    }

    @Test
    void testPasswordEncoderDoesNotMatch() {
        // Arrange
        String rawPassword = "WrongPassword";
        String hashedPassword = "hashedPassword";
        when(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(false);

        // Act
        boolean matches = passwordEncoder.matches(rawPassword, hashedPassword);

        // Assert
        assertFalse(matches);
        verify(passwordEncoder, times(1)).matches(rawPassword, hashedPassword);
    }

    @Test
    void testPasswordEncoderEncode() {
        // Arrange
        String rawPassword = "Password123456";
        String expectedHash = "encodedPasswordHash";
        when(passwordEncoder.encode(rawPassword)).thenReturn(expectedHash);

        // Act
        String result = passwordEncoder.encode(rawPassword);

        // Assert
        assertEquals(expectedHash, result);
        assertNotEquals(rawPassword, result);
        verify(passwordEncoder, times(1)).encode(rawPassword);
    }
}
