package com.mapmyjourney.backend.repository;

import com.mapmyjourney.backend.model.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {

    /**
     * Obtiene todas las divisiones de un gasto.
     */
    List<ExpenseSplit> findByExpenseId(Long expenseId);

    /**
     * Obtiene todas las divisiones no pagadas de un usuario.
     */
    List<ExpenseSplit> findByParticipantUserIdAndPaidFalse(Long userId);
}
