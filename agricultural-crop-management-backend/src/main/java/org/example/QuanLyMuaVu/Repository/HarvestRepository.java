package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Harvest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface HarvestRepository extends JpaRepository<Harvest, Integer> {

    List<Harvest> findByHarvestDateBetween(LocalDate start, LocalDate end);

    List<Harvest> findAllBySeason_Id(Integer seasonId);

    boolean existsBySeason_Id(Integer seasonId);

    /**
     * Sum harvest quantities within date range.
     * Used by FarmerDashboardService for harvest metrics.
     */
    @Query("SELECT COALESCE(SUM(h.quantity), 0) FROM Harvest h WHERE h.harvestDate BETWEEN :start AND :end")
    BigDecimal sumQuantityByHarvestDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
