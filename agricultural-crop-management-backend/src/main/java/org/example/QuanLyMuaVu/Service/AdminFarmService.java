package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Response.FarmDetailResponse;
import org.example.QuanLyMuaVu.DTO.Response.FarmResponse;
import org.example.QuanLyMuaVu.Entity.Farm;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Mapper.FarmMapper;
import org.example.QuanLyMuaVu.Repository.FarmRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminFarmService {

    FarmRepository farmRepository;
    FarmMapper farmMapper;

    public PageResponse<FarmResponse> getAllFarms(String keyword, Boolean active, int page, int size) {
        log.info("Admin fetching all farms - keyword: {}, active: {}, page: {}, size: {}", keyword, active, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<Farm> farmPage;

        if (keyword != null && !keyword.isBlank()) {
            if (active != null) {
                farmPage = farmRepository.findByNameContainingIgnoreCaseAndActive(keyword, active, pageable);
            } else {
                farmPage = farmRepository.findByNameContainingIgnoreCase(keyword, pageable);
            }
        } else if (active != null) {
            farmPage = farmRepository.findByActive(active, pageable);
        } else {
            farmPage = farmRepository.findAll(pageable);
        }

        List<FarmResponse> content = farmPage.getContent().stream()
                .map(farmMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.of(farmPage, content);
    }

    public FarmDetailResponse getFarmById(Integer farmId) {
        log.info("Admin fetching farm detail for ID: {}", farmId);

        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        return FarmDetailResponse.builder()
                .id(farm.getId())
                .name(farm.getName())
                .provinceId(farm.getProvince() != null ? farm.getProvince().getId() : null)
                .wardId(farm.getWard() != null ? farm.getWard().getId() : null)
                .provinceName(farm.getProvince() != null ? farm.getProvince().getName() : null)
                .wardName(farm.getWard() != null ? farm.getWard().getName() : null)
                .area(farm.getArea())
                .active(farm.getActive())
                .ownerUsername(farm.getOwner() != null ? farm.getOwner().getUsername() : null)
                .build();
    }
}
