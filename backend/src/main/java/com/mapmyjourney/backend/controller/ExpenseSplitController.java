package com.mapmyjourney.backend.controller;

import com.mapmyjourney.backend.dto.CreateSplitRequestDTO;
import com.mapmyjourney.backend.dto.ExpenseSplitDTO;
import com.mapmyjourney.backend.service.ExpenseSplitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Controlador REST para gestionar divisiones de gastos.
 */
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseSplitController {

    private final ExpenseSplitService expenseSplitService;

    /**
     * 1. Crea una nueva división de gasto.
     * POST /api/expenses/{expenseId}/splits
     */
    @PostMapping("/{expenseId}/splits")
    public ResponseEntity<ExpenseSplitDTO> createSplit(@PathVariable Long expenseId, @RequestBody CreateSplitRequestDTO request) {
        ExpenseSplitDTO createdSplit = expenseSplitService.createSplit(expenseId, request.getParticipantUserId(),
                request.getAmount(), request.getPercentage());
        return ResponseEntity.status(201).body(createdSplit);
    }

    /**
     * 2. Obtiene todas las divisiones de un gasto.
     * GET /api/expenses/{expenseId}/splits
     */
    @GetMapping("/{expenseId}/splits")
    public ResponseEntity<List<ExpenseSplitDTO>> getExpenseSplits(@PathVariable Long expenseId) {
        List<ExpenseSplitDTO> splits = expenseSplitService.getExpenseSplits(expenseId);
        return ResponseEntity.ok(splits);
    }

    /**
     * 3. Obtiene una división específica.
     * GET /api/expenses/{expenseId}/splits/{splitId}
     */
    @GetMapping("/{expenseId}/splits/{splitId}")
    public ResponseEntity<ExpenseSplitDTO> getSplit(@PathVariable Long expenseId, @PathVariable Long splitId) {
        ExpenseSplitDTO split = expenseSplitService.getSplit(splitId);
        return ResponseEntity.ok(split);
    }

    /**
     * 4. Marca una división como pagada.
     * PUT /api/expenses/{expenseId}/splits/{splitId}/pay
     */
    @PutMapping("/{expenseId}/splits/{splitId}/pay")
    public ResponseEntity<ExpenseSplitDTO> markSplitAsPaid(@PathVariable Long expenseId, @PathVariable Long splitId) {
        ExpenseSplitDTO updatedSplit = expenseSplitService.markAsPaid(splitId);
        return ResponseEntity.ok(updatedSplit);
    }

    /**
     * 5. Marca una división como no pagada.
     * PUT /api/expenses/{expenseId}/splits/{splitId}/unpay
     */
    @PutMapping("/{expenseId}/splits/{splitId}/unpay")
    public ResponseEntity<ExpenseSplitDTO> markSplitAsUnpaid(@PathVariable Long expenseId, @PathVariable Long splitId) {
        ExpenseSplitDTO updatedSplit = expenseSplitService.markAsUnpaid(splitId);
        return ResponseEntity.ok(updatedSplit);
    }

    /**
     * 6. Elimina una división de gasto.
     * DELETE /api/expenses/{expenseId}/splits/{splitId}
     */
    @DeleteMapping("/{expenseId}/splits/{splitId}")
    public ResponseEntity<Void> deleteSplit(@PathVariable Long expenseId, @PathVariable Long splitId) {
        expenseSplitService.deleteSplit(splitId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 7. Obtiene las deudas pendientes de un usuario.
     * GET /api/users/{userId}/pending-debts
     */
    @GetMapping("/users/{userId}/pending-debts")
    public ResponseEntity<List<ExpenseSplitDTO>> getUserPendingDebts(@PathVariable Long userId) {
        List<ExpenseSplitDTO> pendingDebts = expenseSplitService.getUserPendingDebts(userId);
        return ResponseEntity.ok(pendingDebts);
    }

    /**
     * 8. Calcula la deuda total de un usuario.
     * GET /api/users/{userId}/total-debt
     */
    @GetMapping("/users/{userId}/total-debt")
    public ResponseEntity<BigDecimal> getTotalPendingDebt(@PathVariable Long userId) {
        BigDecimal totalDebt = expenseSplitService.getTotalPendingDebt(userId);
        return ResponseEntity.ok(totalDebt);
    }
}
