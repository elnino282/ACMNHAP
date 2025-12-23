package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Response.FarmerDashboardResponse;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FarmerDashboardService {

    SeasonRepository seasonRepository;
    TaskRepository taskRepository;
    ExpenseRepository expenseRepository;
    HarvestRepository harvestRepository;
    IncidentRepository incidentRepository;
    FieldLogRepository fieldLogRepository;
    FarmAccessService farmAccessService;

    public FarmerDashboardResponse getDashboard(User currentUser) {
        log.info("Fetching dashboard for farmer: {}", currentUser.getUsername());

        var farmerFarmIds = farmAccessService.getFarmerFarmIds(currentUser.getId());

        // Summary metrics
        var summary = buildSummaryMetrics(farmerFarmIds);

        // Recent activity
        var recentActivity = buildRecentActivity(farmerFarmIds);

        return FarmerDashboardResponse.builder()
                .summary(summary)
                .recentActivity(recentActivity)
                .build();
    }

    private FarmerDashboardResponse.SummaryMetrics buildSummaryMetrics(java.util.List<Integer> farmerFarmIds) {
        // Active seasons count
        Long activeSeasonsCount = seasonRepository.countByPlot_Farm_IdInAndStatus(
                farmerFarmIds,
                org.example.QuanLyMuaVu.Enums.SeasonStatus.ACTIVE);

        // Tasks due soon (next 7 days)
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysLater = today.plusDays(7);
        Long tasksDueSoonCount = taskRepository.countByUser_IdAndDueDateBetweenAndStatusNot(
                getCurrentUserId(),
                today,
                sevenDaysLater,
                org.example.QuanLyMuaVu.Enums.TaskStatus.DONE);

        // Total expenses this month
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        BigDecimal totalExpensesThisMonth = expenseRepository.sumTotalCostByExpenseDateBetween(
                firstDayOfMonth,
                today);

        // Total harvest last 30 days
        LocalDate thirtyDaysAgo = today.minusDays(30);
        BigDecimal totalHarvestLast30Days = harvestRepository.sumQuantityByHarvestDateBetween(
                thirtyDaysAgo,
                today);

        // Open incidents count
        Long openIncidentsCount = incidentRepository.countBySeason_Plot_Farm_IdInAndStatus(
                farmerFarmIds,
                org.example.QuanLyMuaVu.Enums.IncidentStatus.OPEN);

        return FarmerDashboardResponse.SummaryMetrics.builder()
                .activeSeasonsCount(activeSeasonsCount != null ? activeSeasonsCount : 0L)
                .tasksDueSoonCount(tasksDueSoonCount != null ? tasksDueSoonCount : 0L)
                .totalExpensesThisMonth(totalExpensesThisMonth != null ? totalExpensesThisMonth : BigDecimal.ZERO)
                .totalHarvestLast30Days(totalHarvestLast30Days != null ? totalHarvestLast30Days : BigDecimal.ZERO)
                .openIncidentsCount(openIncidentsCount != null ? openIncidentsCount : 0L)
                .build();
    }

    private FarmerDashboardResponse.RecentActivity buildRecentActivity(java.util.List<Integer> farmerFarmIds) {
        // Latest 5 tasks
        var latestTasks = taskRepository.findTop5ByUser_IdOrderByCreatedAtDesc(getCurrentUserId())
                .stream()
                .map(task -> FarmerDashboardResponse.TaskSummary.builder()
                        .taskId(task.getId())
                        .title(task.getTitle())
                        .status(task.getStatus().name())
                        .dueDate(task.getDueDate())
                        .seasonName(task.getSeason() != null ? task.getSeason().getSeasonName() : null)
                        .build())
                .collect(Collectors.toList());

        // Latest 5 expenses
        var latestExpenses = expenseRepository.findTop5ByUser_IdOrderByCreatedAtDesc(getCurrentUserId())
                .stream()
                .map(expense -> FarmerDashboardResponse.ExpenseSummary.builder()
                        .expenseId(expense.getId())
                        .itemName(expense.getItemName())
                        .totalCost(expense.getTotalCost())
                        .expenseDate(expense.getExpenseDate())
                        .seasonName(expense.getSeason() != null ? expense.getSeason().getSeasonName() : null)
                        .build())
                .collect(Collectors.toList());

        // Latest 5 field logs
        var latestFieldLogs = fieldLogRepository.findTop5BySeason_Plot_Farm_IdInOrderByLogDateDesc(farmerFarmIds)
                .stream()
                .map(log -> FarmerDashboardResponse.FieldLogSummary.builder()
                        .fieldLogId(log.getId())
                        .logType(log.getLogType())
                        .logDate(log.getLogDate())
                        .notes(log.getNotes())
                        .seasonName(log.getSeason() != null ? log.getSeason().getSeasonName() : null)
                        .build())
                .collect(Collectors.toList());

        return FarmerDashboardResponse.RecentActivity.builder()
                .latestTasks(latestTasks)
                .latestExpenses(latestExpenses)
                .latestFieldLogs(latestFieldLogs)
                .build();
    }

    private Long getCurrentUserId() {
        // This will be replaced with actual SecurityContext user ID
        // For now, using a placeholder
        return 2L; // farmer0
    }
}
