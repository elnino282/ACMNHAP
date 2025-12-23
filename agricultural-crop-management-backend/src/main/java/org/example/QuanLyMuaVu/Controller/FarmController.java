package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Request.FarmCreateRequest;
import org.example.QuanLyMuaVu.DTO.Request.FarmUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Response.FarmDetailResponse;
import org.example.QuanLyMuaVu.DTO.Response.FarmResponse;
import org.example.QuanLyMuaVu.Service.FarmService;
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

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST endpoints for managing farms of the current farmer.
 * Farms are the root aggregate for plots, seasons, stock, harvests and
 * incidents
 * across business flows [2], [3], [4], [5] and [10].
 */

@RestController
@RequestMapping("/api/v1/farms")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('FARMER')")
public class FarmController {

        FarmService farmService;

        @Operation(summary = "List farms", description = "Get list of farms for the current authenticated farmer")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping
        public ApiResponse<PageResponse<FarmResponse>> listFarms(
                        @Parameter(description = "Keyword to search by farm name") @RequestParam(value = "keyword", required = false) String keyword,
                        @Parameter(description = "Filter by active status") @RequestParam(value = "active", required = false) Boolean active,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
                return ApiResponse.success(farmService.getMyFarms(keyword, active, page, size));
        }

        @Operation(summary = "Create farm", description = "Create a new farm for the current farmer")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Created"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
        })
        @PostMapping
        public ApiResponse<FarmDetailResponse> createFarm(@Valid @RequestBody FarmCreateRequest request) {
                return ApiResponse.success(farmService.create(request));
        }

        @Operation(summary = "Get farm detail", description = "Get farm detail for the current farmer")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @GetMapping("/{id}")
        public ApiResponse<FarmDetailResponse> getFarm(@PathVariable Integer id) {
                return ApiResponse.success(farmService.getMyFarm(id));
        }

        @Operation(summary = "Update farm", description = "Update farm information")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
        })
        @PutMapping("/{id}")
        public ApiResponse<FarmDetailResponse> updateFarm(
                        @PathVariable Integer id,
                        @Valid @RequestBody FarmUpdateRequest request) {
                return ApiResponse.success(farmService.update(id, request));
        }

        @Operation(summary = "Delete/deactivate farm", description = "Soft delete or deactivate a farm of the current farmer")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @DeleteMapping("/{id}")
        public ApiResponse<Void> deleteFarm(@PathVariable Integer id) {
                farmService.delete(id);
                return ApiResponse.success(null);
        }

        @Operation(summary = "Get farm plots", description = "Get all plots for a specific farm")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @GetMapping("/{id}/plots")
        public ApiResponse<List<org.example.QuanLyMuaVu.DTO.Response.PlotResponse>> getFarmPlots(
                        @PathVariable Integer id) {
                return ApiResponse.success(farmService.getFarmPlots(id));
        }
}
