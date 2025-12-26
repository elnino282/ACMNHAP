package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Request.AdminRecordMovementRequest;
import org.example.QuanLyMuaVu.DTO.Response.StockMovementResponse;
import org.example.QuanLyMuaVu.Entity.InventoryBalance;
import org.example.QuanLyMuaVu.Entity.Season;
import org.example.QuanLyMuaVu.Entity.StockLocation;
import org.example.QuanLyMuaVu.Entity.StockMovement;
import org.example.QuanLyMuaVu.Entity.SupplyLot;
import org.example.QuanLyMuaVu.Entity.Warehouse;
import org.example.QuanLyMuaVu.Enums.StockMovementType;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.InventoryBalanceRepository;
import org.example.QuanLyMuaVu.Repository.SeasonRepository;
import org.example.QuanLyMuaVu.Repository.StockLocationRepository;
import org.example.QuanLyMuaVu.Repository.StockMovementRepository;
import org.example.QuanLyMuaVu.Repository.SupplyLotRepository;
import org.example.QuanLyMuaVu.Repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Admin service for inventory management with atomic stock operations.
 * Uses Snapshot Pattern with InventoryBalance for concurrent-safe stock
 * updates.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminInventoryService {

    WarehouseRepository warehouseRepository;
    StockLocationRepository stockLocationRepository;
    SupplyLotRepository supplyLotRepository;
    SeasonRepository seasonRepository;
    StockMovementRepository stockMovementRepository;
    InventoryBalanceRepository inventoryBalanceRepository;

    /**
     * Record a stock movement (IN, OUT, or ADJUST) with atomic balance update.
     * 
     * Business Rules:
     * 1. If seasonId is provided, warehouse.farm must equal season.plot.farm
     * 2. If locationId is provided, location.warehouse must equal warehouse
     * 3. OUT movements and negative ADJUST cannot exceed current stock
     */
    @Transactional
    public StockMovementResponse recordMovement(AdminRecordMovementRequest request) {
        // 1. Load and validate warehouse
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));

        // 2. Load and validate supply lot
        SupplyLot supplyLot = supplyLotRepository.findById(request.getSupplyLotId())
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_LOT_NOT_FOUND));

        // 3. Load and validate location (if provided)
        StockLocation location = null;
        if (request.getLocationId() != null) {
            location = stockLocationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new AppException(ErrorCode.LOCATION_NOT_FOUND));
            validateLocationWarehouseMatch(location, warehouse);
        }

        // 4. Load and validate season (if provided)
        Season season = null;
        if (request.getSeasonId() != null) {
            season = seasonRepository.findById(request.getSeasonId())
                    .orElseThrow(() -> new AppException(ErrorCode.SEASON_NOT_FOUND));
            validateWarehouseSeasonFarmMatch(warehouse, season);
        }

        // 5. Parse and validate movement type
        StockMovementType movementType = parseMovementType(request.getMovementType());
        BigDecimal quantity = request.getQuantity();

        // 6. Execute atomic balance update based on movement type
        executeBalanceUpdate(supplyLot, warehouse, location, movementType, quantity);

        // 7. Create audit log (StockMovement)
        StockMovement movement = StockMovement.builder()
                .supplyLot(supplyLot)
                .warehouse(warehouse)
                .location(location)
                .movementType(movementType)
                .quantity(quantity)
                .movementDate(LocalDateTime.now())
                .season(season)
                .note(request.getNote())
                .build();

        StockMovement saved = stockMovementRepository.save(movement);
        log.info("Recorded stock movement: type={}, qty={}, lot={}, warehouse={}",
                movementType, quantity, supplyLot.getId(), warehouse.getId());

        return toResponse(saved);
    }

    /**
     * Get current on-hand quantity for a supply lot at a warehouse/location.
     */
    @Transactional(readOnly = true)
    public BigDecimal getOnHandQuantity(Integer supplyLotId, Integer warehouseId, Integer locationId) {
        SupplyLot supplyLot = supplyLotRepository.findById(supplyLotId)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_LOT_NOT_FOUND));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));
        StockLocation location = null;
        if (locationId != null) {
            location = stockLocationRepository.findById(locationId)
                    .orElseThrow(() -> new AppException(ErrorCode.LOCATION_NOT_FOUND));
        }

        BigDecimal qty = inventoryBalanceRepository.getCurrentQuantity(supplyLot, warehouse, location);
        return qty != null ? qty : BigDecimal.ZERO;
    }

    // ========== Private Methods ==========

    private void executeBalanceUpdate(SupplyLot lot, Warehouse warehouse, StockLocation location,
            StockMovementType type, BigDecimal quantity) {
        switch (type) {
            case IN -> executeInboundUpdate(lot, warehouse, location, quantity);
            case OUT -> executeOutboundUpdate(lot, warehouse, location, quantity);
            case ADJUST -> executeAdjustUpdate(lot, warehouse, location, quantity);
        }
    }

    /**
     * IN movement: Add to stock (upsert with pessimistic lock)
     */
    private void executeInboundUpdate(SupplyLot lot, Warehouse warehouse, StockLocation location,
            BigDecimal quantity) {
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        upsertBalance(lot, warehouse, location, quantity);
    }

    /**
     * OUT movement: Deduct from stock (atomic with check)
     */
    private void executeOutboundUpdate(SupplyLot lot, Warehouse warehouse, StockLocation location,
            BigDecimal quantity) {
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        atomicDeductBalance(lot, warehouse, location, quantity);
    }

    /**
     * ADJUST movement: Can be positive (add) or negative (deduct)
     */
    private void executeAdjustUpdate(SupplyLot lot, Warehouse warehouse, StockLocation location,
            BigDecimal quantity) {
        if (quantity.compareTo(BigDecimal.ZERO) > 0) {
            // Positive adjustment = add stock
            upsertBalance(lot, warehouse, location, quantity);
        } else if (quantity.compareTo(BigDecimal.ZERO) < 0) {
            // Negative adjustment = deduct stock
            atomicDeductBalance(lot, warehouse, location, quantity.abs());
        }
        // quantity == 0: no-op
    }

    /**
     * Upsert balance with pessimistic lock to prevent duplicate inserts.
     */
    private void upsertBalance(SupplyLot lot, Warehouse warehouse, StockLocation location,
            BigDecimal addQuantity) {
        InventoryBalance balance = inventoryBalanceRepository
                .findByLotAndWarehouseAndLocationWithLock(lot, warehouse, location)
                .orElse(null);

        if (balance != null) {
            balance.setQuantity(balance.getQuantity().add(addQuantity));
            inventoryBalanceRepository.save(balance);
        } else {
            balance = InventoryBalance.builder()
                    .supplyLot(lot)
                    .warehouse(warehouse)
                    .location(location)
                    .quantity(addQuantity)
                    .build();
            inventoryBalanceRepository.save(balance);
        }
    }

    /**
     * Atomic deduct with stock check. Throws if insufficient.
     */
    private void atomicDeductBalance(SupplyLot lot, Warehouse warehouse, StockLocation location,
            BigDecimal deductQuantity) {
        InventoryBalance balance = inventoryBalanceRepository
                .findByLotAndWarehouseAndLocation(lot, warehouse, location)
                .orElseThrow(() -> new AppException(ErrorCode.INSUFFICIENT_STOCK));

        int rowCount = inventoryBalanceRepository.atomicDeduct(balance.getId(), deductQuantity);
        if (rowCount == 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }
    }

    private void validateWarehouseSeasonFarmMatch(Warehouse warehouse, Season season) {
        if (season.getPlot() == null || season.getPlot().getFarm() == null) {
            throw new AppException(ErrorCode.WAREHOUSE_SEASON_FARM_MISMATCH);
        }
        if (!warehouse.getFarm().getId().equals(season.getPlot().getFarm().getId())) {
            throw new AppException(ErrorCode.WAREHOUSE_SEASON_FARM_MISMATCH);
        }
    }

    private void validateLocationWarehouseMatch(StockLocation location, Warehouse warehouse) {
        if (!location.getWarehouse().getId().equals(warehouse.getId())) {
            throw new AppException(ErrorCode.LOCATION_WAREHOUSE_MISMATCH);
        }
    }

    private StockMovementType parseMovementType(String typeCode) {
        try {
            return StockMovementType.fromCode(typeCode);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_MOVEMENT_TYPE);
        }
    }

    private StockMovementResponse toResponse(StockMovement movement) {
        return StockMovementResponse.builder()
                .id(movement.getId())
                .supplyLotId(movement.getSupplyLot() != null ? movement.getSupplyLot().getId() : null)
                .supplyItemName(movement.getSupplyLot() != null && movement.getSupplyLot().getSupplyItem() != null
                        ? movement.getSupplyLot().getSupplyItem().getName()
                        : null)
                .warehouseId(movement.getWarehouse() != null ? movement.getWarehouse().getId() : null)
                .warehouseName(movement.getWarehouse() != null ? movement.getWarehouse().getName() : null)
                .locationId(movement.getLocation() != null ? movement.getLocation().getId() : null)
                .movementType(movement.getMovementType() != null ? movement.getMovementType().name() : null)
                .quantity(movement.getQuantity())
                .movementDate(movement.getMovementDate())
                .seasonId(movement.getSeason() != null ? movement.getSeason().getId() : null)
                .note(movement.getNote())
                .build();
    }
}
