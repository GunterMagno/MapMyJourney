package com.mapmyjourney.backend.service;

import com.mapmyjourney.backend.dto.ExpenseSplitDTO;
import com.mapmyjourney.backend.dto.UserDTO;
import com.mapmyjourney.backend.exception.ValidationException;
import com.mapmyjourney.backend.exception.ResourceNotFoundException;
import com.mapmyjourney.backend.model.Expense;
import com.mapmyjourney.backend.model.ExpenseSplit;
import com.mapmyjourney.backend.model.User;
import com.mapmyjourney.backend.repository.ExpenseSplitRepository;
import com.mapmyjourney.backend.repository.ExpenseRepository;
import com.mapmyjourney.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestionar las divisiones de gastos.
 * Maneja la creación, actualización y liquidación de divisiones de gastos.
 */
@Service
@RequiredArgsConstructor
public class ExpenseSplitService {

    private final ExpenseSplitRepository expenseSplitRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    /**
     * Crea una nueva división de gasto.
     * 
     * @param expenseId ID del gasto
     * @param participantUserId ID del usuario participante
     * @param amount Monto que debe pagar este usuario
     * @param percentage Porcentaje (opcional, para divisiones por porcentaje)
     * @return DTO de la división creada
     */
    @Transactional
    public ExpenseSplitDTO createSplit(Long expenseId, Long participantUserId, BigDecimal amount, BigDecimal percentage) {
        // Validar que el gasto existe
        Optional<Expense> expenseOptional = expenseRepository.findById(expenseId);
        if (!expenseOptional.isPresent()) {
            throw new ResourceNotFoundException("Gasto no encontrado");
        }
        Expense expense = expenseOptional.get();

        // Validar que el usuario existe
        Optional<User> userOptional = userRepository.findById(participantUserId);
        if (!userOptional.isPresent()) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        User participant = userOptional.get();

        // Validar monto
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("El monto debe ser mayor a 0");
        }

        // Verificar que no existe ya una división para este usuario en este gasto
        List<ExpenseSplit> existingSplits = expenseSplitRepository.findByExpenseId(expenseId);
        for (ExpenseSplit split : existingSplits) {
            if (split.getParticipant().getId().equals(participantUserId)) {
                throw new ValidationException("Ya existe una división para este usuario en este gasto");
            }
        }

        // Crear división
        ExpenseSplit split = ExpenseSplit.builder()
                .expense(expense)
                .participant(participant)
                .amount(amount)
                .percentage(percentage)
                .paid(false)
                .createdAt(LocalDateTime.now())
                .build();

