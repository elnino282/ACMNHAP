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
import org.example.QuanLyMuaVu.DTO.Response.PlotResponse;
import org.example.QuanLyMuaVu.DTO.Response.SeasonResponse;
import org.example.QuanLyMuaVu.Entity.Plot;
import org.example.QuanLyMuaVu.Entity.Season;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.PlotRepository;
import org.example.QuanLyMuaVu.Repository.SeasonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin REST endpoints for system-wide plot management.
 * Returns all plots across all farms for administrative purposes.
 */
@RestController
@RequestMapping("/api/v1/admin/plots")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Plots", description = "Admin endpoints for system-wide plot management")
public class AdminPlotController {

        PlotRepository plotRepository;
        SeasonRepository seasonRepository;

        @Operation(summary = "List all plots (Admin)", description = "Get paginated list of all plots across all farms")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping
        public ApiResponse<PageResponse<PlotResponse>> listAllPlots(
                        @Parameter(description = "Filter by farm ID") @RequestParam(value = "farmId", required = false) Integer farmId,
                        @Parameter(description = "Search by name") @RequestParam(value = "keyword", required = false) String keyword,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {

                Page<Plot> plotPage = plotRepository.findAll(PageRequest.of(page, size));

                List<PlotResponse> content = plotPage.getContent().stream()
                                .map(this::toPlotResponse)
                                .collect(Collectors.toList());

                return ApiResponse.success(PageResponse.of(plotPage, content));
        }

        @Operation(summary = "Get plot detail (Admin)", description = "Get detailed information about a specific plot")
        @GetMapping("/{id}")
        public ApiResponse<PlotResponse> getPlot(@PathVariable Integer id) {
                Plot plot = plotRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
                return ApiResponse.success(toPlotResponse(plot));
        }

        @Operation(summary = "Get plot seasons (Admin)", description = "Get all seasons for a specific plot")
        @GetMapping("/{id}/seasons")
        public ApiResponse<List<SeasonResponse>> listPlotSeasons(@PathVariable Integer id) {
                Plot plot = plotRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));

                List<Season> seasons = seasonRepository.findByPlot(plot);

                return ApiResponse.success(seasons.stream()
                                .map(this::toSeasonResponse)
                                .collect(Collectors.toList()));
        }

        private PlotResponse toPlotResponse(Plot p) {
                return PlotResponse.builder()
                                .id(p.getId())
                                .userName(p.getUser() != null ? p.getUser().getUsername() : null)
                                .plotName(p.getPlotName())
                                .provinceId(p.getProvince() != null ? p.getProvince().getId() : null)
                                .wardId(p.getWard() != null ? p.getWard().getId() : null)
                                .area(p.getArea())
                                .soilType(p.getSoilType())
                                .status(p.getStatus())
                                .createdAt(p.getCreatedAt())
                                .build();
        }

        private SeasonResponse toSeasonResponse(Season s) {
                return SeasonResponse.builder()
                                .id(s.getId())
                                .seasonName(s.getSeasonName())
                                .startDate(s.getStartDate())
                                .endDate(s.getEndDate())
                                .status(s.getStatus() != null ? s.getStatus().name() : null)
                                .plotId(s.getPlot() != null ? s.getPlot().getId() : null)
                                .cropId(s.getCrop() != null ? s.getCrop().getId() : null)
                                .varietyId(s.getVariety() != null ? s.getVariety().getId() : null)
                                .plannedHarvestDate(s.getPlannedHarvestDate())
                                .expectedYieldKg(s.getExpectedYieldKg())
                                .actualYieldKg(s.getActualYieldKg())
                                .build();
        }
}
