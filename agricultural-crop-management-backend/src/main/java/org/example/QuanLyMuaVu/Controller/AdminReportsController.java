package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Response.AdminReportResponse;
import org.example.QuanLyMuaVu.Service.AdminReportsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin REST endpoints for reports and analytics.
 */
@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportsController {

    AdminReportsService adminReportsService;

    @Operation(summary = "Expenses by month", description = "Get monthly expense totals across the system")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/expenses-by-month")
    public ApiResponse<List<AdminReportResponse.MonthlyTotal>> getExpensesByMonth(
            @Parameter(description = "Year to filter") @RequestParam(value = "year", required = false) Integer year) {
        return ApiResponse.success(adminReportsService.getExpensesByMonth(year));
    }

    @Operation(summary = "Harvest by season", description = "Get harvest totals per season")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/harvest-by-season")
    public ApiResponse<List<AdminReportResponse.SeasonHarvest>> getHarvestBySeason() {
        return ApiResponse.success(adminReportsService.getHarvestBySeason());
    }

    @Operation(summary = "Incidents summary", description = "Get incidents count by severity and status")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/incidents-summary")
    public ApiResponse<AdminReportResponse.IncidentsSummary> getIncidentsSummary() {
        return ApiResponse.success(adminReportsService.getIncidentsSummary());
    }

    @Operation(summary = "Inventory movements", description = "Get inventory movements by month and type")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/inventory-movements")
    public ApiResponse<List<AdminReportResponse.MovementSummary>> getInventoryMovements(
            @Parameter(description = "Year to filter") @RequestParam(value = "year", required = false) Integer year) {
        return ApiResponse.success(adminReportsService.getInventoryMovements(year));
    }
}
