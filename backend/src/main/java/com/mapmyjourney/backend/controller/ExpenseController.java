package com.mapmyjourney.backend.controller;

import com.mapmyjourney.backend.dto.ExpenseCreateRequestDTO;
import com.mapmyjourney.backend.dto.ExpenseDTO;
import com.mapmyjourney.backend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

/**
 * Controlador REST para gestionar gastos en viajes.
 */
@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "API de gestión de gastos - Registrar, actualizar, dividir gastos")
public class ExpenseController {

    private final ExpenseService expenseService;

    /**
     * 1. Crea un nuevo gasto en el viaje.
     * POST /api/trips/{tripId}/expenses
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Registrar nuevo gasto", 
               description = "Registra un nuevo gasto en el viaje. Se divide automáticamente entre los participantes especificados")
    @ApiResponse(responseCode = "201", description = "Gasto registrado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos (monto, participantes, etc)")
    @ApiResponse(responseCode = "404", description = "Viaje no encontrado")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    public ResponseEntity<ExpenseDTO> createExpense(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId, 
            @Valid @RequestBody(description = "Datos del gasto a registrar") ExpenseCreateRequestDTO request) {
        Long userId = extractUserIdFromContext();
        ExpenseDTO createdExpense = expenseService.createExpense(tripId, request, userId);
        return ResponseEntity.status(201).body(createdExpense);
    }

    /**
     * 2. Obtiene todos los gastos del viaje (con paginación).
     * GET /api/trips/{tripId}/expenses?page=0&amp;size=20&amp;sort=expenseDate,desc
     */
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Listar gastos del viaje", 
               description = "Obtiene todos los gastos registrados en el viaje con opciones de paginación")
    @ApiResponse(responseCode = "200", description = "Lista de gastos del viaje")
    @ApiResponse(responseCode = "404", description = "Viaje no encontrado")
    public ResponseEntity<List<ExpenseDTO>> getTripExpenses(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId,
            @Parameter(description = "Número de página (comienza en 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad de registros por página", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        List<ExpenseDTO> expenses = expenseService.getTripExpenses(tripId);
        return ResponseEntity.ok(expenses);
    }

    /**
     * 3. Obtiene un gasto por ID.
     * GET /api/trips/{tripId}/expenses/{expenseId}
     */
    @GetMapping("/{expenseId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Obtener gasto por ID", 
               description = "Recupera los detalles de un gasto específico incluyendo su división")
    @ApiResponse(responseCode = "200", description = "Gasto encontrado con sus detalles")
    @ApiResponse(responseCode = "404", description = "Gasto no encontrado")
    public ResponseEntity<ExpenseDTO> getExpense(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId, 
            @Parameter(description = "ID del gasto", example = "5")
            @PathVariable Long expenseId) {
        ExpenseDTO expense = expenseService.getExpenseById(expenseId);
        return ResponseEntity.ok(expense);
    }

    /**
     * 4. Actualiza un gasto.
     * PUT /api/trips/{tripId}/expenses/{expenseId}
     * Solo quien lo pagó puede actualizarlo.
     */
    @PutMapping("/{expenseId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Actualizar gasto", 
               description = "Actualiza los detalles de un gasto (solo quien lo registró puede hacerlo)")
    @ApiResponse(responseCode = "200", description = "Gasto actualizado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Gasto no encontrado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos (solo quien lo registró puede editar)")
    public ResponseEntity<ExpenseDTO> updateExpense(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId, 
            @Parameter(description = "ID del gasto a actualizar", example = "5")
            @PathVariable Long expenseId, 
            @Valid @RequestBody(description = "Nuevos datos del gasto") ExpenseCreateRequestDTO request) {
        Long userId = extractUserIdFromContext();
        ExpenseDTO updatedExpense = expenseService.updateExpense(expenseId, request, userId);
        return ResponseEntity.ok(updatedExpense);
    }

    /**
     * 5. Elimina un gasto.
     * DELETE /api/trips/{tripId}/expenses/{expenseId}
     * Solo quien lo pagó puede eliminarlo.
     */
    @DeleteMapping("/{expenseId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Eliminar gasto", 
               description = "Elimina permanentemente un gasto (solo quien lo registró puede hacerlo)")
    @ApiResponse(responseCode = "204", description = "Gasto eliminado exitosamente")
    @ApiResponse(responseCode = "404", description = "Gasto no encontrado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos (solo quien lo registró puede eliminar)")
    public ResponseEntity<Void> deleteExpense(
            @Parameter(description = "ID del viaje", example = "1")
            @PathVariable Long tripId, 
            @Parameter(description = "ID del gasto a eliminar", example = "5")
            @PathVariable Long expenseId) {
        Long userId = extractUserIdFromContext();
        expenseService.deleteExpense(expenseId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Extrae el userId del contexto de seguridad de Spring Security.
     */
    private Long extractUserIdFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        // TODO: Obtener userId a partir del email desde UserService
        return 1L;
    }

}