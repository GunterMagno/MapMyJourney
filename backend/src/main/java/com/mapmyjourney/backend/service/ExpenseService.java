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
     * 1. Crea un nuevo gasto y divide entre participantes.
     * Valida que el viaje y los usuarios existan.
     * 
     * @param tripId ID del viaje donde se registra el gasto
     * @param request DTO con los datos del gasto
     * @param creatorUserId ID del usuario que crea el gasto (quien paga)
     * @return DTO del gasto creado
     * @throws ResourceNotFoundException si el viaje o usuario no existe
     * @throws ValidationException si el monto es inválido o no hay participantes
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
     * 2. Obtiene todos los gastos de un viaje.
     * 
     * @param tripId ID del viaje
     * @return Lista de DTOs de gastos del viaje
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
     * 3. Obtiene un gasto por ID.
     * 
     * @param expenseId ID del gasto
     * @return DTO del gasto encontrado
     * @throws ResourceNotFoundException si el gasto no existe
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
     * 4. Marca una división como pagada.
     * 
     * @param splitId ID de la división a marcar como pagada
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
     * 
     * @param expense Gasto a dividir
     * @param participantIds IDs de los usuarios participantes
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
     * Mapea un Expense a ExpenseDTO incluyendo sus divisiones.
     * 
     * @param expense Entidad de gasto
     * @return DTO del gasto con todas sus divisiones
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

    /**
     * Actualiza un gasto existente.
     * Solo quien pagó el gasto puede actualizarlo.
     * 
     * @param expenseId ID del gasto a actualizar
     * @param request DTO con los nuevos datos
     * @param userId ID del usuario que hace la actualización
     * @return DTO del gasto actualizado
     * @throws ResourceNotFoundException si el gasto no existe
     * @throws ValidationException si el usuario no es quien pagó o los datos son inválidos
     */
    @Transactional
    public ExpenseDTO updateExpense(Long expenseId, ExpenseCreateRequestDTO request, Long userId) {
        // Obtener gasto
        Optional<Expense> expenseOptional = expenseRepository.findById(expenseId);
        if (!expenseOptional.isPresent()) {
            throw new ResourceNotFoundException("Gasto no encontrado");
        }
        Expense expense = expenseOptional.get();

        // Verificar que el usuario es quien pagó
        if (!expense.getPaidBy().getId().equals(userId)) {
            throw new ValidationException("No tienes permisos para actualizar este gasto");
        }

        // Validar monto
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("El monto debe ser mayor a 0");
        }

        // Validar fechas
        if (request.getExpenseDate() != null && request.getExpenseDate().isAfter(java.time.LocalDate.now())) {
            throw new ValidationException("La fecha del gasto no puede ser en el futuro");
        }

        // Actualizar campos
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setReceiptUrl(request.getReceiptUrl());

        Expense updatedExpense = expenseRepository.save(expense);
        return mapToDTO(updatedExpense);
    }

    /**
     * Elimina un gasto.
     * Solo quien pagó el gasto puede eliminarlo.
     * 
     * @param expenseId ID del gasto a eliminar
     * @param userId ID del usuario que hace la eliminación
     * @throws ResourceNotFoundException si el gasto no existe
     * @throws ValidationException si el usuario no es quien pagó
     */
    @Transactional
    public void deleteExpense(Long expenseId, Long userId) {
        // Obtener gasto
        Optional<Expense> expenseOptional = expenseRepository.findById(expenseId);
        if (!expenseOptional.isPresent()) {
            throw new ResourceNotFoundException("Gasto no encontrado");
        }
        Expense expense = expenseOptional.get();

        // Verificar que el usuario es quien pagó
        if (!expense.getPaidBy().getId().equals(userId)) {
            throw new ValidationException("No tienes permisos para eliminar este gasto");
        }

        expenseRepository.delete(expense);
    }
}
