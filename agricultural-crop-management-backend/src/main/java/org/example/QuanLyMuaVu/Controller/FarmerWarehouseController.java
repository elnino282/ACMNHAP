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
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Entity.Warehouse;
import org.example.QuanLyMuaVu.Enums.StockMovementType;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.FarmRepository;
import org.example.QuanLyMuaVu.Repository.StockLocationRepository;
import org.example.QuanLyMuaVu.Repository.StockMovementRepository;
import org.example.QuanLyMuaVu.Repository.WarehouseRepository;
import org.example.QuanLyMuaVu.Service.FarmAccessService;
import org.example.QuanLyMuaVu.Service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * REST endpoints for farmers to list their warehouses, stock locations, and
 * movements.
 * Warehouses are linked to farms owned by the current farmer.
 */
@RestController
@RequestMapping("/api/v1/farmer/warehouses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('FARMER')")
@Tag(name = "Farmer Warehouses", description = "Farmer warehouse and inventory listing")
public class FarmerWarehouseController {

        WarehouseRepository warehouseRepository;
        StockLocationRepository stockLocationRepository;
        StockMovementRepository stockMovementRepository;
        FarmRepository farmRepository;
        FarmAccessService farmAccessService;
        UserService userService;

        @Operation(summary = "List farmer's warehouses", description = "Get all warehouses for farms owned by the current farmer")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping
        public ApiResponse<List<WarehouseResponse>> listWarehouses(Authentication authentication) {
                User currentUser = userService.getUserByUsername(authentication.getName());
                List<Farm> farms = farmRepository.findAllByOwner(currentUser);

                List<WarehouseResponse> result = new ArrayList<>();
                for (Farm farm : farms) {
                        List<Warehouse> warehouses = warehouseRepository.findAllByFarm(farm);
                        for (Warehouse w : warehouses) {
                                List<StockLocation> locations = stockLocationRepository.findAllByWarehouse(w);
                                result.add(toWarehouseResponse(w, locations.size()));
                        }
                }

                return ApiResponse.success(result);
        }

        @Operation(summary = "Get warehouse detail", description = "Get warehouse detail with location count")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @GetMapping("/{id}")
        public ApiResponse<WarehouseResponse> getWarehouse(@PathVariable Integer id) {
                Warehouse warehouse = warehouseRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                assertWarehouseAccess(warehouse);

                List<StockLocation> locations = stockLocationRepository.findAllByWarehouse(warehouse);
                return ApiResponse.success(toWarehouseResponse(warehouse, locations.size()));
        }

        @Operation(summary = "List warehouse locations", description = "Get all stock locations for a warehouse")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found")
        })
        @GetMapping("/{id}/locations")
        public ApiResponse<List<StockLocationResponse>> listLocations(@PathVariable Integer id) {
                Warehouse warehouse = warehouseRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                assertWarehouseAccess(warehouse);

                List<StockLocation> locations = stockLocationRepository.findAllByWarehouse(warehouse);
                List<StockLocationResponse> result = locations.stream()
                                .map(this::toLocationResponse)
                                .toList();

                return ApiResponse.success(result);
        }

        @Operation(summary = "List warehouse movements", description = "Get paginated stock movements for a warehouse with optional filters")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Warehouse not found")
        })
        @GetMapping("/{id}/movements")
        public ApiResponse<PageResponse<StockMovementResponse>> listMovements(
                        @PathVariable Integer id,
                        @Parameter(description = "From date (yyyy-MM-dd'T'HH:mm:ss)") @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
                        @Parameter(description = "To date (yyyy-MM-dd'T'HH:mm:ss)") @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
                        @Parameter(description = "Movement type: IN, OUT, ADJUST") @RequestParam(value = "type", required = false) String type,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
                Warehouse warehouse = warehouseRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                assertWarehouseAccess(warehouse);

                StockMovementType movementType = null;
                if (type != null && !type.isBlank()) {
                        movementType = StockMovementType.fromCode(type);
                }

                Page<StockMovement> movements = stockMovementRepository.findByWarehouseWithFilters(
                                warehouse, from, to, movementType, PageRequest.of(page, size));

                List<StockMovementResponse> items = movements.getContent().stream()
                                .map(this::toMovementResponse)
                                .toList();

                return ApiResponse.success(PageResponse.of(movements, items));
        }

        private void assertWarehouseAccess(Warehouse warehouse) {
                if (warehouse.getFarm() == null) {
                        throw new AppException(ErrorCode.FORBIDDEN);
                }
                farmAccessService.assertCurrentUserCanAccessFarm(warehouse.getFarm());
        }

        private WarehouseResponse toWarehouseResponse(Warehouse w, int locationCount) {
                return WarehouseResponse.builder()
                                .id(w.getId())
                                .name(w.getName())
                                .type(w.getType())
                                .farmId(w.getFarm() != null ? w.getFarm().getId() : null)
                                .farmName(w.getFarm() != null ? w.getFarm().getName() : null)
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
                                .warehouseId(l.getWarehouse() != null ? l.getWarehouse().getId() : null)
                                .zone(l.getZone())
                                .aisle(l.getAisle())
                                .shelf(l.getShelf())
                                .bin(l.getBin())
                                .build();
        }

        private StockMovementResponse toMovementResponse(StockMovement m) {
                return StockMovementResponse.builder()
                                .id(m.getId())
                                .supplyLotId(m.getSupplyLot() != null ? m.getSupplyLot().getId() : null)
                                .supplyItemName(m.getSupplyLot() != null && m.getSupplyLot().getSupplyItem() != null
                                                ? m.getSupplyLot().getSupplyItem().getName()
                                                : null)
                                .warehouseId(m.getWarehouse() != null ? m.getWarehouse().getId() : null)
                                .warehouseName(m.getWarehouse() != null ? m.getWarehouse().getName() : null)
                                .locationId(m.getLocation() != null ? m.getLocation().getId() : null)
                                .movementType(m.getMovementType() != null ? m.getMovementType().name() : null)
                                .quantity(m.getQuantity())
                                .movementDate(m.getMovementDate())
                                .seasonId(m.getSeason() != null ? m.getSeason().getId() : null)
                                .taskId(m.getTask() != null ? m.getTask().getId() : null)
                                .note(m.getNote())
                                .build();
        }
}
