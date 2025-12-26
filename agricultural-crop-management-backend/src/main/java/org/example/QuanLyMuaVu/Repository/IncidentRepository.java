package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Incident;
import org.example.QuanLyMuaVu.Entity.Season;
import org.example.QuanLyMuaVu.Enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Integer> {

    List<Incident> findAllBySeason(Season season);

    /**
     * Count incidents by farm IDs and status.
     * Used by FarmerDashboardService to get open incidents count.
     */
    Long countBySeason_Plot_Farm_IdInAndStatus(List<Integer> farmIds, IncidentStatus status);

    /**
     * Count all incidents by status.
     * Used by AdminDashboardService to get system-wide open incidents count.
     */
    Long countByStatus(IncidentStatus status);

    /**
     * Find latest 5 incidents ordered by created date.
     * Used by AdminDashboardService for latest incidents.
     */
    List<Incident> findTop5ByOrderByCreatedAtDesc();
}
