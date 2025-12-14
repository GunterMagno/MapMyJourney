package com.mapmyjourney.backend.repository;

import com.mapmyjourney.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /**
     * Obtiene todos los gastos de un viaje.
     */
    List<Expense> findByTripId(Long tripId);
}
