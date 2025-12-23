package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Response.SeasonDetailResponse;
import org.example.QuanLyMuaVu.DTO.Response.SeasonResponse;
import org.example.QuanLyMuaVu.Entity.Season;
import org.example.QuanLyMuaVu.Enums.SeasonStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Mapper.SeasonMapper;
import org.example.QuanLyMuaVu.Repository.SeasonRepository;
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
public class AdminSeasonService {

    SeasonRepository seasonRepository;
    SeasonMapper seasonMapper;

    public PageResponse<SeasonResponse> getAllSeasons(String status, Integer cropId, Integer plotId, int page,
            int size) {
        log.info("Admin fetching all seasons - status: {}, cropId: {}, plotId: {}, page: {}, size: {}",
                status, cropId, plotId, page, size);

        Pageable pageable = PageRequest.of(page, size);

        // For simplicity, use findAll and filter - production should use Specification
        Page<Season> seasonPage = seasonRepository.findAll(pageable);

        List<SeasonResponse> content = seasonPage.getContent().stream()
                .filter(s -> status == null || (s.getStatus() != null && s.getStatus().name().equals(status)))
                .filter(s -> cropId == null || (s.getCrop() != null && s.getCrop().getId().equals(cropId)))
                .filter(s -> plotId == null || (s.getPlot() != null && s.getPlot().getId().equals(plotId)))
                .map(seasonMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.of(seasonPage, content);
    }

    public SeasonDetailResponse getSeasonById(Integer seasonId) {
        log.info("Admin fetching season detail for ID: {}", seasonId);

        Season season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new AppException(ErrorCode.SEASON_NOT_FOUND));

        return seasonMapper.toDetailResponse(season);
    }
}
