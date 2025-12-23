package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Response.AdminDashboardResponse;
import org.example.QuanLyMuaVu.Enums.IncidentStatus;
import org.example.QuanLyMuaVu.Enums.SeasonStatus;
import org.example.QuanLyMuaVu.Repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminDashboardService {

    UserRepository userRepository;
    FarmRepository farmRepository;
    SeasonRepository seasonRepository;
    IncidentRepository incidentRepository;
    ExpenseRepository expenseRepository;
    HarvestRepository harvestRepository;
    StockMovementRepository stockMovementRepository;

    public AdminDashboardResponse getDashboard() {
        log.info("Fetching admin dashboard summary");

        var summary = buildSummaryMetrics();
        var latestItems = buildLatestItems();

        return AdminDashboardResponse.builder()
                .summary(summary)
                .latestItems(latestItems)
                .build();
    }

    private AdminDashboardResponse.SummaryMetrics buildSummaryMetrics() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);

        // Total users
        Long totalUsers = userRepository.count();

        // Total farms
        Long totalFarms = farmRepository.count();

        // Active seasons count
        Long activeSeasonsCount = seasonRepository.countByStatus(SeasonStatus.ACTIVE);

        // Open incidents count
        Long openIncidentsCount = incidentRepository.countByStatus(IncidentStatus.OPEN);

        // Expenses this month
        BigDecimal expensesThisMonth = expenseRepository.sumTotalCostByExpenseDateBetween(
                firstDayOfMonth, today);

        // Harvest this month
        BigDecimal harvestThisMonth = harvestRepository.sumQuantityByHarvestDateBetween(
                firstDayOfMonth, today);

        return AdminDashboardResponse.SummaryMetrics.builder()
                .totalUsers(totalUsers != null ? totalUsers : 0L)
                .totalFarms(totalFarms != null ? totalFarms : 0L)
                .activeSeasonsCount(activeSeasonsCount != null ? activeSeasonsCount : 0L)
                .openIncidentsCount(openIncidentsCount != null ? openIncidentsCount : 0L)
                .expensesThisMonth(expensesThisMonth != null ? expensesThisMonth : BigDecimal.ZERO)
                .harvestThisMonth(harvestThisMonth != null ? harvestThisMonth : BigDecimal.ZERO)
                .build();
    }

    private AdminDashboardResponse.LatestItems buildLatestItems() {
        // Latest 5 incidents
        var latestIncidents = incidentRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(incident -> AdminDashboardResponse.IncidentSummary.builder()
                        .id(incident.getId())
                        .incidentType(incident.getIncidentType())
                        .severity(incident.getSeverity() != null ? incident.getSeverity().name() : null)
                        .status(incident.getStatus() != null ? incident.getStatus().name() : null)
                        .createdAt(incident.getCreatedAt())
                        .seasonName(incident.getSeason() != null ? incident.getSeason().getSeasonName() : null)
                        .farmName(incident.getSeason() != null && incident.getSeason().getPlot() != null
                                && incident.getSeason().getPlot().getFarm() != null
                                        ? incident.getSeason().getPlot().getFarm().getName()
                                        : null)
                        .build())
                .collect(Collectors.toList());

        // Latest 5 seasons
        var latestSeasons = seasonRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(season -> AdminDashboardResponse.SeasonSummary.builder()
                        .seasonId(season.getId())
                        .seasonName(season.getSeasonName())
                        .status(season.getStatus() != null ? season.getStatus().name() : null)
                        .cropName(season.getCrop() != null ? season.getCrop().getCropName() : null)
                        .plotName(season.getPlot() != null ? season.getPlot().getPlotName() : null)
                        .farmName(season.getPlot() != null && season.getPlot().getFarm() != null
                                ? season.getPlot().getFarm().getName()
                                : null)
                        .startDate(season.getStartDate())
                        .build())
                .collect(Collectors.toList());

        // Latest 5 stock movements
        var latestMovements = stockMovementRepository.findTop5ByOrderByMovementDateDesc()
                .stream()
                .map(movement -> AdminDashboardResponse.MovementSummary.builder()
                        .id(movement.getId())
                        .movementType(movement.getMovementType() != null ? movement.getMovementType().name() : null)
                        .quantity(movement.getQuantity())
                        .movementDate(movement.getMovementDate())
                        .supplyItemName(
                                movement.getSupplyLot() != null && movement.getSupplyLot().getSupplyItem() != null
                                        ? movement.getSupplyLot().getSupplyItem().getName()
                                        : null)
                        .warehouseName(movement.getWarehouse() != null ? movement.getWarehouse().getName() : null)
                        .build())
                .collect(Collectors.toList());

        return AdminDashboardResponse.LatestItems.builder()
                .latestIncidents(latestIncidents)
                .latestSeasons(latestSeasons)
                .latestMovements(latestMovements)
                .build();
    }
}
