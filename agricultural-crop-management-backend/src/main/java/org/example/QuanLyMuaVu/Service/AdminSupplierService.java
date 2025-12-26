package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
import org.example.QuanLyMuaVu.Entity.StockMovement;
import org.example.QuanLyMuaVu.Entity.Supplier;
import org.example.QuanLyMuaVu.Entity.SupplyItem;
import org.example.QuanLyMuaVu.Entity.SupplyLot;
import org.example.QuanLyMuaVu.Enums.SupplyCategory;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.StockMovementRepository;
import org.example.QuanLyMuaVu.Repository.SupplierRepository;
import org.example.QuanLyMuaVu.Repository.SupplyItemRepository;
import org.example.QuanLyMuaVu.Repository.SupplyLotRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Admin Supplier and Supply management.
 * Provides CRUD operations with validation for restricted items.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminSupplierService {

    SupplierRepository supplierRepository;
    SupplyItemRepository supplyItemRepository;
    SupplyLotRepository supplyLotRepository;
    StockMovementRepository stockMovementRepository;

    // ═══════════════════════════════════════════════════════════════
    // SUPPLIER CRUD
    // ═══════════════════════════════════════════════════════════════

    public PageResponse<SupplierResponse> listSuppliers(String keyword, int page, int size) {
        Page<Supplier> supplierPage = supplierRepository.searchByKeyword(keyword, PageRequest.of(page, size));
        List<SupplierResponse> content = supplierPage.getContent().stream()
                .map(this::toSupplierResponse)
                .collect(Collectors.toList());
        return PageResponse.of(supplierPage, content);
    }

    public SupplierResponse getSupplierById(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        return toSupplierResponse(supplier);
    }

    @Transactional
    public SupplierResponse createSupplier(CreateSupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .licenseNo(request.getLicenseNo())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .build();

        Supplier saved = supplierRepository.save(supplier);
        log.info("Created supplier: id={}, name={}", saved.getId(), saved.getName());
        return toSupplierResponse(saved);
    }

    @Transactional
    public SupplierResponse updateSupplier(Integer id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        supplier.setName(request.getName());
        supplier.setLicenseNo(request.getLicenseNo());
        supplier.setContactEmail(request.getContactEmail());
        supplier.setContactPhone(request.getContactPhone());

        Supplier saved = supplierRepository.save(supplier);
        log.info("Updated supplier: id={}", saved.getId());
        return toSupplierResponse(saved);
    }

    @Transactional
    public void deleteSupplier(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        // Guard: cannot delete if has active lots
        if (supplyLotRepository.existsBySupplier(supplier)) {
            throw new AppException(ErrorCode.SUPPLIER_HAS_ACTIVE_LOTS);
        }

        supplierRepository.delete(supplier);
        log.info("Deleted supplier: id={}", id);
    }

    // ═══════════════════════════════════════════════════════════════
    // SUPPLY ITEM CRUD
    // ═══════════════════════════════════════════════════════════════

    public PageResponse<SupplyItemResponse> listSupplyItems(String keyword, String category, Boolean restricted,
            int page, int size) {
        SupplyCategory categoryEnum = null;
        if (category != null && !category.isBlank()) {
            try {
                categoryEnum = SupplyCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore invalid category
            }
        }

        Page<SupplyItem> itemPage = supplyItemRepository.searchWithFilters(keyword, categoryEnum, restricted,
                PageRequest.of(page, size));
        List<SupplyItemResponse> content = itemPage.getContent().stream()
                .map(this::toSupplyItemResponse)
                .collect(Collectors.toList());
        return PageResponse.of(itemPage, content);
    }

    public SupplyItemResponse getSupplyItemById(Integer id) {
        SupplyItem item = supplyItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_ITEM_NOT_FOUND));
        return toSupplyItemResponse(item);
    }

    @Transactional
    public SupplyItemResponse createSupplyItem(CreateSupplyItemRequest request) {
        SupplyCategory categoryEnum = null;
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            try {
                categoryEnum = SupplyCategory.valueOf(request.getCategory().toUpperCase());
            } catch (IllegalArgumentException e) {
                // default to OTHER
                categoryEnum = SupplyCategory.OTHER;
            }
        }

        SupplyItem item = SupplyItem.builder()
                .name(request.getName())
                .category(categoryEnum)
                .activeIngredient(request.getActiveIngredient())
                .unit(request.getUnit())
                .restrictedFlag(request.getRestrictedFlag())
                .description(request.getDescription())
                .build();

        SupplyItem saved = supplyItemRepository.save(item);
        log.info("Created supply item: id={}, name={}, restricted={}", saved.getId(), saved.getName(),
                saved.getRestrictedFlag());
        return toSupplyItemResponse(saved);
    }

    @Transactional
    public SupplyItemResponse updateSupplyItem(Integer id, UpdateSupplyItemRequest request) {
        SupplyItem item = supplyItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_ITEM_NOT_FOUND));

        SupplyCategory categoryEnum = null;
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            try {
                categoryEnum = SupplyCategory.valueOf(request.getCategory().toUpperCase());
            } catch (IllegalArgumentException e) {
                categoryEnum = item.getCategory(); // keep existing
            }
        }

        item.setName(request.getName());
        item.setCategory(categoryEnum);
        item.setActiveIngredient(request.getActiveIngredient());
        item.setUnit(request.getUnit());
        item.setRestrictedFlag(request.getRestrictedFlag());
        item.setDescription(request.getDescription());

        SupplyItem saved = supplyItemRepository.save(item);
        log.info("Updated supply item: id={}", saved.getId());
        return toSupplyItemResponse(saved);
    }

    @Transactional
    public void deleteSupplyItem(Integer id) {
        SupplyItem item = supplyItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_ITEM_NOT_FOUND));

        // Guard: cannot delete if has active lots
        if (supplyLotRepository.existsBySupplyItem(item)) {
            throw new AppException(ErrorCode.SUPPLY_ITEM_HAS_ACTIVE_LOTS);
        }

        supplyItemRepository.delete(item);
        log.info("Deleted supply item: id={}", id);
    }

    // ═══════════════════════════════════════════════════════════════
    // SUPPLY LOT CRUD
    // ═══════════════════════════════════════════════════════════════

    public PageResponse<SupplyLotResponse> listSupplyLots(Integer supplierId, Integer itemId, String status, int page,
            int size) {
        Page<SupplyLot> lotPage = supplyLotRepository.searchWithFilters(supplierId, itemId, status,
                PageRequest.of(page, size));
        List<SupplyLotResponse> content = lotPage.getContent().stream()
                .map(this::toSupplyLotResponse)
                .collect(Collectors.toList());
        return PageResponse.of(lotPage, content);
    }

    public SupplyLotResponse getSupplyLotById(Integer id) {
        SupplyLot lot = supplyLotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_LOT_NOT_FOUND));
        return toSupplyLotResponse(lot);
    }

    @Transactional
    public SupplyLotResponse createSupplyLot(CreateSupplyLotRequest request) {
        SupplyItem item = supplyItemRepository.findById(request.getSupplyItemId())
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_ITEM_NOT_FOUND));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        }

        // Validation: restricted items require supplier with valid license
        validateRestrictedItemSupplier(item, supplier);

        SupplyLot lot = SupplyLot.builder()
                .supplyItem(item)
                .supplier(supplier)
                .batchCode(request.getBatchCode())
                .expiryDate(request.getExpiryDate())
                .status(request.getStatus() != null ? request.getStatus() : "IN_STOCK")
                .build();

        SupplyLot saved = supplyLotRepository.save(lot);
        log.info("Created supply lot: id={}, batchCode={}, itemId={}, supplierId={}",
                saved.getId(), saved.getBatchCode(), item.getId(), supplier != null ? supplier.getId() : null);
        return toSupplyLotResponse(saved);
    }

    @Transactional
    public SupplyLotResponse updateSupplyLot(Integer id, UpdateSupplyLotRequest request) {
        SupplyLot lot = supplyLotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_LOT_NOT_FOUND));

        SupplyItem item = lot.getSupplyItem();
        if (request.getSupplyItemId() != null && !request.getSupplyItemId().equals(lot.getSupplyItem().getId())) {
            item = supplyItemRepository.findById(request.getSupplyItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_ITEM_NOT_FOUND));
            lot.setSupplyItem(item);
        }

        Supplier supplier = lot.getSupplier();
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
            lot.setSupplier(supplier);
        }

        // Re-validate after updates
        validateRestrictedItemSupplier(item, supplier);

        lot.setBatchCode(request.getBatchCode());
        lot.setExpiryDate(request.getExpiryDate());
        if (request.getStatus() != null) {
            lot.setStatus(request.getStatus());
        }

        SupplyLot saved = supplyLotRepository.save(lot);
        log.info("Updated supply lot: id={}", saved.getId());
        return toSupplyLotResponse(saved);
    }

    @Transactional
    public void deleteSupplyLot(Integer id) {
        SupplyLot lot = supplyLotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_LOT_NOT_FOUND));

        // Guard: cannot delete if has stock movements
        if (stockMovementRepository.existsBySupplyLot(lot)) {
            throw new AppException(ErrorCode.SUPPLY_LOT_HAS_MOVEMENTS);
        }

        supplyLotRepository.delete(lot);
        log.info("Deleted supply lot: id={}", id);
    }

    // ═══════════════════════════════════════════════════════════════
    // LOT MOVEMENTS TRACKING
    // ═══════════════════════════════════════════════════════════════

    public PageResponse<StockMovementResponse> getLotMovements(Integer lotId, int page, int size) {
        SupplyLot lot = supplyLotRepository.findById(lotId)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLY_LOT_NOT_FOUND));

        Page<StockMovement> movementPage = stockMovementRepository
                .findBySupplyLotOrderByMovementDateDesc(lot, PageRequest.of(page, size));

        List<StockMovementResponse> content = movementPage.getContent().stream()
                .map(this::toMovementResponse)
                .collect(Collectors.toList());

        return PageResponse.of(movementPage, content);
    }

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION HELPERS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Validates that restricted items have a supplier with a valid license.
     */
    private void validateRestrictedItemSupplier(SupplyItem item, Supplier supplier) {
        if (Boolean.TRUE.equals(item.getRestrictedFlag())) {
            if (supplier == null || supplier.getLicenseNo() == null || supplier.getLicenseNo().isBlank()) {
                log.warn("Restricted item {} requires supplier with license", item.getId());
                throw new AppException(ErrorCode.RESTRICTED_ITEM_REQUIRES_LICENSE);
            }
        }
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
                .category(i.getCategory() != null ? i.getCategory().name() : null)
                .activeIngredient(i.getActiveIngredient())
                .unit(i.getUnit())
                .restrictedFlag(i.getRestrictedFlag())
                .description(i.getDescription())
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

    private StockMovementResponse toMovementResponse(StockMovement m) {
        String locationName = null;
        if (m.getLocation() != null) {
            var loc = m.getLocation();
            locationName = String.join("-",
                    loc.getZone() != null ? loc.getZone() : "",
                    loc.getAisle() != null ? loc.getAisle() : "",
                    loc.getShelf() != null ? loc.getShelf() : "",
                    loc.getBin() != null ? loc.getBin() : "").replaceAll("^-+|-+$", "").replaceAll("-+", "-");
            if (locationName.isEmpty()) {
                locationName = "Location #" + loc.getId();
            }
        }

        return StockMovementResponse.builder()
                .id(m.getId())
                .movementType(m.getMovementType() != null ? m.getMovementType().name() : null)
                .quantity(m.getQuantity())
                .movementDate(m.getMovementDate())
                .note(m.getNote())
                .warehouseId(m.getWarehouse() != null ? m.getWarehouse().getId() : null)
                .warehouseName(m.getWarehouse() != null ? m.getWarehouse().getName() : null)
                .locationId(m.getLocation() != null ? m.getLocation().getId() : null)
                .locationName(locationName)
                .build();
    }
}
