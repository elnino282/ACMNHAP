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
 * REST endpoints for farmers to manage suppliers, supply items, and supply
 * lots.
 * Provides full CRUD operations for managing farm supply chain data.
 */
@RestController
@RequestMapping("/api/v1/farmer")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('FARMER')")
@Tag(name = "Farmer Suppliers & Supplies", description = "Farmer supplier and supply management with full CRUD")
public class FarmerSupplierController {

        SupplierRepository supplierRepository;
        SupplyItemRepository supplyItemRepository;
        SupplyLotRepository supplyLotRepository;

        // ==================== SUPPLIERS ====================

        @Operation(summary = "List all suppliers", description = "Get paginated list of all suppliers")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping("/suppliers")
        public ApiResponse<PageResponse<SupplierResponse>> listSuppliers(
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
                Page<Supplier> suppliers = supplierRepository.findAll(PageRequest.of(page, size));
                List<SupplierResponse> items = suppliers.getContent().stream()
                                .map(this::toSupplierResponse)
                                .toList();

                return ApiResponse.success(PageResponse.of(suppliers, items));
        }

        @Operation(summary = "Get supplier by ID", description = "Get supplier details")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @GetMapping("/suppliers/{id}")
        public ApiResponse<SupplierResponse> getSupplier(@PathVariable Integer id) {
                Supplier supplier = supplierRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                return ApiResponse.success(toSupplierResponse(supplier));
        }

