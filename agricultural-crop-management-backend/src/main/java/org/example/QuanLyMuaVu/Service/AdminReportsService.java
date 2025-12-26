package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Response.AdminReportResponse;
import org.example.QuanLyMuaVu.Entity.*;
import org.example.QuanLyMuaVu.Enums.IncidentStatus;
import org.example.QuanLyMuaVu.Enums.TaskStatus;
import org.example.QuanLyMuaVu.Repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminReportsService {

        ExpenseRepository expenseRepository;
        HarvestRepository harvestRepository;
        IncidentRepository incidentRepository;
        StockMovementRepository stockMovementRepository;
        SeasonRepository seasonRepository;
        TaskRepository taskRepository;
        WarehouseRepository warehouseRepository;
        SupplyLotRepository supplyLotRepository;
        InventoryBalanceRepository inventoryBalanceRepository;

        // ═══════════════════════════════════════════════════════════════
        // LEGACY METHODS (backward compatibility)
        // ═══════════════════════════════════════════════════════════════

        public List<AdminReportResponse.MonthlyTotal> getExpensesByMonth(Integer year) {
                log.info("Generating expenses by month report for year: {}", year);

                int targetYear = year != null ? year : LocalDate.now().getYear();

                var expenses = expenseRepository.findAll();

                Map<Integer, BigDecimal> monthlyTotals = expenses.stream()
                                .filter(e -> e.getExpenseDate() != null && e.getExpenseDate().getYear() == targetYear)
                                .collect(Collectors.groupingBy(
                                                e -> e.getExpenseDate().getMonthValue(),
                                                Collectors.reducing(BigDecimal.ZERO,
                                                                e -> e.getTotalCost() != null ? e.getTotalCost()
                                                                                : BigDecimal.ZERO,
                                                                BigDecimal::add)));

                return monthlyTotals.entrySet().stream()
                                .map(entry -> AdminReportResponse.MonthlyTotal.builder()
                                                .year(targetYear)
                                                .month(entry.getKey())
                                                .total(entry.getValue())
                                                .build())
                                .sorted(Comparator.comparing(AdminReportResponse.MonthlyTotal::getMonth))
                                .collect(Collectors.toList());
        }

        public List<AdminReportResponse.SeasonHarvest> getHarvestBySeason() {
                log.info("Generating harvest by season report");

                var harvests = harvestRepository.findAll();

                Map<Integer, BigDecimal> seasonTotals = harvests.stream()
                                .filter(h -> h.getSeason() != null)
                                .collect(Collectors.groupingBy(
                                                h -> h.getSeason().getId(),
                                                Collectors.reducing(BigDecimal.ZERO,
                                                                h -> h.getQuantity() != null ? h.getQuantity()
                                                                                : BigDecimal.ZERO,
                                                                BigDecimal::add)));

                return seasonTotals.entrySet().stream()
                                .map(entry -> {
                                        var season = seasonRepository.findById(entry.getKey()).orElse(null);
                                        return AdminReportResponse.SeasonHarvest.builder()
                                                        .seasonId(entry.getKey())
                                                        .seasonName(season != null ? season.getSeasonName() : null)
                                                        .cropName(season != null && season.getCrop() != null
                                                                        ? season.getCrop().getCropName()
                                                                        : null)
                                                        .totalQuantity(entry.getValue())
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        public AdminReportResponse.IncidentsSummary getIncidentsSummary() {
                log.info("Generating incidents summary report");

                var incidents = incidentRepository.findAll();

                Map<String, Long> bySeverity = incidents.stream()
                                .filter(i -> i.getSeverity() != null)
                                .collect(Collectors.groupingBy(
                                                i -> i.getSeverity().name(),
                                                Collectors.counting()));

                Map<String, Long> byStatus = incidents.stream()
                                .filter(i -> i.getStatus() != null)
                                .collect(Collectors.groupingBy(
                                                i -> i.getStatus().name(),
                                                Collectors.counting()));

                return AdminReportResponse.IncidentsSummary.builder()
                                .bySeverity(bySeverity)
                                .byStatus(byStatus)
                                .totalCount((long) incidents.size())
                                .build();
        }

        public List<AdminReportResponse.MovementSummary> getInventoryMovements(Integer year) {
                log.info("Generating inventory movements report for year: {}", year);

                int targetYear = year != null ? year : LocalDate.now().getYear();

                var movements = stockMovementRepository.findAll();

                return movements.stream()
                                .filter(m -> m.getMovementDate() != null && m.getMovementDate().getYear() == targetYear)
                                .collect(Collectors.groupingBy(
                                                m -> m.getMovementDate().getMonthValue() + "-" +
                                                                (m.getMovementType() != null
                                                                                ? m.getMovementType().name()
                                                                                : "UNKNOWN"),
                                                Collectors.reducing(BigDecimal.ZERO,
                                                                m -> m.getQuantity() != null ? m.getQuantity()
                                                                                : BigDecimal.ZERO,
                                                                BigDecimal::add)))
                                .entrySet().stream()
                                .map(entry -> {
                                        String[] parts = entry.getKey().split("-");
                                        return AdminReportResponse.MovementSummary.builder()
                                                        .year(targetYear)
                                                        .month(Integer.parseInt(parts[0]))
                                                        .movementType(parts.length > 1 ? parts[1] : null)
                                                        .totalQuantity(entry.getValue())
                                                        .build();
                                })
                                .sorted(Comparator.comparing(AdminReportResponse.MovementSummary::getMonth))
                                .collect(Collectors.toList());
        }

        // ═══════════════════════════════════════════════════════════════
        // NEW ANALYTICS METHODS
        // ═══════════════════════════════════════════════════════════════

        /**
         * Yield Report: Expected vs Actual yield by season/crop/plot.
         * Filter by year (season.start_date) and optionally by cropId.
         */
        public List<AdminReportResponse.YieldReport> getYieldReport(Integer year, Integer cropId) {
                log.info("Generating yield report for year: {}, cropId: {}", year, cropId);

                try {
                        int targetYear = year != null ? year : LocalDate.now().getYear();

                        // Get all seasons, filter by year and cropId
                        var seasons = seasonRepository.findAll().stream()
                                        .filter(s -> s.getStartDate() != null
                                                        && s.getStartDate().getYear() == targetYear)
                                        .filter(s -> cropId == null
                                                        || (s.getCrop() != null && s.getCrop().getId().equals(cropId)))
                                        .collect(Collectors.toList());

                        // Get all harvests and group by seasonId
                        Map<Integer, BigDecimal> harvestBySeasonId = harvestRepository.findAll().stream()
                                        .filter(h -> h.getSeason() != null)
                                        .collect(Collectors.groupingBy(
                                                        h -> h.getSeason().getId(),
                                                        Collectors.reducing(BigDecimal.ZERO,
                                                                        h -> h.getQuantity() != null ? h.getQuantity()
                                                                                        : BigDecimal.ZERO,
                                                                        BigDecimal::add)));

                        return seasons.stream()
                                        .map(season -> {
                                                BigDecimal expected = season.getExpectedYieldKg();
                                                BigDecimal actual = harvestBySeasonId.getOrDefault(season.getId(),
                                                                BigDecimal.ZERO);

                                                // Calculate variance percent
                                                BigDecimal variance = null;
                                                if (expected != null && expected.compareTo(BigDecimal.ZERO) > 0) {
                                                        variance = actual.subtract(expected)
                                                                        .divide(expected, 2, RoundingMode.HALF_UP)
                                                                        .multiply(BigDecimal.valueOf(100));
                                                }

                                                // Get plot and farm names
                                                Plot plot = season.getPlot();
                                                Farm farm = plot != null ? plot.getFarm() : null;

                                                return AdminReportResponse.YieldReport.builder()
                                                                .seasonId(season.getId())
                                                                .seasonName(season.getSeasonName())
                                                                .cropName(season.getCrop() != null
                                                                                ? season.getCrop().getCropName()
                                                                                : null)
                                                                .plotName(plot != null ? plot.getPlotName() : null)
                                                                .farmName(farm != null ? farm.getName() : null)
                                                                .expectedYieldKg(expected)
                                                                .actualYieldKg(actual)
                                                                .variancePercent(variance)
                                                                .build();
                                        })
                                        .sorted(Comparator.comparing(AdminReportResponse.YieldReport::getSeasonId))
                                        .collect(Collectors.toList());
                } catch (Exception e) {
                        log.error("Error generating yield report: {}", e.getMessage(), e);
                        // Return empty list instead of failing
                        return Collections.emptyList();
                }
        }

        /**
         * Cost Report: Total expenses per season with cost/kg calculation.
         * Filter by year (season.start_date).
         */
        public List<AdminReportResponse.CostReport> getCostReport(Integer year) {
                log.info("Generating cost report for year: {}", year);

                int targetYear = year != null ? year : LocalDate.now().getYear();

                // Get all seasons for target year
                var seasons = seasonRepository.findAll().stream()
                                .filter(s -> s.getStartDate() != null && s.getStartDate().getYear() == targetYear)
                                .collect(Collectors.toList());

                // Get all expenses grouped by seasonId
                Map<Integer, BigDecimal> expenseBySeasonId = expenseRepository.findAll().stream()
                                .filter(e -> e.getSeason() != null)
                                .collect(Collectors.groupingBy(
                                                e -> e.getSeason().getId(),
                                                Collectors.reducing(BigDecimal.ZERO,
                                                                e -> e.getTotalCost() != null ? e.getTotalCost()
                                                                                : BigDecimal.ZERO,
                                                                BigDecimal::add)));

                // Get all harvests grouped by seasonId
                Map<Integer, BigDecimal> harvestBySeasonId = harvestRepository.findAll().stream()
                                .filter(h -> h.getSeason() != null)
                                .collect(Collectors.groupingBy(
                                                h -> h.getSeason().getId(),
                                                Collectors.reducing(BigDecimal.ZERO,
                                                                h -> h.getQuantity() != null ? h.getQuantity()
                                                                                : BigDecimal.ZERO,
                                                                BigDecimal::add)));

                return seasons.stream()
                                .map(season -> {
                                        BigDecimal totalExpense = expenseBySeasonId.getOrDefault(season.getId(),
                                                        BigDecimal.ZERO);
                                        BigDecimal totalYield = harvestBySeasonId.getOrDefault(season.getId(),
                                                        BigDecimal.ZERO);

                                        // Calculate cost per kg
                                        BigDecimal costPerKg = null;
                                        if (totalYield.compareTo(BigDecimal.ZERO) > 0) {
                                                costPerKg = totalExpense.divide(totalYield, 2, RoundingMode.HALF_UP);
                                        }

                                        return AdminReportResponse.CostReport.builder()
                                                        .seasonId(season.getId())
                                                        .seasonName(season.getSeasonName())
                                                        .cropName(season.getCrop() != null
                                                                        ? season.getCrop().getCropName()
                                                                        : null)
                                                        .totalExpense(totalExpense)
                                                        .totalYieldKg(totalYield)
                                                        .costPerKg(costPerKg)
                                                        .build();
                                })
                                .sorted(Comparator.comparing(AdminReportResponse.CostReport::getSeasonId))
                                .collect(Collectors.toList());
        }

        /**
         * Revenue Report: Total revenue from harvests.
         * harvests.unit = price per kg (VND)
         * totalRevenue = SUM(quantity * unit)
         */
        public List<AdminReportResponse.RevenueReport> getRevenueReport(Integer year) {
                log.info("Generating revenue report for year: {}", year);

                int targetYear = year != null ? year : LocalDate.now().getYear();

                // Get all seasons for target year
                var seasons = seasonRepository.findAll().stream()
                                .filter(s -> s.getStartDate() != null && s.getStartDate().getYear() == targetYear)
                                .collect(Collectors.toList());

                Set<Integer> seasonIds = seasons.stream()
                                .map(Season::getId)
                                .collect(Collectors.toSet());

                // Get all harvests for these seasons
                var allHarvests = harvestRepository.findAll().stream()
                                .filter(h -> h.getSeason() != null && seasonIds.contains(h.getSeason().getId()))
                                .collect(Collectors.toList());

                // Group harvests by seasonId and calculate revenue
                Map<Integer, List<Harvest>> harvestsBySeasonId = allHarvests.stream()
                                .collect(Collectors.groupingBy(h -> h.getSeason().getId()));

                return seasons.stream()
                                .map(season -> {
                                        List<Harvest> seasonHarvests = harvestsBySeasonId.getOrDefault(season.getId(),
                                                        Collections.emptyList());

                                        BigDecimal totalQuantity = seasonHarvests.stream()
                                                        .map(h -> h.getQuantity() != null ? h.getQuantity()
                                                                        : BigDecimal.ZERO)
                                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                                        // unit = price per kg, so revenue = quantity * unit
                                        BigDecimal totalRevenue = seasonHarvests.stream()
                                                        .map(h -> {
                                                                BigDecimal qty = h.getQuantity() != null
                                                                                ? h.getQuantity()
                                                                                : BigDecimal.ZERO;
                                                                BigDecimal price = h.getUnit() != null ? h.getUnit()
                                                                                : BigDecimal.ZERO;
                                                                return qty.multiply(price);
                                                        })
                                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                                        // Calculate average price per unit
                                        BigDecimal avgPrice = null;
                                        if (totalQuantity.compareTo(BigDecimal.ZERO) > 0) {
                                                avgPrice = totalRevenue.divide(totalQuantity, 2, RoundingMode.HALF_UP);
                                        }

                                        return AdminReportResponse.RevenueReport.builder()
                                                        .seasonId(season.getId())
                                                        .seasonName(season.getSeasonName())
                                                        .cropName(season.getCrop() != null
                                                                        ? season.getCrop().getCropName()
                                                                        : null)
                                                        .totalQuantity(totalQuantity)
                                                        .totalRevenue(totalRevenue)
                                                        .avgPricePerUnit(avgPrice)
                                                        .build();
                                })
                                .filter(r -> r.getTotalQuantity().compareTo(BigDecimal.ZERO) > 0) // Only include
                                                                                                  // seasons with
                                                                                                  // harvests
                                .sorted(Comparator.comparing(AdminReportResponse.RevenueReport::getSeasonId))
                                .collect(Collectors.toList());
        }

        /**
         * Task Performance Report: Completion rate, overdue rate.
         * Filter by year (tasks.created_at).
         */
        public AdminReportResponse.TaskPerformanceReport getTaskPerformance(Integer year) {
                log.info("Generating task performance report for year: {}", year);

                try {
                        int targetYear = year != null ? year : LocalDate.now().getYear();

                        var allTasks = taskRepository.findAll().stream()
                                        .filter(t -> t.getCreatedAt() != null
                                                        && t.getCreatedAt().getYear() == targetYear)
                                        .collect(Collectors.toList());

                        long totalTasks = allTasks.size();

                        // Count by status
                        Map<TaskStatus, Long> statusCounts = allTasks.stream()
                                        .filter(t -> t.getStatus() != null)
                                        .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));

                        long completedTasks = statusCounts.getOrDefault(TaskStatus.DONE, 0L);
                        long pendingTasks = statusCounts.getOrDefault(TaskStatus.PENDING, 0L);
                        long inProgressTasks = statusCounts.getOrDefault(TaskStatus.IN_PROGRESS, 0L);
                        long cancelledTasks = statusCounts.getOrDefault(TaskStatus.CANCELLED, 0L);
                        long overdueTasks = statusCounts.getOrDefault(TaskStatus.OVERDUE, 0L);

                        // Also count tasks that are past due date but not DONE
                        LocalDate today = LocalDate.now();
                        long additionalOverdue = allTasks.stream()
                                        .filter(t -> t.getStatus() != TaskStatus.DONE &&
                                                        t.getStatus() != TaskStatus.CANCELLED &&
                                                        t.getStatus() != TaskStatus.OVERDUE &&
                                                        t.getDueDate() != null &&
                                                        t.getDueDate().isBefore(today))
                                        .count();
                        overdueTasks += additionalOverdue;

                        // Calculate rates
                        BigDecimal completionRate = BigDecimal.ZERO;
                        BigDecimal overdueRate = BigDecimal.ZERO;
                        if (totalTasks > 0) {
                                completionRate = BigDecimal.valueOf(completedTasks)
                                                .divide(BigDecimal.valueOf(totalTasks), 4, RoundingMode.HALF_UP)
                                                .multiply(BigDecimal.valueOf(100))
                                                .setScale(2, RoundingMode.HALF_UP);
                                overdueRate = BigDecimal.valueOf(overdueTasks)
                                                .divide(BigDecimal.valueOf(totalTasks), 4, RoundingMode.HALF_UP)
                                                .multiply(BigDecimal.valueOf(100))
                                                .setScale(2, RoundingMode.HALF_UP);
                        }

                        return AdminReportResponse.TaskPerformanceReport.builder()
                                        .totalTasks(totalTasks)
                                        .completedTasks(completedTasks)
                                        .overdueTasks(overdueTasks)
                                        .pendingTasks(pendingTasks)
                                        .inProgressTasks(inProgressTasks)
                                        .cancelledTasks(cancelledTasks)
                                        .completionRate(completionRate)
                                        .overdueRate(overdueRate)
                                        .build();
                } catch (Exception e) {
                        log.error("Error generating task performance report: {}", e.getMessage(), e);
                        // Return empty report instead of failing
                        return AdminReportResponse.TaskPerformanceReport.builder()
                                        .totalTasks(0L)
                                        .completedTasks(0L)
                                        .overdueTasks(0L)
                                        .pendingTasks(0L)
                                        .inProgressTasks(0L)
                                        .cancelledTasks(0L)
                                        .completionRate(BigDecimal.ZERO)
                                        .overdueRate(BigDecimal.ZERO)
                                        .build();
                }
        }

        /**
         * Inventory On-Hand Report: Current stock by warehouse.
         * No filter - always returns current snapshot.
         */
        public List<AdminReportResponse.InventoryOnHandReport> getInventoryOnHand() {
                log.info("Generating inventory on-hand report");

                var warehouses = warehouseRepository.findAll();
                var allBalances = inventoryBalanceRepository.findAll();
                var allLots = supplyLotRepository.findAll();

                LocalDate today = LocalDate.now();
                LocalDate soonThreshold = today.plusDays(30);

                // Group balances by warehouseId
                Map<Integer, List<InventoryBalance>> balancesByWarehouse = allBalances.stream()
                                .filter(b -> b.getWarehouse() != null)
                                .collect(Collectors.groupingBy(b -> b.getWarehouse().getId()));

                // Create lot lookup for expiry dates
                Map<Integer, SupplyLot> lotMap = allLots.stream()
                                .collect(Collectors.toMap(SupplyLot::getId, lot -> lot, (a, b) -> a));

                return warehouses.stream()
                                .map(warehouse -> {
                                        List<InventoryBalance> warehouseBalances = balancesByWarehouse.getOrDefault(
                                                        warehouse.getId(), Collections.emptyList());

                                        // Get unique lot IDs with positive quantities
                                        Set<Integer> activeLotIds = warehouseBalances.stream()
                                                        .filter(b -> b.getSupplyLot() != null &&
                                                                        b.getQuantity() != null &&
                                                                        b.getQuantity().compareTo(BigDecimal.ZERO) > 0)
                                                        .map(b -> b.getSupplyLot().getId())
                                                        .collect(Collectors.toSet());

                                        // Total quantity on hand
                                        BigDecimal totalQuantity = warehouseBalances.stream()
                                                        .map(b -> b.getQuantity() != null ? b.getQuantity()
                                                                        : BigDecimal.ZERO)
                                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                                        // Count expired and expiring soon lots
                                        int expiredLots = 0;
                                        int expiringSoonLots = 0;
                                        for (Integer lotId : activeLotIds) {
                                                SupplyLot lot = lotMap.get(lotId);
                                                if (lot != null && lot.getExpiryDate() != null) {
                                                        if (lot.getExpiryDate().isBefore(today)) {
                                                                expiredLots++;
                                                        } else if (lot.getExpiryDate().isBefore(soonThreshold)) {
                                                                expiringSoonLots++;
                                                        }
                                                }
                                        }

                                        // Get farm name
                                        Farm farm = warehouse.getFarm();
                                        String farmName = farm != null ? farm.getName() : null;

                                        return AdminReportResponse.InventoryOnHandReport.builder()
                                                        .warehouseId(warehouse.getId())
                                                        .warehouseName(warehouse.getName())
                                                        .farmName(farmName)
                                                        .totalLots(activeLotIds.size())
                                                        .totalQuantityOnHand(totalQuantity)
                                                        .expiredLots(expiredLots)
                                                        .expiringSoonLots(expiringSoonLots)
                                                        .build();
                                })
                                .sorted(Comparator.comparing(AdminReportResponse.InventoryOnHandReport::getWarehouseId))
                                .collect(Collectors.toList());
        }

        /**
         * Incident Statistics Report: Breakdown by type, severity, status.
         * Filter by year (incidents.created_at).
         */
        public AdminReportResponse.IncidentStatisticsReport getIncidentStatistics(Integer year) {
                log.info("Generating incident statistics report for year: {}", year);

                try {
                        int targetYear = year != null ? year : LocalDate.now().getYear();

                        var allIncidents = incidentRepository.findAll().stream()
                                        .filter(i -> i.getCreatedAt() != null
                                                        && i.getCreatedAt().getYear() == targetYear)
                                        .collect(Collectors.toList());

                        // Group by incident type
                        Map<String, Long> byIncidentType = allIncidents.stream()
                                        .filter(i -> i.getIncidentType() != null && !i.getIncidentType().isBlank())
                                        .collect(Collectors.groupingBy(Incident::getIncidentType,
                                                        Collectors.counting()));

                        // Group by severity
                        Map<String, Long> bySeverity = allIncidents.stream()
                                        .filter(i -> i.getSeverity() != null)
                                        .collect(Collectors.groupingBy(i -> i.getSeverity().name(),
                                                        Collectors.counting()));

                        // Group by status
                        Map<String, Long> byStatus = allIncidents.stream()
                                        .filter(i -> i.getStatus() != null)
                                        .collect(Collectors.groupingBy(i -> i.getStatus().name(),
                                                        Collectors.counting()));

                        long totalCount = allIncidents.size();
                        long openCount = byStatus.getOrDefault(IncidentStatus.OPEN.name(), 0L);
                        long resolvedCount = byStatus.getOrDefault(IncidentStatus.RESOLVED.name(), 0L);

                        // Calculate average resolution days
                        BigDecimal averageResolutionDays = null;
                        List<Long> resolutionDays = allIncidents.stream()
                                        .filter(i -> i.getStatus() == IncidentStatus.RESOLVED &&
                                                        i.getResolvedAt() != null &&
                                                        i.getCreatedAt() != null)
                                        .map(i -> {
                                                LocalDateTime created = i.getCreatedAt();
                                                LocalDateTime resolved = i.getResolvedAt();
                                                return ChronoUnit.DAYS.between(created, resolved);
                                        })
                                        .collect(Collectors.toList());

                        if (!resolutionDays.isEmpty()) {
                                long sum = resolutionDays.stream().mapToLong(Long::longValue).sum();
                                averageResolutionDays = BigDecimal.valueOf(sum)
                                                .divide(BigDecimal.valueOf(resolutionDays.size()), 2,
                                                                RoundingMode.HALF_UP);
                        }

                        return AdminReportResponse.IncidentStatisticsReport.builder()
                                        .byIncidentType(byIncidentType)
                                        .bySeverity(bySeverity)
                                        .byStatus(byStatus)
                                        .totalCount(totalCount)
                                        .openCount(openCount)
                                        .resolvedCount(resolvedCount)
                                        .averageResolutionDays(averageResolutionDays)
                                        .build();
                } catch (Exception e) {
                        log.error("Error generating incident statistics report: {}", e.getMessage(), e);
                        // Return empty report instead of failing
                        return AdminReportResponse.IncidentStatisticsReport.builder()
                                        .byIncidentType(new HashMap<>())
                                        .bySeverity(new HashMap<>())
                                        .byStatus(new HashMap<>())
                                        .totalCount(0L)
                                        .openCount(0L)
                                        .resolvedCount(0L)
                                        .averageResolutionDays(null)
                                        .build();
                }
        }
}
