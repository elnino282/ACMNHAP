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
import org.example.QuanLyMuaVu.DTO.Request.PlotRequest;
import org.example.QuanLyMuaVu.DTO.Response.PlotResponse;
import org.example.QuanLyMuaVu.Service.PlotService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST endpoints for managing plots under farms for the current farmer.
 * Plots are the spatial unit to which seasons and operations are attached
 * in business flows [2], [3], [4] and [5].
 */

@RestController
@RequestMapping
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('FARMER')")
public class PlotController {

    PlotService plotService;

    @Operation(summary = "List plots of current farmer", description = "List all plots belonging to the current authenticated farmer")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/api/v1/plots")
    public ApiResponse<List<PlotResponse>> listPlotsForCurrentFarmer() {
        return ApiResponse.success(plotService.listPlotsForCurrentFarmer());
    }

    @Operation(summary = "Create plot for current farmer", description = "Create a new plot associated with the current farmer")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    @PostMapping("/api/v1/plots")
    public ApiResponse<PlotResponse> createPlotForCurrentFarmer(
            @Valid @RequestBody PlotRequest request
    ) {
        return ApiResponse.success(plotService.createPlotForCurrentFarmer(request));
    }

    @Operation(summary = "List plots of a farm", description = "List plots of a farm belonging to the current farmer")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
    })
    @GetMapping("/api/v1/farms/{farmId}/plots")
    public ApiResponse<PageResponse<PlotResponse>> listPlotsByFarm(
            @PathVariable Integer farmId,
            @Parameter(description = "Page index (0-based)")
            @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        List<PlotResponse> items = plotService.listPlotsByFarm(farmId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, items.size());
        List<PlotResponse> pageItems =
                fromIndex >= items.size() ? List.of() : items.subList(fromIndex, toIndex);
        Page<PlotResponse> pageData = new PageImpl<>(pageItems, pageable, items.size());

        return ApiResponse.success(PageResponse.of(pageData, pageItems));
    }

    @Operation(summary = "Create plot in farm", description = "Create a new plot within a given farm")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    @PostMapping("/api/v1/farms/{farmId}/plots")
    public ApiResponse<PlotResponse> createPlot(
            @PathVariable Integer farmId,
            @Valid @RequestBody PlotRequest request
    ) {
        return ApiResponse.success(plotService.createPlotForFarm(farmId, request));
    }

    @Operation(summary = "Get plot detail", description = "Get plot detail belonging to current farmer")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
    })
    @GetMapping("/api/v1/plots/{id}")
    public ApiResponse<PlotResponse> getPlot(@PathVariable Integer id) {
        return ApiResponse.success(plotService.getPlotForCurrentFarmer(id));
    }

    @Operation(summary = "Update plot", description = "Update plot information of current farmer")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    @PutMapping("/api/v1/plots/{id}")
    public ApiResponse<PlotResponse> updatePlot(
            @PathVariable Integer id,
            @Valid @RequestBody PlotRequest request
    ) {
        return ApiResponse.success(plotService.updatePlotForCurrentFarmer(id, request));
    }

    @Operation(summary = "Delete plot", description = "Delete or archive a plot of current farmer")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
    })
    @DeleteMapping("/api/v1/plots/{id}")
    public ApiResponse<Void> deletePlot(@PathVariable Integer id) {
        plotService.deletePlotForCurrentFarmer(id);
        return ApiResponse.success(null);
    }
}
