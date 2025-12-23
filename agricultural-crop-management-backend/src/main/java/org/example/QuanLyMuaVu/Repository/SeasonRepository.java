package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Season;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Enums.SeasonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SeasonRepository extends JpaRepository<Season, Integer> {

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
}
