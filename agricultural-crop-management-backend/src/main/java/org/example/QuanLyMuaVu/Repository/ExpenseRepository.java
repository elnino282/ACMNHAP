package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.DTO.Response.AdminReportProjections;
import org.example.QuanLyMuaVu.Entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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

    /**
     * Sum expenses grouped by season ID for given season IDs.
     * Uses projection interface for type-safety.
     * Used by AdminReportsService for Cost/Profit reports.
     */
    @Query("SELECT e.season.id AS seasonId, COALESCE(SUM(e.totalCost), 0) AS totalExpense " +
            "FROM Expense e WHERE e.season.id IN :seasonIds GROUP BY e.season.id")
    List<AdminReportProjections.SeasonExpenseAgg> sumExpensesBySeasonIds(
            @Param("seasonIds") java.util.Set<Integer> seasonIds);
}
