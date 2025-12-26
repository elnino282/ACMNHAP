package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.StockLocation;
import org.example.QuanLyMuaVu.Entity.StockMovement;
import org.example.QuanLyMuaVu.Entity.SupplyLot;
import org.example.QuanLyMuaVu.Entity.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Integer> {

  @Query("""
      select coalesce(sum(
          case when m.movementType = org.example.QuanLyMuaVu.Enums.StockMovementType.IN then m.quantity
               when m.movementType = org.example.QuanLyMuaVu.Enums.StockMovementType.OUT then -m.quantity
               else 0 end
      ), 0)
      from StockMovement m
      where m.supplyLot = :lot
        and m.warehouse = :warehouse
        and (:location is null or m.location = :location)
      """)
  BigDecimal calculateOnHandQuantity(
      @Param("lot") SupplyLot lot,
      @Param("warehouse") Warehouse warehouse,
      @Param("location") StockLocation location);

  List<StockMovement> findAllByWarehouseOrderByMovementDateDesc(Warehouse warehouse);

  @Query("""
      select m from StockMovement m
      where m.warehouse = :warehouse
        and (:from is null or m.movementDate >= :from)
        and (:to is null or m.movementDate <= :to)
        and (:type is null or m.movementType = :type)
      order by m.movementDate desc
      """)
  Page<StockMovement> findByWarehouseWithFilters(
      @Param("warehouse") Warehouse warehouse,
      @Param("from") LocalDateTime from,
      @Param("to") LocalDateTime to,
      @Param("type") org.example.QuanLyMuaVu.Enums.StockMovementType type,
      Pageable pageable);

  /**
   * Find latest 5 stock movements ordered by movement date.
   * Used by AdminDashboardService for latest movements.
   */
  List<StockMovement> findTop5ByOrderByMovementDateDesc();

  /**
   * Find paginated stock movements by warehouse.
   * Used by AdminWarehouseController for warehouse movements.
   */
  Page<StockMovement> findByWarehouse(Warehouse warehouse, Pageable pageable);

  /**
   * Find all stock movements for a specific supply lot.
   * Used for lot movement history tracking.
   */
  Page<StockMovement> findBySupplyLotOrderByMovementDateDesc(SupplyLot supplyLot, Pageable pageable);

  /**
   * Check if any stock movements exist for a supply lot.
   * Used for deletion guard.
   */
  boolean existsBySupplyLot(SupplyLot supplyLot);
}
