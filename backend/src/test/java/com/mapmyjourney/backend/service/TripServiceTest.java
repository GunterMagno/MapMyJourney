package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.dto.TripCreateRequestDTO;
import com.mapmyjourney.backend.dto.TripDTO;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.exception.ValidationException;
import com.mapmyjourney.backend.model.Trip;
import com.mapmyjourney.backend.model.User;
import com.mapmyjourney.backend.repository.TripMemberRepository;
import com.mapmyjourney.backend.repository.TripRepository;
import com.mapmyjourney.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para TripService
 */
@ExtendWith(MockitoExtension.class)
public class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripMemberRepository tripMemberRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TripService tripService;

    private User testUser;
    private Trip testTrip;
    private TripCreateRequestDTO createRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Juan Pérez");
        testUser.setEmail("juan@example.com");

        testTrip = new Trip();
        testTrip.setId(1L);
        testTrip.setTitle("Viaje a Paris");
        testTrip.setDestination("París");
        testTrip.setTripCode("ABC12345");
        testTrip.setStartDate(LocalDate.of(2024, 7, 1));
        testTrip.setEndDate(LocalDate.of(2024, 7, 7));
        testTrip.setBudget(new BigDecimal("1000.00"));

        createRequest = new TripCreateRequestDTO();
        createRequest.setTitle("Viaje a Paris");
        createRequest.setDestination("París");
        createRequest.setStartDate(LocalDate.of(2024, 7, 1));
        createRequest.setEndDate(LocalDate.of(2024, 7, 7));
        createRequest.setBudget(new BigDecimal("1000.00"));
    }

    @Test
    void testCreateTripSuccess() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(tripRepository.save(any(Trip.class))).thenReturn(testTrip);
        when(tripMemberRepository.save(any())).thenReturn(null);

        // Act
        TripDTO createdTrip = tripService.createTrip(createRequest, 1L);

        // Assert
        assertNotNull(createdTrip);
        assertEquals("Viaje a Paris", createdTrip.getTitle());
        verify(userRepository, times(1)).findById(1L);
        verify(tripRepository, times(1)).save(any(Trip.class));
    }

    @Test
    void testCreateTripWithUserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            tripService.createTrip(createRequest, 999L);
        });
    }

    @Test
    void testCreateTripWithInvalidDates() {
        // Arrange
        createRequest.setEndDate(LocalDate.of(2024, 6, 1)); // Anterior a startDate

        // Act & Assert
        assertThrows(ValidationException.class, () -> {
            tripService.createTrip(createRequest, 1L);
        });
    }

    @Test
    void testGetTripByIdSuccess() {
        // Arrange
        when(tripRepository.findById(1L)).thenReturn(Optional.of(testTrip));

        // Act
        TripDTO trip = tripService.getTripById(1L);

        // Assert
        assertNotNull(trip);
        assertEquals("Viaje a Paris", trip.getTitle());
        verify(tripRepository, times(1)).findById(1L);
    }

    @Test
    void testGetTripByIdNotFound() {
        // Arrange
        when(tripRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            tripService.getTripById(999L);
        });
    }
}