        ExpenseSplit savedSplit = expenseSplitRepository.save(split);
        return mapToDTO(savedSplit);
    }

    /**
     * Obtiene todas las divisiones de un gasto.
     * 
     * @param expenseId ID del gasto
     * @return Lista de DTOs de divisiones
     */
    @Transactional(readOnly = true)
    public List<ExpenseSplitDTO> getExpenseSplits(Long expenseId) {
        // Validar que el gasto existe
        if (!expenseRepository.existsById(expenseId)) {
            throw new ResourceNotFoundException("Gasto no encontrado");
        }

        List<ExpenseSplit> splits = expenseSplitRepository.findByExpenseId(expenseId);
        List<ExpenseSplitDTO> dtos = new ArrayList<>();

        for (ExpenseSplit split : splits) {
            dtos.add(mapToDTO(split));
        }

        return dtos;
    }

    /**
     * Obtiene todas las deudas pendientes de un usuario.
     * 
     * @param userId ID del usuario
     * @return Lista de DTOs de divisiones pendientes
     */
    @Transactional(readOnly = true)
    public List<ExpenseSplitDTO> getUserPendingDebts(Long userId) {
        // Validar que el usuario existe
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }

        List<ExpenseSplit> splits = expenseSplitRepository.findByParticipantIdAndPaidFalse(userId);
        List<ExpenseSplitDTO> dtos = new ArrayList<>();

        for (ExpenseSplit split : splits) {
            dtos.add(mapToDTO(split));
        }

        return dtos;
    }

    /**
     * Marca una división como pagada.
     * 
     * @param splitId ID de la división
     * @return DTO de la división actualizada
     */
    @Transactional
    public ExpenseSplitDTO markAsPaid(Long splitId) {
        Optional<ExpenseSplit> splitOptional = expenseSplitRepository.findById(splitId);
        if (!splitOptional.isPresent()) {
            throw new ResourceNotFoundException("División de gasto no encontrada");
        }

        ExpenseSplit split = splitOptional.get();
        split.setPaid(true);
        ExpenseSplit updatedSplit = expenseSplitRepository.save(split);
        return mapToDTO(updatedSplit);
    }

    /**
     * Marca una división como no pagada.
     * 
     * @param splitId ID de la división
     * @return DTO de la división actualizada
     */
    @Transactional
    public ExpenseSplitDTO markAsUnpaid(Long splitId) {
        Optional<ExpenseSplit> splitOptional = expenseSplitRepository.findById(splitId);
        if (!splitOptional.isPresent()) {
            throw new ResourceNotFoundException("División de gasto no encontrada");
        }

        ExpenseSplit split = splitOptional.get();
        split.setPaid(false);
        ExpenseSplit updatedSplit = expenseSplitRepository.save(split);
        return mapToDTO(updatedSplit);
    }

    /**
     * Obtiene una división específica por ID.
     * 
     * @param splitId ID de la división
     * @return DTO de la división
     */
    @Transactional(readOnly = true)
    public ExpenseSplitDTO getSplit(Long splitId) {
        Optional<ExpenseSplit> splitOptional = expenseSplitRepository.findById(splitId);
        if (!splitOptional.isPresent()) {
            throw new ResourceNotFoundException("División de gasto no encontrada");
        }

        return mapToDTO(splitOptional.get());
    }

    /**
     * Elimina una división de gasto.
     * 
     * @param splitId ID de la división
     */
    @Transactional
    public void deleteSplit(Long splitId) {
        Optional<ExpenseSplit> splitOptional = expenseSplitRepository.findById(splitId);
        if (!splitOptional.isPresent()) {
            throw new ResourceNotFoundException("División de gasto no encontrada");
        }

        expenseSplitRepository.delete(splitOptional.get());
    }

    /**
     * Calcula el total de deudas pendientes de un usuario.
     * 
     * @param userId ID del usuario
     * @return Total de deudas pendientes
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalPendingDebt(Long userId) {
        List<ExpenseSplit> pendingSplits = expenseSplitRepository.findByParticipantIdAndPaidFalse(userId);
        
        BigDecimal total = BigDecimal.ZERO;
        for (ExpenseSplit split : pendingSplits) {
            total = total.add(split.getAmount());
        }
        
        return total;
    }

    /**
     * Actualiza el monto de una división.
     * 
     * @param splitId ID de la división
     * @param newAmount Nuevo monto
     * @return DTO de la división actualizada
     */
    @Transactional
    public ExpenseSplitDTO updateSplitAmount(Long splitId, BigDecimal newAmount) {
        Optional<ExpenseSplit> splitOptional = expenseSplitRepository.findById(splitId);
        if (!splitOptional.isPresent()) {
            throw new ResourceNotFoundException("División de gasto no encontrada");
        }

        if (newAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("El monto debe ser mayor a 0");
        }

        ExpenseSplit split = splitOptional.get();
        split.setAmount(newAmount);
        ExpenseSplit updatedSplit = expenseSplitRepository.save(split);
        return mapToDTO(updatedSplit);
    }

    /**
     * Mapea ExpenseSplit a ExpenseSplitDTO.
     */
    private ExpenseSplitDTO mapToDTO(ExpenseSplit split) {
        ExpenseSplitDTO dto = new ExpenseSplitDTO();
        dto.setId(split.getId());
        dto.setExpenseId(split.getExpense().getId());
        dto.setAmount(split.getAmount());
        dto.setPercentage(split.getPercentage());
        dto.setPaid(split.isPaid());

        // Mapear usuario participante
        UserDTO participantDTO = new UserDTO();
        participantDTO.setId(split.getParticipant().getId());
        participantDTO.setName(split.getParticipant().getName());
        participantDTO.setEmail(split.getParticipant().getEmail());
        participantDTO.setRole(split.getParticipant().getRole());
        participantDTO.setCreatedAt(split.getParticipant().getCreatedAt());
        dto.setParticipant(participantDTO);

        return dto;
    }
}
