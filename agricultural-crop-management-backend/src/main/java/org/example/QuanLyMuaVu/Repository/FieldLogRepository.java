package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.FieldLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FieldLogRepository extends JpaRepository<FieldLog, Integer> {

    List<FieldLog> findAllBySeason_Id(Integer seasonId);

    List<FieldLog> findAllBySeason_IdAndLogDateBetween(Integer seasonId, LocalDate from, LocalDate to);

    boolean existsBySeason_Id(Integer seasonId);

    /**
     * Find latest 5 field logs by farm IDs.
     * Used by FarmerDashboardService for recent activity.
     */
    List<FieldLog> findTop5BySeason_Plot_Farm_IdInOrderByLogDateDesc(List<Integer> farmIds);
}
