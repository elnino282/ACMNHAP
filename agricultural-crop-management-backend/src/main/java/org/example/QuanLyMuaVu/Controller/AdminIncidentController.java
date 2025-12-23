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
import org.example.QuanLyMuaVu.DTO.Request.UpdateIncidentStatusRequest;
import org.example.QuanLyMuaVu.DTO.Response.IncidentResponse;
import org.example.QuanLyMuaVu.Service.AdminIncidentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin REST endpoints for system-wide incident management.
 */
@RestController
@RequestMapping("/api/v1/admin/incidents")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminIncidentController {

    AdminIncidentService adminIncidentService;

    @Operation(summary = "List all incidents (Admin)", description = "Get paginated list of all incidents across the system with optional filters")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping
    public ApiResponse<PageResponse<IncidentResponse>> listAllIncidents(
            @Parameter(description = "Filter by status (OPEN, IN_PROGRESS, RESOLVED, CANCELLED)") @RequestParam(value = "status", required = false) String status,
            @Parameter(description = "Filter by severity (LOW, MEDIUM, HIGH)") @RequestParam(value = "severity", required = false) String severity,
            @Parameter(description = "Filter by incident type") @RequestParam(value = "type", required = false) String type,
            @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
        return ApiResponse.success(adminIncidentService.getAllIncidents(status, severity, type, page, size));
    }

    @Operation(summary = "Get incident detail (Admin)", description = "Get detailed information about a specific incident")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Incident not found")
    })
    @GetMapping("/{id}")
    public ApiResponse<IncidentResponse> getIncidentDetail(@PathVariable Integer id) {
        return ApiResponse.success(adminIncidentService.getIncidentById(id));
    }

    @Operation(summary = "Update incident status (Admin)", description = "Update incident status (OPEN -> IN_PROGRESS -> RESOLVED)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Incident not found")
    })
    @PatchMapping("/{id}/status")
    public ApiResponse<IncidentResponse> updateIncidentStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateIncidentStatusRequest request) {
        return ApiResponse.success(adminIncidentService.updateStatus(id, request.getStatus()));
    }
}
