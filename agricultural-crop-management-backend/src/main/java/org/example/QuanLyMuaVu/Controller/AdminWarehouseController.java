package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Response.StockLocationResponse;
import org.example.QuanLyMuaVu.DTO.Response.StockMovementResponse;
import org.example.QuanLyMuaVu.DTO.Response.WarehouseResponse;
import org.example.QuanLyMuaVu.Entity.Farm;
import org.example.QuanLyMuaVu.Entity.StockLocation;
import org.example.QuanLyMuaVu.Entity.StockMovement;
import org.example.QuanLyMuaVu.Entity.Warehouse;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.StockLocationRepository;
import org.example.QuanLyMuaVu.Repository.StockMovementRepository;
import org.example.QuanLyMuaVu.Repository.WarehouseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin REST endpoints for system-wide warehouse and inventory management.
 * Returns all warehouses across all farms for administrative purposes.
 */
@RestController
@RequestMapping("/api/v1/admin/warehouses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Warehouse", description = "Admin endpoints for system-wide warehouse management")
public class AdminWarehouseController {

        WarehouseRepository warehouseRepository;
        StockLocationRepository stockLocationRepository;
        StockMovementRepository stockMovementRepository;

        @Operation(summary = "List all warehouses (Admin)", description = "Get paginated list of all warehouses across all farms")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
        })
        @GetMapping
        public ApiResponse<PageResponse<WarehouseResponse>> listAllWarehouses(
                        @Parameter(description = "Search by warehouse name") @RequestParam(value = "keyword", required = false) String keyword,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {

                Page<Warehouse> warehousePage;
                if (keyword != null && !keyword.isBlank()) {
                        warehousePage = warehouseRepository.findByNameContainingIgnoreCase(keyword,
                                        PageRequest.of(page, size));
                } else {
                        warehousePage = warehouseRepository.findAll(PageRequest.of(page, size));
                }

                List<WarehouseResponse> content = warehousePage.getContent().stream()
                                .map(this::toWarehouseResponse)
                                .collect(Collectors.toList());

                return ApiResponse.success(PageResponse.of(warehousePage, content));
        }

        @Operation(summary = "Get warehouse detail (Admin)", description = "Get detailed information about a specific warehouse")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found")
        })
        @GetMapping("/{id}")
        public ApiResponse<WarehouseResponse> getWarehouse(@PathVariable Integer id) {
                Warehouse warehouse = warehouseRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                return ApiResponse.success(toWarehouseResponse(warehouse));
        }

        @Operation(summary = "Get warehouse locations (Admin)", description = "Get all stock locations in a warehouse")
        @GetMapping("/{id}/locations")
        public ApiResponse<List<StockLocationResponse>> listLocations(@PathVariable Integer id) {
                Warehouse warehouse = warehouseRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                List<StockLocation> locations = stockLocationRepository.findAllByWarehouse(warehouse);
                return ApiResponse
                                .success(locations.stream().map(this::toLocationResponse).collect(Collectors.toList()));
        }

        @Operation(summary = "Get warehouse movements (Admin)", description = "Get paginated stock movements for a warehouse")
        @GetMapping("/{id}/movements")
        public ApiResponse<PageResponse<StockMovementResponse>> listMovements(
                        @PathVariable Integer id,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {

                Warehouse warehouse = warehouseRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

                Page<StockMovement> movementPage = stockMovementRepository.findByWarehouse(warehouse,
                                PageRequest.of(page, size));

                List<StockMovementResponse> content = movementPage.getContent().stream()
                                .map(this::toMovementResponse)
                                .collect(Collectors.toList());

                return ApiResponse.success(PageResponse.of(movementPage, content));
        }

        @Operation(summary = "Get all movements (Admin)", description = "Get all stock movements across the system")
        @GetMapping("/movements")
        public ApiResponse<PageResponse<StockMovementResponse>> listAllMovements(
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {

                Page<StockMovement> movementPage = stockMovementRepository.findAll(PageRequest.of(page, size));

                List<StockMovementResponse> content = movementPage.getContent().stream()
                                .map(this::toMovementResponse)
                                .collect(Collectors.toList());

                return ApiResponse.success(PageResponse.of(movementPage, content));
        }

        private WarehouseResponse toWarehouseResponse(Warehouse w) {
                Farm farm = w.getFarm();
                int locationCount = stockLocationRepository.findAllByWarehouse(w).size();
                return WarehouseResponse.builder()
                                .id(w.getId())
                                .name(w.getName())
                                .type(w.getType())
                                .farmId(farm != null ? farm.getId() : null)
                                .farmName(farm != null ? farm.getName() : null)
                                .provinceId(w.getProvince() != null ? w.getProvince().getId() : null)
                                .provinceName(w.getProvince() != null ? w.getProvince().getName() : null)
                                .wardId(w.getWard() != null ? w.getWard().getId() : null)
                                .wardName(w.getWard() != null ? w.getWard().getName() : null)
                                .locationCount(locationCount)
                                .build();
        }

        private StockLocationResponse toLocationResponse(StockLocation l) {
                return StockLocationResponse.builder()
                                .id(l.getId())
                                .zone(l.getZone())
                                .aisle(l.getAisle())
                                .shelf(l.getShelf())
                                .bin(l.getBin())
                                .warehouseId(l.getWarehouse() != null ? l.getWarehouse().getId() : null)
                                .build();
        }

        private StockMovementResponse toMovementResponse(StockMovement m) {
                return StockMovementResponse.builder()
                                .id(m.getId())
                                .movementDate(m.getMovementDate())
                                .movementType(m.getMovementType() != null ? m.getMovementType().name() : null)
                                .quantity(m.getQuantity())
                                .note(m.getNote())
                                .supplyLotId(m.getSupplyLot() != null ? m.getSupplyLot().getId() : null)
                                .supplyItemName(m.getSupplyLot() != null && m.getSupplyLot().getSupplyItem() != null
                                                ? m.getSupplyLot().getSupplyItem().getName()
                                                : null)
                                .warehouseId(m.getWarehouse() != null ? m.getWarehouse().getId() : null)
                                .warehouseName(m.getWarehouse() != null ? m.getWarehouse().getName() : null)
                                .locationId(m.getLocation() != null ? m.getLocation().getId() : null)
                                .seasonId(m.getSeason() != null ? m.getSeason().getId() : null)
                                .taskId(m.getTask() != null ? m.getTask().getId() : null)
                                .build();
        }
}
