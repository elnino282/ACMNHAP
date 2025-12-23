package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Response.AdminReportResponse;
import org.example.QuanLyMuaVu.Repository.ExpenseRepository;
import org.example.QuanLyMuaVu.Repository.HarvestRepository;
import org.example.QuanLyMuaVu.Repository.IncidentRepository;
import org.example.QuanLyMuaVu.Repository.SeasonRepository;
import org.example.QuanLyMuaVu.Repository.StockMovementRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
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

        public List<AdminReportResponse.MonthlyTotal> getExpensesByMonth(Integer year) {
                log.info("Generating expenses by month report for year: {}", year);

                int targetYear = year != null ? year : LocalDate.now().getYear();

                // Get all expenses and group by month
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
                                                        .cropName(
                                                                        season != null && season.getCrop() != null
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

                // Group by year-month-type
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
}
