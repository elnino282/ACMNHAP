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
import org.example.QuanLyMuaVu.DTO.Response.SupplierResponse;
import org.example.QuanLyMuaVu.DTO.Response.SupplyItemResponse;
import org.example.QuanLyMuaVu.DTO.Response.SupplyLotResponse;
import org.example.QuanLyMuaVu.Entity.Supplier;
import org.example.QuanLyMuaVu.Entity.SupplyItem;
import org.example.QuanLyMuaVu.Entity.SupplyLot;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.SupplierRepository;
import org.example.QuanLyMuaVu.Repository.SupplyItemRepository;
import org.example.QuanLyMuaVu.Repository.SupplyLotRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin REST endpoints for system-wide supplier and supply management.
 * Returns all suppliers, supply items, and supply lots for administrative
 * purposes.
 */
@RestController
@RequestMapping("/api/v1/admin/suppliers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Suppliers", description = "Admin endpoints for system-wide supplier management")
public class AdminSupplierController {

        SupplierRepository supplierRepository;
        SupplyItemRepository supplyItemRepository;
        SupplyLotRepository supplyLotRepository;

        // ═══════════════════════════════════════════════════════════════
        // SUPPLIERS
        // ═══════════════════════════════════════════════════════════════

        @Operation(summary = "List all suppliers (Admin)", description = "Get paginated list of all suppliers")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping
        public ApiResponse<PageResponse<SupplierResponse>> listSuppliers(
                        @Parameter(description = "Search by name") @RequestParam(value = "keyword", required = false) String keyword,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {

                Page<Supplier> supplierPage = supplierRepository.findAll(PageRequest.of(page, size));

                List<SupplierResponse> content = supplierPage.getContent().stream()
                                .map(this::toSupplierResponse)
                                .collect(Collectors.toList());

                return ApiResponse.success(PageResponse.of(supplierPage, content));
        }

        @Operation(summary = "Get supplier detail (Admin)", description = "Get detailed information about a specific supplier")
        @GetMapping("/{id}")
        public ApiResponse<SupplierResponse> getSupplier(@PathVariable Integer id) {
                Supplier supplier = supplierRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                return ApiResponse.success(toSupplierResponse(supplier));
        }

        // ═══════════════════════════════════════════════════════════════
        // SUPPLY ITEMS
        // ═══════════════════════════════════════════════════════════════

        @Operation(summary = "List all supply items (Admin)", description = "Get paginated list of all supply items")
        @GetMapping("/items")
        public ApiResponse<PageResponse<SupplyItemResponse>> listSupplyItems(
                        @Parameter(description = "Search by name") @RequestParam(value = "keyword", required = false) String keyword,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {

                Page<SupplyItem> itemPage = supplyItemRepository.findAll(PageRequest.of(page, size));

                List<SupplyItemResponse> content = itemPage.getContent().stream()
                                .map(this::toSupplyItemResponse)
                                .collect(Collectors.toList());

                return ApiResponse.success(PageResponse.of(itemPage, content));
        }

        @Operation(summary = "Get supply item detail (Admin)", description = "Get detailed information about a specific supply item")
        @GetMapping("/items/{id}")
        public ApiResponse<SupplyItemResponse> getSupplyItem(@PathVariable Integer id) {
                SupplyItem item = supplyItemRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                return ApiResponse.success(toSupplyItemResponse(item));
        }

        // ═══════════════════════════════════════════════════════════════
        // SUPPLY LOTS
        // ═══════════════════════════════════════════════════════════════

        @Operation(summary = "List all supply lots (Admin)", description = "Get paginated list of all supply lots")
        @GetMapping("/lots")
        public ApiResponse<PageResponse<SupplyLotResponse>> listSupplyLots(
                        @Parameter(description = "Filter by supplier ID") @RequestParam(value = "supplierId", required = false) Integer supplierId,
                        @Parameter(description = "Filter by status") @RequestParam(value = "status", required = false) String status,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {

                Page<SupplyLot> lotPage = supplyLotRepository.findAll(PageRequest.of(page, size));

                List<SupplyLotResponse> content = lotPage.getContent().stream()
                                .map(this::toSupplyLotResponse)
                                .collect(Collectors.toList());

                return ApiResponse.success(PageResponse.of(lotPage, content));
        }

        @Operation(summary = "Get supply lot detail (Admin)", description = "Get detailed information about a specific supply lot")
        @GetMapping("/lots/{id}")
        public ApiResponse<SupplyLotResponse> getSupplyLot(@PathVariable Integer id) {
                SupplyLot lot = supplyLotRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                return ApiResponse.success(toSupplyLotResponse(lot));
        }

        // ═══════════════════════════════════════════════════════════════
        // MAPPERS
        // ═══════════════════════════════════════════════════════════════

        private SupplierResponse toSupplierResponse(Supplier s) {
                return SupplierResponse.builder()
                                .id(s.getId())
                                .name(s.getName())
                                .licenseNo(s.getLicenseNo())
                                .contactEmail(s.getContactEmail())
                                .contactPhone(s.getContactPhone())
                                .build();
        }

        private SupplyItemResponse toSupplyItemResponse(SupplyItem i) {
                return SupplyItemResponse.builder()
                                .id(i.getId())
                                .name(i.getName())
                                .unit(i.getUnit())
                                .activeIngredient(i.getActiveIngredient())
                                .restrictedFlag(i.getRestrictedFlag())
                                .build();
        }

        private SupplyLotResponse toSupplyLotResponse(SupplyLot l) {
                return SupplyLotResponse.builder()
                                .id(l.getId())
                                .batchCode(l.getBatchCode())
                                .expiryDate(l.getExpiryDate())
                                .status(l.getStatus())
                                .supplierId(l.getSupplier() != null ? l.getSupplier().getId() : null)
                                .supplierName(l.getSupplier() != null ? l.getSupplier().getName() : null)
                                .supplyItemId(l.getSupplyItem() != null ? l.getSupplyItem().getId() : null)
                                .supplyItemName(l.getSupplyItem() != null ? l.getSupplyItem().getName() : null)
                                .build();
        }
}
