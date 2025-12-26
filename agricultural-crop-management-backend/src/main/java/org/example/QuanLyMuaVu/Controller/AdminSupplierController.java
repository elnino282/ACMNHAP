package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Request.CreateSupplierRequest;
import org.example.QuanLyMuaVu.DTO.Request.CreateSupplyItemRequest;
import org.example.QuanLyMuaVu.DTO.Request.CreateSupplyLotRequest;
import org.example.QuanLyMuaVu.DTO.Request.UpdateSupplierRequest;
import org.example.QuanLyMuaVu.DTO.Request.UpdateSupplyItemRequest;
import org.example.QuanLyMuaVu.DTO.Request.UpdateSupplyLotRequest;
import org.example.QuanLyMuaVu.DTO.Response.StockMovementResponse;
import org.example.QuanLyMuaVu.DTO.Response.SupplierResponse;
import org.example.QuanLyMuaVu.DTO.Response.SupplyItemResponse;
import org.example.QuanLyMuaVu.DTO.Response.SupplyLotResponse;
import org.example.QuanLyMuaVu.Service.AdminSupplierService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin REST endpoints for system-wide supplier and supply management.
 * Provides full CRUD operations for suppliers, supply items, and supply lots.
 */
@RestController
@RequestMapping("/api/v1/admin/suppliers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Suppliers", description = "Admin endpoints for system-wide supplier management")
public class AdminSupplierController {

