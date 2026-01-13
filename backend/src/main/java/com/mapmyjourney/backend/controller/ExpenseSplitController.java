package com.mapmyjourney.backend.controller;

import com.mapmyjourney.backend.dto.CreateSplitRequestDTO;
import com.mapmyjourney.backend.dto.ExpenseSplitDTO;
import com.mapmyjourney.backend.service.ExpenseSplitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.List;

/**
 * Controlador REST para gestionar divisiones de gastos.
 */
@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
@Tag(name = "ExpenseSplits", description = "API de gestión de divisiones de gastos - Dividir, pagar, ver deudas")
public class ExpenseSplitController {

    private final ExpenseSplitService expenseSplitService;

    /**
     * 1. Crea una nueva división de gasto.
     * POST /api/expenses/{expenseId}/splits
     */
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/{expenseId}/splits")
    @Operation(summary = "Crear división de gasto", 
               description = "Crea una nueva división para que un participante deba pagar su parte del gasto")
    @ApiResponse(responseCode = "201", description = "División creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos (monto, participante)")
    @ApiResponse(responseCode = "404", description = "Gasto no encontrado")
    public ResponseEntity<ExpenseSplitDTO> createSplit(
            @Parameter(description = "ID del gasto", example = "1")
            @PathVariable Long expenseId,
            @Valid @org.springframework.web.bind.annotation.RequestBody
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos de la división") 
            CreateSplitRequestDTO request) {
        ExpenseSplitDTO createdSplit = expenseSplitService.createSplit(expenseId, request.getParticipantUserId(),
                request.getAmount(), request.getPercentage());
        return ResponseEntity.status(201).body(createdSplit);
    }

    /**
     * 2. Obtiene todas las divisiones de un gasto.
     * GET /api/expenses/{expenseId}/splits
     */
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{expenseId}/splits")
    @Operation(summary = "Listar divisiones del gasto", 
               description = "Obtiene todas las divisiones de un gasto específico")
    @ApiResponse(responseCode = "200", description = "Lista de divisiones")
    @ApiResponse(responseCode = "404", description = "Gasto no encontrado")
    public ResponseEntity<List<ExpenseSplitDTO>> getExpenseSplits(
            @Parameter(description = "ID del gasto", example = "1")
            @PathVariable Long expenseId) {
        List<ExpenseSplitDTO> splits = expenseSplitService.getExpenseSplits(expenseId);
        return ResponseEntity.ok(splits);
    }

    /**
     * 3. Obtiene una división específica.
     * GET /api/expenses/{expenseId}/splits/{splitId}
     */
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{expenseId}/splits/{splitId}")
    @Operation(summary = "Obtener división específica", 
               description = "Recupera los detalles de una división de gasto")
    @ApiResponse(responseCode = "200", description = "División encontrada")
    @ApiResponse(responseCode = "404", description = "División no encontrada")
    public ResponseEntity<ExpenseSplitDTO> getSplit(
            @Parameter(description = "ID del gasto", example = "1")
            @PathVariable Long expenseId, 
            @Parameter(description = "ID de la división", example = "10")
            @PathVariable Long splitId) {
        ExpenseSplitDTO split = expenseSplitService.getSplit(splitId);
        return ResponseEntity.ok(split);
    }

    /**
     * 4. Marca una división como pagada.
     * PUT /api/expenses/{expenseId}/splits/{splitId}/pay
     */
    @PreAuthorize("hasRole('USER')")
    @PutMapping("/{expenseId}/splits/{splitId}/pay")
    @Operation(summary = "Marcar división como pagada", 
               description = "Marca una deuda como saldada")
    @ApiResponse(responseCode = "200", description = "División marcada como pagada")
    @ApiResponse(responseCode = "404", description = "División no encontrada")
    public ResponseEntity<ExpenseSplitDTO> markSplitAsPaid(
            @Parameter(description = "ID del gasto", example = "1")
            @PathVariable Long expenseId, 
            @Parameter(description = "ID de la división", example = "10")
            @PathVariable Long splitId) {
        ExpenseSplitDTO updatedSplit = expenseSplitService.markAsPaid(splitId);
        return ResponseEntity.ok(updatedSplit);
    }

    /**
     * 5. Marca una división como no pagada.
     * PUT /api/expenses/{expenseId}/splits/{splitId}/unpay
     */
    @PreAuthorize("hasRole('USER')")
    @PutMapping("/{expenseId}/splits/{splitId}/unpay")
    @Operation(summary = "Marcar división como no pagada", 
               description = "Revierte el estado de pagado de una deuda")
    @ApiResponse(responseCode = "200", description = "División marcada como no pagada")
    @ApiResponse(responseCode = "404", description = "División no encontrada")
    public ResponseEntity<ExpenseSplitDTO> markSplitAsUnpaid(
            @Parameter(description = "ID del gasto", example = "1")
            @PathVariable Long expenseId, 
            @Parameter(description = "ID de la división", example = "10")
            @PathVariable Long splitId) {
        ExpenseSplitDTO updatedSplit = expenseSplitService.markAsUnpaid(splitId);
        return ResponseEntity.ok(updatedSplit);
    }

    /**
     * 6. Elimina una división de gasto.
     * DELETE /api/expenses/{expenseId}/splits/{splitId}
     */
    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{expenseId}/splits/{splitId}")
    @Operation(summary = "Eliminar división", 
               description = "Elimina una división de gasto")
    @ApiResponse(responseCode = "204", description = "División eliminada exitosamente")
    @ApiResponse(responseCode = "404", description = "División no encontrada")
    public ResponseEntity<Void> deleteSplit(
            @Parameter(description = "ID del gasto", example = "1")
            @PathVariable Long expenseId, 
            @Parameter(description = "ID de la división", example = "10")
            @PathVariable Long splitId) {
        expenseSplitService.deleteSplit(splitId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 7. Obtiene las deudas pendientes de un usuario.
     * GET /api/users/{userId}/pending-debts
     */
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/users/{userId}/pending-debts")
    @Operation(summary = "Obtener deudas pendientes", 
               description = "Lista todas las deudas pendientes de un usuario en todos sus viajes")
    @ApiResponse(responseCode = "200", description = "Lista de deudas pendientes")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public ResponseEntity<List<ExpenseSplitDTO>> getUserPendingDebts(
            @Parameter(description = "ID del usuario", example = "1")
            @PathVariable Long userId) {
        List<ExpenseSplitDTO> pendingDebts = expenseSplitService.getUserPendingDebts(userId);
        return ResponseEntity.ok(pendingDebts);
    }

    /**
     * 8. Calcula la deuda total de un usuario.
     * GET /api/users/{userId}/total-debt
     */
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/users/{userId}/total-debt")
    @Operation(summary = "Calcular deuda total", 
               description = "Calcula la cantidad total que un usuario debe en todos sus viajes")
    @ApiResponse(responseCode = "200", description = "Deuda total del usuario")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public ResponseEntity<BigDecimal> getTotalPendingDebt(
            @Parameter(description = "ID del usuario", example = "1")
            @PathVariable Long userId) {
        BigDecimal totalDebt = expenseSplitService.getTotalPendingDebt(userId);
        return ResponseEntity.ok(totalDebt);
    }
}
