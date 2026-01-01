package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Season;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Enums.SeasonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SeasonRepository extends JpaRepository<Season, Integer>, JpaSpecificationExecutor<Season> {

        List<Season> findBySeasonNameContainingIgnoreCase(String seasonName);

        boolean existsBySeasonNameIgnoreCase(String seasonName);

        boolean existsByPlot_Id(Integer plotId);

        boolean existsByPlot_IdAndStatusIn(Integer plotId, Iterable<SeasonStatus> statuses);

        List<Season> findAllByPlot_Id(Integer plotId);

        List<Season> findAllByPlot_User(User user);

        List<Season> findAllByPlot_Farm_IdIn(Iterable<Integer> farmIds);

        List<Season> findAllByPlot_IdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        Integer plotId,
                        LocalDate endDate,
                        LocalDate startDate);

        /**
         * Find all seasons for a given plot with status in the specified set.
         * Used by ActiveSeasonValidator to check for overlapping seasons.
         */
        List<Season> findByPlotAndStatusIn(org.example.QuanLyMuaVu.Entity.Plot plot, Iterable<SeasonStatus> statuses);

        /**
         * Count seasons by farm IDs and status.
         * Used by FarmerDashboardService to get active seasons count.
         */
        Long countByPlot_Farm_IdInAndStatus(List<Integer> farmIds, SeasonStatus status);

        /**
         * Count all seasons by status.
         * Used by AdminDashboardService to get system-wide active seasons count.
         */
        Long countByStatus(SeasonStatus status);

        /**
         * Find latest 5 seasons ordered by created date.
         * Used by AdminDashboardService for latest seasons.
         */
        List<Season> findTop5ByOrderByCreatedAtDesc();

        /**
         * Find all seasons for a given plot.
         * Used by AdminPlotController to get plot seasons.
         */
        List<Season> findByPlot(org.example.QuanLyMuaVu.Entity.Plot plot);

        /**
         * Check if any season references the given crop.
         * Used for deletion guard in CropService.
         */
        boolean existsByCrop_Id(Integer cropId);

        /**
         * Check if any season references the given variety.
         * Used for deletion guard in VarietyService.
         */
        boolean existsByVariety_Id(Integer varietyId);

        /**
         * Find seasons by date range with optional filters.
         * Uses date range for index optimization (no YEAR() function).
         * Date params are optional - if null, no date filtering is applied.
         * Used by AdminReportsService for Yield/Cost/Revenue reports.
         */
        @Query("SELECT s FROM Season s " +
                        "WHERE (:from IS NULL OR s.startDate >= :from) " +
                        "AND (:to IS NULL OR s.startDate < :to) " +
                        "AND (:cropId IS NULL OR s.crop.id = :cropId) " +
                        "AND (:farmId IS NULL OR s.plot.farm.id = :farmId) " +
                        "AND (:plotId IS NULL OR s.plot.id = :plotId)")
        List<Season> findByFilters(@Param("from") LocalDate from,
                        @Param("to") LocalDate to,
                        @Param("cropId") Integer cropId,
                        @Param("farmId") Integer farmId,
                        @Param("plotId") Integer plotId);
}
