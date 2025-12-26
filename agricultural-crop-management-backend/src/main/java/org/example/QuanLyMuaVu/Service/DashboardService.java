package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Response.DashboardStatsDTO;
import org.example.QuanLyMuaVu.Enums.TaskStatus;
import org.example.QuanLyMuaVu.Repository.DashboardRepository;
import org.example.QuanLyMuaVu.Repository.FarmRepository;
import org.example.QuanLyMuaVu.Repository.PlotRepository;
import org.example.QuanLyMuaVu.Repository.SeasonRepository;
import org.example.QuanLyMuaVu.Repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardService {

    DashboardRepository dashboardRepository;
    UserRepository userRepository;
    FarmRepository farmRepository;
    PlotRepository plotRepository;
    SeasonRepository seasonRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        log.info("Fetching admin dashboard stats");

        DashboardStatsDTO.Summary summary = DashboardStatsDTO.Summary.builder()
                .totalUsers(userRepository.count())
                .totalFarms(farmRepository.count())
                .totalPlots(plotRepository.count())
                .totalSeasons(seasonRepository.count())
                .build();

        List<DashboardStatsDTO.UserRoleCount> userRoleCounts = dashboardRepository.countUsersByRole()
                .stream()
                .map(result -> DashboardStatsDTO.UserRoleCount.builder()
                        .role(result.getRole())
                        .total(result.getTotal())
                        .build())
                .collect(Collectors.toList());

        List<DashboardStatsDTO.UserStatusCount> userStatusCounts = dashboardRepository.countUsersByStatus()
                .stream()
                .map(result -> DashboardStatsDTO.UserStatusCount.builder()
                        .status(result.getStatus() != null ? result.getStatus().name() : null)
                        .total(result.getTotal())
                        .build())
                .collect(Collectors.toList());

        List<DashboardStatsDTO.SeasonStatusCount> seasonStatusCounts = dashboardRepository.countSeasonsByStatus()
                .stream()
                .map(result -> DashboardStatsDTO.SeasonStatusCount.builder()
                        .status(result.getStatus() != null ? result.getStatus().name() : null)
                        .total(result.getTotal())
                        .build())
                .collect(Collectors.toList());

        List<DashboardStatsDTO.RiskySeason> riskySeasons = dashboardRepository
                .findRiskySeasons(TaskStatus.OVERDUE, PageRequest.of(0, 5))
                .stream()
                .map(result -> DashboardStatsDTO.RiskySeason.builder()
                        .seasonId(result.getSeasonId())
                        .seasonName(result.getSeasonName())
                        .farmName(result.getFarmName())
                        .plotName(result.getPlotName())
                        .status(result.getStatus() != null ? result.getStatus().name() : null)
                        .incidentCount(result.getIncidentCount())
                        .overdueTaskCount(result.getOverdueTaskCount())
                        .riskScore(result.getRiskScore())
                        .build())
                .collect(Collectors.toList());

        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(7);
        List<DashboardStatsDTO.InventoryHealth> inventoryHealth = dashboardRepository
                .findInventoryHealth(today, cutoff)
                .stream()
                .map(result -> DashboardStatsDTO.InventoryHealth.builder()
                        .farmId(result.getFarmId())
                        .farmName(result.getFarmName())
                        .expiredCount(result.getExpiredCount())
                        .expiringSoonCount(result.getExpiringSoonCount())
                        .totalAtRisk(result.getTotalAtRisk())
                        .build())
                .collect(Collectors.toList());

        return DashboardStatsDTO.builder()
                .summary(summary)
                .userRoleCounts(userRoleCounts)
                .userStatusCounts(userStatusCounts)
                .seasonStatusCounts(seasonStatusCounts)
                .riskySeasons(riskySeasons)
                .inventoryHealth(inventoryHealth)
                .build();
    }
}
