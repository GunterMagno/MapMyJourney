package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.dto.ExpenseCreateRequestDTO;
import com.mapmyjourney.backend.dto.ExpenseDTO;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.model.Expense;
import com.mapmyjourney.backend.model.Trip;
import com.mapmyjourney.backend.model.User;
import com.mapmyjourney.backend.model.enums.ExpenseSplitType;
import com.mapmyjourney.backend.repository.ExpenseRepository;
import com.mapmyjourney.backend.repository.ExpenseSplitRepository;
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
 * Tests unitarios para ExpenseService
 */
@ExtendWith(MockitoExtension.class)
public class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ExpenseSplitRepository expenseSplitRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private User testUser;
    private Trip testTrip;
    private Expense testExpense;
    private ExpenseCreateRequestDTO createRequest;

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

        testExpense = new Expense();
        testExpense.setId(1L);
        testExpense.setDescription("Cena en restaurante");
        testExpense.setAmount(new BigDecimal("100.00"));
        testExpense.setExpenseDate(LocalDate.of(2024, 7, 1));
        testExpense.setTrip(testTrip);
        testExpense.setPaidBy(testUser);
        testExpense.setSplitType(ExpenseSplitType.EQUAL);

        createRequest = new ExpenseCreateRequestDTO();
        createRequest.setDescription("Cena en restaurante");
        createRequest.setAmount(new BigDecimal("100.00"));
        createRequest.setExpenseDate(LocalDate.of(2024, 7, 1));
        createRequest.setSplitType(ExpenseSplitType.EQUAL);
    }

    @Test
    void testGetExpenseByIdSuccess() {
        // Arrange
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));

        // Act
        ExpenseDTO expense = expenseService.getExpenseById(1L);

        // Assert
        assertNotNull(expense);
        assertEquals("Cena en restaurante", expense.getDescription());
        assertEquals(new BigDecimal("100.00"), expense.getAmount());
        verify(expenseRepository, times(1)).findById(1L);
    }

    @Test
    void testGetExpenseByIdNotFound() {
        // Arrange
        when(expenseRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            expenseService.getExpenseById(999L);
        });
    }

    @Test
    void testDeleteExpenseSuccess() {
        // Arrange
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));
        doNothing().when(expenseRepository).delete(any(Expense.class));

        // Act
        expenseService.deleteExpense(1L, 1L);

        // Assert
        verify(expenseRepository, times(1)).delete(any(Expense.class));
    }

    @Test
    void testDeleteExpenseNotFound() {
        // Arrange
        when(expenseRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            expenseService.deleteExpense(999L, 1L);
        });
    }
}
