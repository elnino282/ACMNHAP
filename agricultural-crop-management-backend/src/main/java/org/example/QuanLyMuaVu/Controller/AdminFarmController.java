package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Request.AdminFarmUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Request.AdminPlotCreateRequest;
import org.example.QuanLyMuaVu.DTO.Response.FarmResponse;
import org.example.QuanLyMuaVu.DTO.Response.FarmDetailResponse;
import org.example.QuanLyMuaVu.DTO.Response.PlotResponse;
import org.example.QuanLyMuaVu.Service.AdminFarmService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin REST endpoints for system-wide farm management.
 * Returns all farms across all owners for administrative purposes.
 */
@RestController
@RequestMapping("/api/v1/admin/farms")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminFarmController {

    AdminFarmService adminFarmService;

    @Operation(summary = "List all farms (Admin)", description = "Get paginated list of all farms across all owners for admin view")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    @GetMapping
    public ApiResponse<PageResponse<FarmResponse>> listAllFarms(
            @Parameter(description = "Keyword to search by farm name or owner name") @RequestParam(value = "keyword", required = false) String keyword,
            @Parameter(description = "Filter by active status") @RequestParam(value = "active", required = false) Boolean active,
            @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
        return ApiResponse.success(adminFarmService.getAllFarms(keyword, active, page, size));
    }

    @Operation(summary = "Get farm detail (Admin)", description = "Get detailed information about a specific farm including plots")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - Admin role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Farm not found")
    })
    @GetMapping("/{id}")
    public ApiResponse<FarmDetailResponse> getFarmDetail(@PathVariable Integer id) {
        return ApiResponse.success(adminFarmService.getFarmById(id));
    }

    @Operation(summary = "Update farm (Admin)", description = "Update farm details including owner reassignment. Owner change cascades to all plots.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Farm updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or non-FARMER owner"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - Admin role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Farm, User, Province or Ward not found")
    })
    @PutMapping("/{id}")
    public ApiResponse<FarmDetailResponse> updateFarm(
            @PathVariable Integer id,
            @Valid @RequestBody AdminFarmUpdateRequest request) {
        return ApiResponse.success(adminFarmService.updateFarm(id, request));
    }

    @Operation(summary = "Add plot to farm (Admin)", description = "Create a new plot under a specific farm")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Plot created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - Admin role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Farm not found")
    })
    @PostMapping("/{id}/plots")
    public ApiResponse<PlotResponse> addPlotToFarm(
            @PathVariable Integer id,
            @Valid @RequestBody AdminPlotCreateRequest request) {
        return ApiResponse.success(adminFarmService.addPlotToFarm(id, request));
    }
}
