package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Request.AdminReportFilter;
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

        // ═══════════════════════════════════════════════════════════════
        // LEGACY ENDPOINTS (backward compatibility)
        // ═══════════════════════════════════════════════════════════════

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

        // ═══════════════════════════════════════════════════════════════
        // NEW ANALYTICS ENDPOINTS
        // ═══════════════════════════════════════════════════════════════

        @Operation(summary = "Yield Report", description = "Compare expected vs actual yield by season/crop/plot")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping("/yield")
        public ApiResponse<List<AdminReportResponse.YieldReport>> getYieldReport(
                        @Parameter(description = "Year to filter by season start date") @RequestParam(value = "year", required = false) Integer year,
                        @Parameter(description = "From date (YYYY-MM-DD)") @RequestParam(value = "fromDate", required = false) String fromDateStr,
                        @Parameter(description = "To date (YYYY-MM-DD)") @RequestParam(value = "toDate", required = false) String toDateStr,
                        @Parameter(description = "Crop ID filter") @RequestParam(value = "cropId", required = false) Integer cropId,
                        @Parameter(description = "Farm ID filter") @RequestParam(value = "farmId", required = false) Integer farmId,
                        @Parameter(description = "Plot ID filter") @RequestParam(value = "plotId", required = false) Integer plotId) {
                var filter = AdminReportFilter.builder()
                                .year(year)
                                .fromDate(fromDateStr != null && !fromDateStr.isEmpty()
                                                ? java.time.LocalDate.parse(fromDateStr)
                                                : null)
                                .toDate(toDateStr != null && !toDateStr.isEmpty() ? java.time.LocalDate.parse(toDateStr)
                                                : null)
                                .cropId(cropId).farmId(farmId).plotId(plotId)
                                .build();
                return ApiResponse.success(adminReportsService.getYieldReport(filter));
        }

        @Operation(summary = "Cost Report", description = "Total expenses per season with cost per kg calculation")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping("/cost")
        public ApiResponse<List<AdminReportResponse.CostReport>> getCostReport(
                        @Parameter(description = "Year to filter by season start date") @RequestParam(value = "year", required = false) Integer year,
                        @Parameter(description = "From date (YYYY-MM-DD)") @RequestParam(value = "fromDate", required = false) String fromDateStr,
                        @Parameter(description = "To date (YYYY-MM-DD)") @RequestParam(value = "toDate", required = false) String toDateStr,
                        @Parameter(description = "Crop ID filter") @RequestParam(value = "cropId", required = false) Integer cropId,
                        @Parameter(description = "Farm ID filter") @RequestParam(value = "farmId", required = false) Integer farmId,
                        @Parameter(description = "Plot ID filter") @RequestParam(value = "plotId", required = false) Integer plotId) {
                var filter = AdminReportFilter.builder()
                                .year(year)
                                .fromDate(fromDateStr != null && !fromDateStr.isEmpty()
                                                ? java.time.LocalDate.parse(fromDateStr)
                                                : null)
                                .toDate(toDateStr != null && !toDateStr.isEmpty() ? java.time.LocalDate.parse(toDateStr)
                                                : null)
                                .cropId(cropId).farmId(farmId).plotId(plotId)
                                .build();
                return ApiResponse.success(adminReportsService.getCostReport(filter));
        }

        @Operation(summary = "Revenue Report", description = "Total revenue from harvests (quantity * unit price)")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping("/revenue")
        public ApiResponse<List<AdminReportResponse.RevenueReport>> getRevenueReport(
                        @Parameter(description = "Year to filter by season start date") @RequestParam(value = "year", required = false) Integer year,
                        @Parameter(description = "From date (YYYY-MM-DD)") @RequestParam(value = "fromDate", required = false) String fromDateStr,
                        @Parameter(description = "To date (YYYY-MM-DD)") @RequestParam(value = "toDate", required = false) String toDateStr,
                        @Parameter(description = "Crop ID filter") @RequestParam(value = "cropId", required = false) Integer cropId,
                        @Parameter(description = "Farm ID filter") @RequestParam(value = "farmId", required = false) Integer farmId,
                        @Parameter(description = "Plot ID filter") @RequestParam(value = "plotId", required = false) Integer plotId) {
                var filter = AdminReportFilter.builder()
                                .year(year)
                                .fromDate(fromDateStr != null && !fromDateStr.isEmpty()
                                                ? java.time.LocalDate.parse(fromDateStr)
                                                : null)
                                .toDate(toDateStr != null && !toDateStr.isEmpty() ? java.time.LocalDate.parse(toDateStr)
                                                : null)
                                .cropId(cropId).farmId(farmId).plotId(plotId)
                                .build();
                return ApiResponse.success(adminReportsService.getRevenueReport(filter));
        }

        @Operation(summary = "Profit Report", description = "Combined revenue and expense analysis with profit margins")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping("/profit")
        public ApiResponse<List<AdminReportResponse.ProfitReport>> getProfitReport(
                        @Parameter(description = "Year to filter by season start date") @RequestParam(value = "year", required = false) Integer year,
                        @Parameter(description = "From date (YYYY-MM-DD)") @RequestParam(value = "fromDate", required = false) String fromDateStr,
                        @Parameter(description = "To date (YYYY-MM-DD)") @RequestParam(value = "toDate", required = false) String toDateStr,
                        @Parameter(description = "Crop ID filter") @RequestParam(value = "cropId", required = false) Integer cropId,
                        @Parameter(description = "Farm ID filter") @RequestParam(value = "farmId", required = false) Integer farmId,
                        @Parameter(description = "Plot ID filter") @RequestParam(value = "plotId", required = false) Integer plotId) {
                var filter = AdminReportFilter.builder()
                                .year(year)
                                .fromDate(fromDateStr != null && !fromDateStr.isEmpty()
                                                ? java.time.LocalDate.parse(fromDateStr)
                                                : null)
                                .toDate(toDateStr != null && !toDateStr.isEmpty() ? java.time.LocalDate.parse(toDateStr)
                                                : null)
                                .cropId(cropId).farmId(farmId).plotId(plotId)
                                .build();
                return ApiResponse.success(adminReportsService.getProfitReport(filter));
        }

        @Operation(summary = "Task Performance", description = "Task completion rate and overdue rate")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping("/task-performance")
        public ApiResponse<AdminReportResponse.TaskPerformanceReport> getTaskPerformance(
                        @Parameter(description = "Year to filter by task created date") @RequestParam(value = "year", required = false) Integer year) {
                return ApiResponse.success(adminReportsService.getTaskPerformance(year));
        }

        @Operation(summary = "Inventory On-Hand", description = "Current stock snapshot by warehouse")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping("/inventory-onhand")
        public ApiResponse<List<AdminReportResponse.InventoryOnHandReport>> getInventoryOnHand() {
                return ApiResponse.success(adminReportsService.getInventoryOnHand());
        }

        @Operation(summary = "Incident Statistics", description = "Incident breakdown by type, severity, status with resolution metrics")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping("/incident-statistics")
        public ApiResponse<AdminReportResponse.IncidentStatisticsReport> getIncidentStatistics(
                        @Parameter(description = "Year to filter by incident created date") @RequestParam(value = "year", required = false) Integer year) {
                return ApiResponse.success(adminReportsService.getIncidentStatistics(year));
        }
}
