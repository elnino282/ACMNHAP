package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {

    List<Expense> findByItemNameContainingIgnoreCase(String itemName);

    List<Expense> findAllBySeason_Id(Integer seasonId);

    List<Expense> findAllBySeason_IdAndExpenseDateBetween(Integer seasonId, LocalDate from, LocalDate to);

    boolean existsBySeason_Id(Integer seasonId);

    /**
     * Sum total cost of expenses within date range.
     * Used by FarmerDashboardService for monthly expense metrics.
     */
    @Query("SELECT COALESCE(SUM(e.totalCost), 0) FROM Expense e WHERE e.expenseDate BETWEEN :start AND :end")
    BigDecimal sumTotalCostByExpenseDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * Find latest 5 expenses by user ID.
     * Used by FarmerDashboardService for recent activity.
     */
    List<Expense> findTop5ByUser_IdOrderByCreatedAtDesc(Long userId);
}
