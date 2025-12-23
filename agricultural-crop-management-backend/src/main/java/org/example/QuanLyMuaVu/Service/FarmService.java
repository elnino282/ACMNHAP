package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Request.FarmCreateRequest;
import org.example.QuanLyMuaVu.DTO.Request.FarmUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Response.FarmDetailResponse;
import org.example.QuanLyMuaVu.DTO.Response.FarmResponse;
import org.example.QuanLyMuaVu.Entity.Farm;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Mapper.FarmMapper;
import org.example.QuanLyMuaVu.Repository.FarmRepository;
import org.example.QuanLyMuaVu.Repository.PlotRepository;
import org.example.QuanLyMuaVu.Repository.ProvinceRepository;
import org.example.QuanLyMuaVu.Repository.SeasonRepository;
import org.example.QuanLyMuaVu.Repository.UserRepository;
import org.example.QuanLyMuaVu.Repository.WardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class FarmService {

    FarmRepository farmRepository;
    UserRepository userRepository;
    PlotRepository plotRepository;
    SeasonRepository seasonRepository;
    ProvinceRepository provinceRepository;
    WardRepository wardRepository;
    FarmMapper farmMapper;

    public PageResponse<FarmResponse> getMyFarms(String keyword, Boolean active, int page, int size) {
        User currentUser = getCurrentUser();
        List<Farm> farms = farmRepository.findAllByOwner(currentUser);

        String searchKeyword = keyword != null ? keyword.trim().toLowerCase() : "";
        boolean filterActive = active != null;

        List<FarmResponse> items = farms.stream()
                .filter(farm -> !filterActive || active.equals(farm.getActive()))
                .filter(farm -> searchKeyword.isEmpty()
                        || (farm.getName() != null && farm.getName().toLowerCase().contains(searchKeyword)))
                .sorted((f1, f2) -> Integer.compare(
                        f2.getId() != null ? f2.getId() : 0,
                        f1.getId() != null ? f1.getId() : 0))
                .map(farmMapper::toResponse)
                .toList();

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, items.size());
        List<FarmResponse> pageItems = fromIndex >= items.size() ? List.of() : items.subList(fromIndex, toIndex);

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<FarmResponse> pageData = new PageImpl<>(pageItems, pageable, items.size());

        return PageResponse.of(pageData, pageItems);
    }

    public FarmDetailResponse create(FarmCreateRequest request) {
        User currentUser = getCurrentUser();

        if (farmRepository.existsByOwnerAndNameIgnoreCase(currentUser, request.getName())) {
            throw new AppException(ErrorCode.FARM_NAME_EXISTS);
        }

        // Validate Province and Ward (strict validation for create)
        validateProvinceAndWardForCreate(request.getProvinceId(), request.getWardId());

        Farm farm = farmMapper.toEntity(request);
        farm.setOwner(currentUser);
        farm.setActive(true);

        Farm saved = farmRepository.save(farm);
        return farmMapper.toDetailResponse(saved);
    }

    public FarmDetailResponse getMyFarm(Integer id) {
        User currentUser = getCurrentUser();
        Farm farm = farmRepository.findByIdAndOwner(id, currentUser)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));
        return farmMapper.toDetailResponse(farm);
    }

    public FarmDetailResponse update(Integer id, FarmUpdateRequest request) {
        User currentUser = getCurrentUser();
        Farm farm = farmRepository.findByIdAndOwner(id, currentUser)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        // Only check name uniqueness if name is being updated
        if (request.getName() != null
                && !farm.getName().equalsIgnoreCase(request.getName())
                && farmRepository.existsByOwnerAndNameIgnoreCase(currentUser, request.getName())) {
            throw new AppException(ErrorCode.FARM_NAME_EXISTS);
        }

        // Validate Province and Ward if being updated (flexible validation)
        validateProvinceAndWardForUpdate(request.getProvinceId(), request.getWardId());

        farmMapper.updateEntity(farm, request);
        Farm saved = farmRepository.save(farm);
        return farmMapper.toDetailResponse(saved);
    }

    public void delete(Integer id) {
        User currentUser = getCurrentUser();
        Farm farm = farmRepository.findByIdAndOwner(id, currentUser)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        boolean hasPlots = plotRepository.existsByFarm(farm);
        boolean hasSeasons = plotRepository.findAllByFarm(farm).stream()
                .anyMatch(plot -> seasonRepository.existsByPlot_Id(plot.getId()));

        if (hasPlots || hasSeasons) {
            throw new AppException(ErrorCode.FARM_HAS_CHILD_RECORDS);
        }

        farm.setActive(false);
        farmRepository.save(farm);
    }

    private User getCurrentUser() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * Strict validation for creating a farm - both Province and Ward are required.
     */
    private void validateProvinceAndWardForCreate(Integer provinceId, Integer wardId) {
        if (provinceId == null) {
            throw new AppException(ErrorCode.PROVINCE_REQUIRED);
        }
        if (wardId == null) {
            throw new AppException(ErrorCode.WARD_REQUIRED);
        }

        // Validate Province exists
        if (!provinceRepository.existsById(provinceId)) {
            throw new AppException(ErrorCode.PROVINCE_NOT_FOUND);
        }

        // Validate Ward exists
        var ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new AppException(ErrorCode.WARD_NOT_FOUND));

        // Validate that Ward belongs to Province
        if (!ward.getProvince().getId().equals(provinceId)) {
            throw new AppException(ErrorCode.WARD_NOT_IN_PROVINCE);
        }
    }

    /**
     * Flexible validation for updating a farm - Province and Ward are optional.
     * If provided, they must exist and Ward must belong to Province.
     */
    private void validateProvinceAndWardForUpdate(Integer provinceId, Integer wardId) {
        if (provinceId != null) {
            if (!provinceRepository.existsById(provinceId)) {
                throw new AppException(ErrorCode.PROVINCE_NOT_FOUND);
            }
        }

        if (wardId != null) {
            var ward = wardRepository.findById(wardId)
                    .orElseThrow(() -> new AppException(ErrorCode.WARD_NOT_FOUND));

            // If both province and ward are provided, validate that ward belongs to
            // province
            if (provinceId != null && !ward.getProvince().getId().equals(provinceId)) {
                throw new AppException(ErrorCode.WARD_NOT_IN_PROVINCE);
            }
        }
    }

    public List<org.example.QuanLyMuaVu.DTO.Response.PlotResponse> getFarmPlots(Integer farmId) {
        User currentUser = getCurrentUser();
        Farm farm = farmRepository.findByIdAndOwner(farmId, currentUser)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        return plotRepository.findAllByFarm(farm).stream()
                .map(plot -> {
                    var plotMapper = new org.example.QuanLyMuaVu.Mapper.PlotMapper();
                    return plotMapper.toResponse(plot);
                })
                .toList();
    }
}
