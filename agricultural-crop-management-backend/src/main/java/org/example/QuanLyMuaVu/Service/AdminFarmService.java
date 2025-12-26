package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Request.AdminFarmUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Request.AdminPlotCreateRequest;
import org.example.QuanLyMuaVu.DTO.Response.FarmDetailResponse;
import org.example.QuanLyMuaVu.DTO.Response.FarmResponse;
import org.example.QuanLyMuaVu.DTO.Response.PlotResponse;
import org.example.QuanLyMuaVu.Entity.Farm;
import org.example.QuanLyMuaVu.Entity.Plot;
import org.example.QuanLyMuaVu.Entity.Province;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Entity.Ward;
import org.example.QuanLyMuaVu.Enums.PlotStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Mapper.FarmMapper;
import org.example.QuanLyMuaVu.Repository.FarmRepository;
import org.example.QuanLyMuaVu.Repository.PlotRepository;
import org.example.QuanLyMuaVu.Repository.ProvinceRepository;
import org.example.QuanLyMuaVu.Repository.UserRepository;
import org.example.QuanLyMuaVu.Repository.WardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminFarmService {

    FarmRepository farmRepository;
    FarmMapper farmMapper;
    UserRepository userRepository;
    PlotRepository plotRepository;
    ProvinceRepository provinceRepository;
    WardRepository wardRepository;

    /**
     * List all farms with search and pagination.
     * Uses @EntityGraph for N+1 prevention.
     */
    public PageResponse<FarmResponse> getAllFarms(String keyword, Boolean active, int page, int size) {
        log.info("Admin fetching all farms - keyword: {}, active: {}, page: {}, size: {}", keyword, active, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<Farm> farmPage;

        if (active != null) {
            farmPage = farmRepository.searchByKeywordAndActive(keyword, active, pageable);
        } else {
            farmPage = farmRepository.searchByKeyword(keyword, pageable);
        }

        List<FarmResponse> content = farmPage.getContent().stream()
                .map(farmMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.of(farmPage, content);
    }

    /**
     * Get farm detail by ID.
     */
    public FarmDetailResponse getFarmById(Integer farmId) {
        log.info("Admin fetching farm detail for ID: {}", farmId);

        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        return toDetailResponse(farm);
    }

    /**
     * Update farm with owner reassignment and cascade update to plots.
     * All fields are required (PUT semantics).
     */
    @Transactional
    public FarmDetailResponse updateFarm(Integer farmId, AdminFarmUpdateRequest request) {
        log.info("Admin updating farm ID: {}", farmId);

        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        // Data normalization: trim and capitalize
        farm.setName(capitalizeWords(request.getName().trim()));

        // Province/Ward consistency validation
        Province province = provinceRepository.findById(request.getProvinceId())
                .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));
        Ward ward = wardRepository.findById(request.getWardId())
                .orElseThrow(() -> new AppException(ErrorCode.WARD_NOT_FOUND));

        // Validate ward belongs to province
        if (!ward.getProvince().getId().equals(province.getId())) {
            throw new AppException(ErrorCode.WARD_NOT_IN_PROVINCE);
        }
        farm.setProvince(province);
        farm.setWard(ward);

        // Owner reassignment with FARMER role validation
        User newOwner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        boolean isFarmer = newOwner.getRoles().stream()
                .anyMatch(role -> "FARMER".equals(role.getCode()));
        if (!isFarmer) {
            throw new AppException(ErrorCode.INVALID_FARM_OWNER_ROLE);
        }

        // CRITICAL: Cascade update plots when owner changes
        boolean ownerChanged = !farm.getOwner().getId().equals(newOwner.getId());
        farm.setOwner(newOwner);

        if (ownerChanged) {
            List<Plot> plots = plotRepository.findAllByFarm_Id(farmId);
            if (!plots.isEmpty()) {
                plots.forEach(plot -> plot.setUser(newOwner));
                plotRepository.saveAll(plots);
                log.info("Cascaded owner update to {} plots for farm ID: {}", plots.size(), farmId);
            }
        }

        farm.setArea(request.getArea());
        farm.setActive(request.getActive());

        Farm saved = farmRepository.save(farm);
        log.info("Farm ID: {} updated successfully", farmId);

        return toDetailResponse(saved);
    }

    /**
     * Add a new plot to an existing farm.
     */
    @Transactional
    public PlotResponse addPlotToFarm(Integer farmId, AdminPlotCreateRequest request) {
        log.info("Admin adding plot to farm ID: {}", farmId);

        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        // Province/Ward validation with auto-inference
        Province province = null;
        Ward ward = null;

        if (request.getProvinceId() != null) {
            province = provinceRepository.findById(request.getProvinceId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));
        }

        if (request.getWardId() != null) {
            ward = wardRepository.findById(request.getWardId())
                    .orElseThrow(() -> new AppException(ErrorCode.WARD_NOT_FOUND));
            // Auto-infer province from ward if not provided
            if (province == null) {
                province = ward.getProvince();
            } else if (!ward.getProvince().getId().equals(province.getId())) {
                throw new AppException(ErrorCode.WARD_NOT_IN_PROVINCE);
            }
        }

        // Build plot using PlotStatus enum
        Plot plot = Plot.builder()
                .farm(farm)
                .plotName(request.getPlotName().trim())
                .area(request.getArea())
                .soilType(request.getSoilType())
                .user(farm.getOwner())
                .status(PlotStatus.IN_USE.getCode())
                .province(province)
                .ward(ward)
                .build();

        Plot saved = plotRepository.save(plot);
        log.info("Plot '{}' added to farm ID: {}", saved.getPlotName(), farmId);

        return toPlotResponse(saved);
    }

    /**
     * Capitalize first letter of each word.
     */
    private String capitalizeWords(String str) {
        if (str == null || str.isEmpty())
            return str;
        return Arrays.stream(str.split("\\s+"))
                .map(word -> word.isEmpty() ? word
                        : Character.toUpperCase(word.charAt(0)) + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    private FarmDetailResponse toDetailResponse(Farm farm) {
        return FarmDetailResponse.builder()
                .id(farm.getId())
                .name(farm.getName())
                .provinceId(farm.getProvince() != null ? farm.getProvince().getId() : null)
                .wardId(farm.getWard() != null ? farm.getWard().getId() : null)
                .provinceName(farm.getProvince() != null ? farm.getProvince().getName() : null)
                .wardName(farm.getWard() != null ? farm.getWard().getName() : null)
                .area(farm.getArea())
                .active(farm.getActive())
                .ownerId(farm.getOwner() != null ? farm.getOwner().getId() : null)
                .ownerUsername(farm.getOwner() != null ? farm.getOwner().getUsername() : null)
                .ownerFullName(farm.getOwner() != null ? farm.getOwner().getFullName() : null)
                .build();
    }

    private PlotResponse toPlotResponse(Plot plot) {
        return PlotResponse.builder()
                .id(plot.getId())
                .plotName(plot.getPlotName())
                .area(plot.getArea())
                .soilType(plot.getSoilType())
                .status(plot.getStatus())
                .provinceId(plot.getProvince() != null ? plot.getProvince().getId() : null)
                .wardId(plot.getWard() != null ? plot.getWard().getId() : null)
                .createdAt(plot.getCreatedAt())
                .build();
    }
}
