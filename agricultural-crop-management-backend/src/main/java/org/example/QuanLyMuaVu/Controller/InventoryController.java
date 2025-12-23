package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Request.RecordStockMovementRequest;
import org.example.QuanLyMuaVu.DTO.Response.StockMovementResponse;
import org.example.QuanLyMuaVu.Service.InventoryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

/**
 * REST endpoints for recording stock movements and querying on-hand quantities
 * in farm warehouses (business flow [4]) for the current farmer’s farms.
 */

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryController {

    InventoryService inventoryService;

    @Operation(summary = "Record stock movement", description = "Record inbound or outbound movement for a supply lot")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @PreAuthorize("hasRole('FARMER')")
    @PostMapping("/movements")
    public ApiResponse<StockMovementResponse> recordMovement(
            @Valid @RequestBody RecordStockMovementRequest request
    ) {
        return ApiResponse.success(inventoryService.recordMovement(request));
    }

    @Operation(summary = "Get on-hand quantity", description = "Get current on-hand quantity for a supply lot at a warehouse/location")
    @PreAuthorize("hasRole('FARMER')")
    @GetMapping("/lots/{lotId}/on-hand")
    public ApiResponse<BigDecimal> getOnHandQuantity(
            @PathVariable Integer lotId,
            @RequestParam("warehouseId") Integer warehouseId,
            @RequestParam(value = "locationId", required = false) Integer locationId
    ) {
        return ApiResponse.success(inventoryService.getOnHandQuantity(lotId, warehouseId, locationId));
    }
}
