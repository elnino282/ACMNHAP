package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Response.SeasonResponse;
import org.example.QuanLyMuaVu.DTO.Response.SeasonDetailResponse;
import org.example.QuanLyMuaVu.Service.AdminSeasonService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin REST endpoints for system-wide season and task monitoring.
 */
@RestController
@RequestMapping("/api/v1/admin/seasons")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminSeasonController {

    AdminSeasonService adminSeasonService;

    @Operation(summary = "List all seasons (Admin)", description = "Get paginated list of all seasons across the system with optional filters")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping
    public ApiResponse<PageResponse<SeasonResponse>> listAllSeasons(
            @Parameter(description = "Filter by status (PLANNED, ACTIVE, COMPLETED, CANCELLED, ARCHIVED)") @RequestParam(value = "status", required = false) String status,
            @Parameter(description = "Filter by crop ID") @RequestParam(value = "cropId", required = false) Integer cropId,
            @Parameter(description = "Filter by plot ID") @RequestParam(value = "plotId", required = false) Integer plotId,
            @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
        return ApiResponse.success(adminSeasonService.getAllSeasons(status, cropId, plotId, page, size));
    }

    @Operation(summary = "Get season detail (Admin)", description = "Get detailed information about a specific season including tasks, expenses, harvests, incidents")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Season not found")
    })
    @GetMapping("/{id}")
    public ApiResponse<SeasonDetailResponse> getSeasonDetail(@PathVariable Integer id) {
        return ApiResponse.success(adminSeasonService.getSeasonById(id));
    }
}
