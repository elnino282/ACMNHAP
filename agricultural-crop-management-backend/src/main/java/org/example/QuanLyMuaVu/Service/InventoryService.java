package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Request.RecordStockMovementRequest;
import org.example.QuanLyMuaVu.DTO.Response.StockMovementResponse;
import org.example.QuanLyMuaVu.Entity.Farm;
import org.example.QuanLyMuaVu.Entity.Season;
import org.example.QuanLyMuaVu.Entity.StockLocation;
import org.example.QuanLyMuaVu.Entity.StockMovement;
import org.example.QuanLyMuaVu.Entity.SupplyLot;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Entity.Warehouse;
import org.example.QuanLyMuaVu.Enums.StockMovementType;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.SeasonRepository;
import org.example.QuanLyMuaVu.Repository.StockLocationRepository;
import org.example.QuanLyMuaVu.Repository.StockMovementRepository;
import org.example.QuanLyMuaVu.Repository.SupplyLotRepository;
import org.example.QuanLyMuaVu.Repository.TaskRepository;
import org.example.QuanLyMuaVu.Repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class InventoryService {

    WarehouseRepository warehouseRepository;
    StockLocationRepository stockLocationRepository;
    SupplyLotRepository supplyLotRepository;
    StockMovementRepository stockMovementRepository;
    SeasonRepository seasonRepository;
    TaskRepository taskRepository;
    FarmAccessService farmAccessService;

    public StockMovementResponse recordMovement(RecordStockMovementRequest request) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        ensureWarehouseOwnership(warehouse);

        SupplyLot lot = supplyLotRepository.findById(request.getSupplyLotId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        StockLocation location = null;
        if (request.getLocationId() != null) {
            location = stockLocationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            if (!location.getWarehouse().getId().equals(warehouse.getId())) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }

        StockMovementType type = StockMovementType.fromCode(request.getMovementType());
        if (type == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        BigDecimal quantity = request.getQuantity();
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Season season = null;
        if (request.getSeasonId() != null) {
            season = seasonRepository.findById(request.getSeasonId())
                    .orElseThrow(() -> new AppException(ErrorCode.SEASON_NOT_FOUND));
        }

        var task = request.getTaskId() != null
                ? taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND))
                : null;

        if (task != null) {
            if (task.getSeason() == null) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
            if (season != null && !task.getSeason().getId().equals(season.getId())) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
            if (season == null) {
                season = task.getSeason();
            }
        }

        if (season != null) {
            if (season.getPlot() == null || season.getPlot().getFarm() == null
                    || !season.getPlot().getFarm().getId().equals(warehouse.getFarm().getId())) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }

        if (type == StockMovementType.OUT) {
            BigDecimal onHand = stockMovementRepository.calculateOnHandQuantity(lot, warehouse, location);
            if (onHand.compareTo(quantity) < 0) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }

        StockMovement movement = StockMovement.builder()
                .supplyLot(lot)
                .warehouse(warehouse)
                .location(location)
                .movementType(type)
                .quantity(quantity)
                .movementDate(LocalDateTime.now())
                .season(season)
                .task(task)
                .note(request.getNote())
                .build();

        StockMovement saved = stockMovementRepository.save(movement);
        return toResponse(saved);
    }

    public BigDecimal getOnHandQuantity(Integer supplyLotId, Integer warehouseId, Integer locationId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        ensureWarehouseOwnership(warehouse);

        SupplyLot lot = supplyLotRepository.findById(supplyLotId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        StockLocation location = null;
        if (locationId != null) {
            location = stockLocationRepository.findById(locationId)
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        }

        return stockMovementRepository.calculateOnHandQuantity(lot, warehouse, location);
    }

    private void ensureWarehouseOwnership(Warehouse warehouse) {
        Farm farm = warehouse.getFarm();
        if (farm == null) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        farmAccessService.assertCurrentUserCanAccessFarm(farm);
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
                .taskId(movement.getTask() != null ? movement.getTask().getId() : null)
                .note(movement.getNote())
                .build();
    }
}
