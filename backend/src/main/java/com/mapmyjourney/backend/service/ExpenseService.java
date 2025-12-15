package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.dto.ExpenseCreateRequestDTO;
import com.mapmyjourney.backend.dto.ExpenseDTO;
import com.mapmyjourney.backend.dto.ExpenseSplitDTO;
import com.mapmyjourney.backend.dto.UserDTO;
import com.mapmyjourney.backend.exception.ValidationException;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.model.Expense;
import com.mapmyjourney.backend.model.ExpenseSplit;
import com.mapmyjourney.backend.model.Trip;
import com.mapmyjourney.backend.model.User;
import com.mapmyjourney.backend.model.enums.ExpenseSplitType;
import com.mapmyjourney.backend.repository.ExpenseRepository;
import com.mapmyjourney.backend.repository.ExpenseSplitRepository;
import com.mapmyjourney.backend.repository.TripRepository;
import com.mapmyjourney.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    /**
     * Crea un nuevo gasto y divide entre participantes.
     */
    @Transactional
    public ExpenseDTO createExpense(Long tripId, ExpenseCreateRequestDTO request, Long creatorUserId) {
        // Obtener viaje
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new ResourceNotFoundException("Viaje no encontrado");
        }
        Trip trip = tripOptional.get();

        // Obtener usuario
        Optional<User> userOptional = userRepository.findById(creatorUserId);
        if (!userOptional.isPresent()) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        User creator = userOptional.get();

        // Validar monto
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("El monto debe ser mayor a 0");
        }

        // Validar participantes
        if (request.getParticipantUserIds() == null || request.getParticipantUserIds().isEmpty()) {
            throw new ValidationException("Debe haber al menos un participante");
        }

        // Crear gasto
        Expense expense = new Expense();
        expense.setTrip(trip);
        expense.setPaidBy(creator);
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setSplitType(request.getSplitType());
        expense.setReceiptUrl(request.getReceiptUrl());

        Expense savedExpense = expenseRepository.save(expense);

        // Crear divisiones (solo división equitativa por ahora)
        if (request.getSplitType() == ExpenseSplitType.EQUAL) {
            createEqualSplit(savedExpense, request.getParticipantUserIds());
        } else {
            throw new ValidationException("Solo se soporta división equitativa por ahora");
        }

        return mapToDTO(savedExpense);
    }

    /**
     * Obtiene todos los gastos de un viaje.
     */
    @Transactional(readOnly = true)
    public List<ExpenseDTO> getTripExpenses(Long tripId) {
        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        List<ExpenseDTO> result = new ArrayList<>();
        
        for (Expense expense : expenses) {
            result.add(mapToDTO(expense));
        }
        
        return result;
    }

    /**
     * Obtiene un gasto por ID.
     */
    @Transactional(readOnly = true)
    public ExpenseDTO getExpenseById(Long expenseId) {
        Optional<Expense> expenseOptional = expenseRepository.findById(expenseId);
        if (!expenseOptional.isPresent()) {
            throw new ResourceNotFoundException("Gasto no encontrado");
        }
        
        return mapToDTO(expenseOptional.get());
    }

    /**
     * Marca una división como pagada.
     */
    @Transactional
    public void markSplitAsPaid(Long splitId) {
        Optional<ExpenseSplit> splitOptional = expenseSplitRepository.findById(splitId);
        if (!splitOptional.isPresent()) {
            throw new ResourceNotFoundException("División no encontrada");
        }
        
        ExpenseSplit split = splitOptional.get();
        split.setPaid(true);
        expenseSplitRepository.save(split);
    }

    /**
     * Divide un gasto equitativamente entre los participantes.
     * Ejemplo: 100€ entre 4 personas = 25€ cada una
     */
    private void createEqualSplit(Expense expense, List<Long> participantIds) {
        // Calcular monto por persona
        int numParticipants = participantIds.size();
        BigDecimal splitAmount = expense.getAmount().divide(
                BigDecimal.valueOf(numParticipants), 2, java.math.RoundingMode.HALF_UP);

        // Crear una división para cada participante
        for (Long userId : participantIds) {
            Optional<User> userOptional = userRepository.findById(userId);
            if (!userOptional.isPresent()) {
                throw new ResourceNotFoundException("Usuario no encontrado");
            }
            User user = userOptional.get();

            ExpenseSplit split = new ExpenseSplit();
            split.setExpense(expense);
            split.setParticipant(user);
            split.setAmount(splitAmount);
            split.setPaid(false);

            expenseSplitRepository.save(split);
        }
    }

    /**
     * Convierte un Expense a ExpenseDTO.
     */
    private ExpenseDTO mapToDTO(Expense expense) {
        // Convertir splits
        List<ExpenseSplitDTO> splits = new ArrayList<>();
        
        for (ExpenseSplit split : expense.getSplits()) {
            ExpenseSplitDTO splitDTO = new ExpenseSplitDTO();
            splitDTO.setId(split.getId());
            splitDTO.setExpenseId(split.getExpense().getId());
            splitDTO.setAmount(split.getAmount());
            splitDTO.setPaid(split.isPaid());
            
            UserDTO userDTO = new UserDTO();
            userDTO.setId(split.getParticipant().getId());
            userDTO.setName(split.getParticipant().getName());
            userDTO.setEmail(split.getParticipant().getEmail());
            splitDTO.setParticipant(userDTO);
            
            splits.add(splitDTO);
        }

        // Convertir gasto
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount());
        dto.setExpenseDate(expense.getExpenseDate());
        dto.setSplitType(expense.getSplitType());
        
        UserDTO paidByDTO = new UserDTO();
        paidByDTO.setId(expense.getPaidBy().getId());
        paidByDTO.setName(expense.getPaidBy().getName());
        paidByDTO.setEmail(expense.getPaidBy().getEmail());
        dto.setPaidBy(paidByDTO);
        
        dto.setCreatedAt(expense.getCreatedAt());

        return dto;
    }
}