        AdminSupplierService adminSupplierService;

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
                return ApiResponse.success(adminSupplierService.listSuppliers(keyword, page, size));
        }

        @Operation(summary = "Get supplier detail (Admin)", description = "Get detailed information about a specific supplier")
        @GetMapping("/{id}")
        public ApiResponse<SupplierResponse> getSupplier(@PathVariable Integer id) {
                return ApiResponse.success(adminSupplierService.getSupplierById(id));
        }

        @Operation(summary = "Create supplier (Admin)", description = "Create a new supplier")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request")
        })
        @PostMapping
        public ApiResponse<SupplierResponse> createSupplier(@Valid @RequestBody CreateSupplierRequest request) {
                return ApiResponse.success(adminSupplierService.createSupplier(request));
        }

        @Operation(summary = "Update supplier (Admin)", description = "Update an existing supplier")
        @PutMapping("/{id}")
        public ApiResponse<SupplierResponse> updateSupplier(
                        @PathVariable Integer id,
                        @Valid @RequestBody UpdateSupplierRequest request) {
                return ApiResponse.success(adminSupplierService.updateSupplier(id, request));
        }

        @Operation(summary = "Delete supplier (Admin)", description = "Delete a supplier (fails if has active lots)")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict - has active lots")
        })
        @DeleteMapping("/{id}")
        public ApiResponse<Void> deleteSupplier(@PathVariable Integer id) {
                adminSupplierService.deleteSupplier(id);
                return ApiResponse.success(null);
        }

        // ═══════════════════════════════════════════════════════════════
        // SUPPLY ITEMS
        // ═══════════════════════════════════════════════════════════════

        @Operation(summary = "List all supply items (Admin)", description = "Get paginated list of all supply items with filters")
        @GetMapping("/items")
        public ApiResponse<PageResponse<SupplyItemResponse>> listSupplyItems(
                        @Parameter(description = "Search by name") @RequestParam(value = "keyword", required = false) String keyword,
                        @Parameter(description = "Filter by category") @RequestParam(value = "category", required = false) String category,
                        @Parameter(description = "Filter by restricted flag") @RequestParam(value = "restricted", required = false) Boolean restricted,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
                return ApiResponse.success(
                                adminSupplierService.listSupplyItems(keyword, category, restricted, page, size));
        }

        @Operation(summary = "Get supply item detail (Admin)", description = "Get detailed information about a specific supply item")
        @GetMapping("/items/{id}")
        public ApiResponse<SupplyItemResponse> getSupplyItem(@PathVariable Integer id) {
                return ApiResponse.success(adminSupplierService.getSupplyItemById(id));
        }

        @Operation(summary = "Create supply item (Admin)", description = "Create a new supply item")
        @PostMapping("/items")
        public ApiResponse<SupplyItemResponse> createSupplyItem(@Valid @RequestBody CreateSupplyItemRequest request) {
                return ApiResponse.success(adminSupplierService.createSupplyItem(request));
        }

        @Operation(summary = "Update supply item (Admin)", description = "Update an existing supply item")
        @PutMapping("/items/{id}")
        public ApiResponse<SupplyItemResponse> updateSupplyItem(
                        @PathVariable Integer id,
                        @Valid @RequestBody UpdateSupplyItemRequest request) {
                return ApiResponse.success(adminSupplierService.updateSupplyItem(id, request));
        }

        @Operation(summary = "Delete supply item (Admin)", description = "Delete a supply item (fails if has active lots)")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict - has active lots")
        })
        @DeleteMapping("/items/{id}")
        public ApiResponse<Void> deleteSupplyItem(@PathVariable Integer id) {
                adminSupplierService.deleteSupplyItem(id);
                return ApiResponse.success(null);
        }

        // ═══════════════════════════════════════════════════════════════
        // SUPPLY LOTS
        // ═══════════════════════════════════════════════════════════════

        @Operation(summary = "List all supply lots (Admin)", description = "Get paginated list of all supply lots with filters")
        @GetMapping("/lots")
        public ApiResponse<PageResponse<SupplyLotResponse>> listSupplyLots(
                        @Parameter(description = "Filter by supplier ID") @RequestParam(value = "supplierId", required = false) Integer supplierId,
                        @Parameter(description = "Filter by supply item ID") @RequestParam(value = "itemId", required = false) Integer itemId,
                        @Parameter(description = "Filter by status") @RequestParam(value = "status", required = false) String status,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
                return ApiResponse.success(adminSupplierService.listSupplyLots(supplierId, itemId, status, page, size));
        }

        @Operation(summary = "Get supply lot detail (Admin)", description = "Get detailed information about a specific supply lot")
        @GetMapping("/lots/{id}")
        public ApiResponse<SupplyLotResponse> getSupplyLot(@PathVariable Integer id) {
                return ApiResponse.success(adminSupplierService.getSupplyLotById(id));
        }

        @Operation(summary = "Create supply lot (Admin)", description = "Create a new supply lot (validates restricted items require licensed supplier)")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request - restricted item requires supplier with license")
        })
        @PostMapping("/lots")
        public ApiResponse<SupplyLotResponse> createSupplyLot(@Valid @RequestBody CreateSupplyLotRequest request) {
                return ApiResponse.success(adminSupplierService.createSupplyLot(request));
        }

        @Operation(summary = "Update supply lot (Admin)", description = "Update an existing supply lot")
        @PutMapping("/lots/{id}")
        public ApiResponse<SupplyLotResponse> updateSupplyLot(
                        @PathVariable Integer id,
                        @Valid @RequestBody UpdateSupplyLotRequest request) {
                return ApiResponse.success(adminSupplierService.updateSupplyLot(id, request));
        }

        @Operation(summary = "Delete supply lot (Admin)", description = "Delete a supply lot (fails if has stock movements)")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict - has stock movements")
        })
        @DeleteMapping("/lots/{id}")
        public ApiResponse<Void> deleteSupplyLot(@PathVariable Integer id) {
                adminSupplierService.deleteSupplyLot(id);
                return ApiResponse.success(null);
        }

        @Operation(summary = "Get lot stock movements (Admin)", description = "Get paginated list of stock movements for a specific lot")
        @GetMapping("/lots/{id}/movements")
        public ApiResponse<PageResponse<StockMovementResponse>> getLotMovements(
                        @PathVariable Integer id,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
                return ApiResponse.success(adminSupplierService.getLotMovements(id, page, size));
        }
}
