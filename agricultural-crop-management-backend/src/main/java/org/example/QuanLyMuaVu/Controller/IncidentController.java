package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Request.CreateIncidentRequest;
import org.example.QuanLyMuaVu.DTO.Request.UpdateIncidentRequest;
import org.example.QuanLyMuaVu.DTO.Response.IncidentResponse;
import org.example.QuanLyMuaVu.Service.IncidentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST endpoints for recording and managing season incidents
 * (business flow [10]) for farms where the current user is a member.
 */

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IncidentController {

    IncidentService incidentService;

    @Operation(summary = "List incidents of season", description = "List all incidents recorded for a season")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Season not found")
    })
    @PreAuthorize("hasRole('FARMER')")
    @GetMapping("/seasons/{seasonId}/incidents")
    public ApiResponse<List<IncidentResponse>> list(@PathVariable Integer seasonId) {
        return ApiResponse.success(incidentService.listBySeason(seasonId));
    }

    @Operation(summary = "Create incident", description = "Create a new incident for a season")
    @PreAuthorize("hasRole('FARMER')")
    @PostMapping("/seasons/{seasonId}/incidents")
    public ApiResponse<IncidentResponse> create(
            @PathVariable Integer seasonId,
            @Valid @RequestBody CreateIncidentRequest request
    ) {
        return ApiResponse.success(incidentService.create(seasonId, request));
    }

    @Operation(summary = "Update incident", description = "Update an incident's status, severity, and deadlines")
    @PreAuthorize("hasRole('FARMER')")
    @PutMapping("/incidents/{id}")
    public ApiResponse<IncidentResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateIncidentRequest request
    ) {
        return ApiResponse.success(incidentService.update(id, request));
    }

    @Operation(summary = "Delete incident", description = "Delete an incident if allowed")
    @PreAuthorize("hasRole('FARMER')")
    @DeleteMapping("/incidents/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        incidentService.delete(id);
        return ApiResponse.success(null);
    }
}