        @Operation(summary = "Create supplier", description = "Create a new supplier")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request")
        })
        @PostMapping("/suppliers")
        public ApiResponse<SupplierResponse> createSupplier(@Valid @RequestBody CreateSupplierRequest request) {
                Supplier supplier = Supplier.builder()
                                .name(request.getName())
                                .licenseNo(request.getLicenseNo())
                                .contactEmail(request.getContactEmail())
                                .contactPhone(request.getContactPhone())
                                .build();

                Supplier saved = supplierRepository.save(supplier);
                return ApiResponse.success(toSupplierResponse(saved));
        }

        @Operation(summary = "Update supplier", description = "Update supplier information")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @PutMapping("/suppliers/{id}")
        public ApiResponse<SupplierResponse> updateSupplier(
                        @PathVariable Integer id,
                        @Valid @RequestBody CreateSupplierRequest request) {
                Supplier supplier = supplierRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

                supplier.setName(request.getName());
                supplier.setLicenseNo(request.getLicenseNo());
                supplier.setContactEmail(request.getContactEmail());
                supplier.setContactPhone(request.getContactPhone());

                Supplier saved = supplierRepository.save(supplier);
                return ApiResponse.success(toSupplierResponse(saved));
        }

        @Operation(summary = "Delete supplier", description = "Delete a supplier")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @DeleteMapping("/suppliers/{id}")
        public ApiResponse<Void> deleteSupplier(@PathVariable Integer id) {
                if (!supplierRepository.existsById(id)) {
                        throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
                }
                supplierRepository.deleteById(id);
                return ApiResponse.success(null);
        }

        // ==================== SUPPLY ITEMS ====================

        @Operation(summary = "List all supply items", description = "Get paginated list of all supply items")
        @GetMapping("/supply-items")
        public ApiResponse<PageResponse<SupplyItemResponse>> listSupplyItems(
                        @RequestParam(value = "page", defaultValue = "0") int page,
                        @RequestParam(value = "size", defaultValue = "20") int size) {
                Page<SupplyItem> items = supplyItemRepository.findAll(PageRequest.of(page, size));
                List<SupplyItemResponse> content = items.getContent().stream()
                                .map(this::toSupplyItemResponse)
                                .toList();

                return ApiResponse.success(PageResponse.of(items, content));
        }

        @Operation(summary = "Get supply item by ID", description = "Get supply item details")
        @GetMapping("/supply-items/{id}")
        public ApiResponse<SupplyItemResponse> getSupplyItem(@PathVariable Integer id) {
                SupplyItem item = supplyItemRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                return ApiResponse.success(toSupplyItemResponse(item));
        }

        @Operation(summary = "Create supply item", description = "Create a new supply item")
        @PostMapping("/supply-items")
        public ApiResponse<SupplyItemResponse> createSupplyItem(@Valid @RequestBody CreateSupplyItemRequest request) {
                SupplyItem item = SupplyItem.builder()
                                .name(request.getName())
                                .activeIngredient(request.getActiveIngredient())
                                .unit(request.getUnit())
                                .restrictedFlag(request.getRestrictedFlag())
                                .build();

                SupplyItem saved = supplyItemRepository.save(item);
                return ApiResponse.success(toSupplyItemResponse(saved));
        }

        @Operation(summary = "Update supply item", description = "Update supply item information")
        @PutMapping("/supply-items/{id}")
        public ApiResponse<SupplyItemResponse> updateSupplyItem(
                        @PathVariable Integer id,
                        @Valid @RequestBody CreateSupplyItemRequest request) {
                SupplyItem item = supplyItemRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

                item.setName(request.getName());
                item.setActiveIngredient(request.getActiveIngredient());
                item.setUnit(request.getUnit());
                item.setRestrictedFlag(request.getRestrictedFlag());

                SupplyItem saved = supplyItemRepository.save(item);
                return ApiResponse.success(toSupplyItemResponse(saved));
        }

        @Operation(summary = "Delete supply item", description = "Delete a supply item")
        @DeleteMapping("/supply-items/{id}")
        public ApiResponse<Void> deleteSupplyItem(@PathVariable Integer id) {
                if (!supplyItemRepository.existsById(id)) {
                        throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
                }
                supplyItemRepository.deleteById(id);
                return ApiResponse.success(null);
        }

        // ==================== SUPPLY LOTS ====================

        @Operation(summary = "List all supply lots", description = "Get paginated list of supply lots with filters")
        @GetMapping("/supply-lots")
        public ApiResponse<PageResponse<SupplyLotResponse>> listSupplyLots(
                        @Parameter(description = "Filter by supplier ID") @RequestParam(value = "supplierId", required = false) Integer supplierId,
                        @Parameter(description = "Filter by status") @RequestParam(value = "status", required = false) String status,
                        @RequestParam(value = "page", defaultValue = "0") int page,
                        @RequestParam(value = "size", defaultValue = "20") int size) {
                Page<SupplyLot> lots;
                if (supplierId != null) {
                        Supplier supplier = supplierRepository.findById(supplierId)
                                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                        // Filter by supplier
                        lots = supplyLotRepository.findAll(PageRequest.of(page, size));
                } else {
                        lots = supplyLotRepository.findAll(PageRequest.of(page, size));
                }

                List<SupplyLotResponse> content = lots.getContent().stream()
                                .filter(l -> status == null || status.isBlank() || status.equals(l.getStatus()))
                                .map(this::toSupplyLotResponse)
                                .toList();

                return ApiResponse.success(PageResponse.of(lots, content));
        }

        @Operation(summary = "Get supply lot by ID", description = "Get supply lot details")
        @GetMapping("/supply-lots/{id}")
        public ApiResponse<SupplyLotResponse> getSupplyLot(@PathVariable Integer id) {
                SupplyLot lot = supplyLotRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                return ApiResponse.success(toSupplyLotResponse(lot));
        }

        @Operation(summary = "Create supply lot", description = "Create a new supply lot")
        @PostMapping("/supply-lots")
        public ApiResponse<SupplyLotResponse> createSupplyLot(@Valid @RequestBody CreateSupplyLotRequest request) {
                SupplyItem item = supplyItemRepository.findById(request.getSupplyItemId())
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

                Supplier supplier = null;
                if (request.getSupplierId() != null) {
                        supplier = supplierRepository.findById(request.getSupplierId())
                                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                }

                SupplyLot lot = SupplyLot.builder()
                                .supplyItem(item)
                                .supplier(supplier)
                                .batchCode(request.getBatchCode())
                                .expiryDate(request.getExpiryDate())
                                .status(request.getStatus() != null ? request.getStatus() : "IN_STOCK")
                                .build();

                SupplyLot saved = supplyLotRepository.save(lot);
                return ApiResponse.success(toSupplyLotResponse(saved));
        }

        @Operation(summary = "Update supply lot", description = "Update supply lot information")
        @PutMapping("/supply-lots/{id}")
        public ApiResponse<SupplyLotResponse> updateSupplyLot(
                        @PathVariable Integer id,
                        @Valid @RequestBody CreateSupplyLotRequest request) {
                SupplyLot lot = supplyLotRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

                if (request.getSupplyItemId() != null) {
                        SupplyItem item = supplyItemRepository.findById(request.getSupplyItemId())
                                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                        lot.setSupplyItem(item);
                }

                if (request.getSupplierId() != null) {
                        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                        lot.setSupplier(supplier);
                }

                lot.setBatchCode(request.getBatchCode());
                lot.setExpiryDate(request.getExpiryDate());
                if (request.getStatus() != null) {
                        lot.setStatus(request.getStatus());
                }

                SupplyLot saved = supplyLotRepository.save(lot);
                return ApiResponse.success(toSupplyLotResponse(saved));
        }

        @Operation(summary = "Delete supply lot", description = "Delete a supply lot")
        @DeleteMapping("/supply-lots/{id}")
        public ApiResponse<Void> deleteSupplyLot(@PathVariable Integer id) {
                if (!supplyLotRepository.existsById(id)) {
                        throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
                }
                supplyLotRepository.deleteById(id);
                return ApiResponse.success(null);
        }

        // ==================== MAPPERS ====================

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
                                .activeIngredient(i.getActiveIngredient())
                                .unit(i.getUnit())
                                .restrictedFlag(i.getRestrictedFlag())
                                .build();
        }

        private SupplyLotResponse toSupplyLotResponse(SupplyLot l) {
                return SupplyLotResponse.builder()
                                .id(l.getId())
                                .supplyItemId(l.getSupplyItem() != null ? l.getSupplyItem().getId() : null)
                                .supplyItemName(l.getSupplyItem() != null ? l.getSupplyItem().getName() : null)
                                .supplierId(l.getSupplier() != null ? l.getSupplier().getId() : null)
                                .supplierName(l.getSupplier() != null ? l.getSupplier().getName() : null)
                                .batchCode(l.getBatchCode())
                                .expiryDate(l.getExpiryDate())
                                .status(l.getStatus())
                                .build();
        }
}
