package com.mapmyjourney.backend.controller;

import com.mapmyjourney.backend.dto.ExpenseCreateRequestDTO;
import com.mapmyjourney.backend.dto.ExpenseDTO;
import com.mapmyjourney.backend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestionar gastos en viajes.
 */
@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    /**
     * 1. Crea un nuevo gasto en el viaje.
     * POST /api/trips/{tripId}/expenses
     */
    @PostMapping
    public ResponseEntity<ExpenseDTO> createExpense(@PathVariable Long tripId, @RequestBody ExpenseCreateRequestDTO request) {
        // TODO: Obtener userId del contexto de seguridad
        Long userId = 1L; // Placeholder
        ExpenseDTO createdExpense = expenseService.createExpense(tripId, request, userId);
        return ResponseEntity.status(201).body(createdExpense);
    }

    /**
     * 2. Obtiene todos los gastos del viaje.
     * GET /api/trips/{tripId}/expenses
     */
    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getTripExpenses(@PathVariable Long tripId) {
        List<ExpenseDTO> expenses = expenseService.getTripExpenses(tripId);
        return ResponseEntity.ok(expenses);
    }

    /**
     * 3. Obtiene un gasto por ID.
     * GET /api/trips/{tripId}/expenses/{expenseId}
     */
    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseDTO> getExpense(@PathVariable Long tripId, @PathVariable Long expenseId) {
        ExpenseDTO expense = expenseService.getExpenseById(expenseId);
        return ResponseEntity.ok(expense);
    }

    /**
     * 4. Actualiza un gasto.
     * PUT /api/trips/{tripId}/expenses/{expenseId}
     * Solo quien lo pagó puede actualizarlo.
     */
    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseDTO> updateExpense(@PathVariable Long tripId, @PathVariable Long expenseId, @RequestBody ExpenseCreateRequestDTO request) {
        // TODO: Obtener userId del contexto de seguridad
        Long userId = 1L; // Placeholder
        ExpenseDTO updatedExpense = expenseService.updateExpense(expenseId, request, userId);
        return ResponseEntity.ok(updatedExpense);
    }

    /**
     * 5. Elimina un gasto.
     * DELETE /api/trips/{tripId}/expenses/{expenseId}
     * Solo quien lo pagó puede eliminarlo.
     */
    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long tripId, @PathVariable Long expenseId) {
        // TODO: Obtener userId del contexto de seguridad
        Long userId = 1L; // Placeholder
        expenseService.deleteExpense(expenseId, userId);
        return ResponseEntity.noContent().build();
    }

}