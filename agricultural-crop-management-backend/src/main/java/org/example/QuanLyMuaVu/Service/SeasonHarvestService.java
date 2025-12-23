package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Request.CreateHarvestDetailRequest;
import org.example.QuanLyMuaVu.DTO.Request.UpdateHarvestDetailRequest;
import org.example.QuanLyMuaVu.DTO.Response.HarvestResponse;
import org.example.QuanLyMuaVu.Entity.Harvest;
import org.example.QuanLyMuaVu.Entity.Season;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Enums.SeasonStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Mapper.HarvestMapper;
import org.example.QuanLyMuaVu.Repository.HarvestRepository;
import org.example.QuanLyMuaVu.Repository.SeasonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class SeasonHarvestService {

    HarvestRepository harvestRepository;
    SeasonRepository seasonRepository;
    HarvestMapper harvestMapper;
    FarmAccessService farmAccessService;

    public PageResponse<HarvestResponse> listHarvestsForSeason(
            Integer seasonId,
            LocalDate from,
            LocalDate to,
            int page,
            int size) {
        Season season = getSeasonForCurrentFarmer(seasonId);

        List<Harvest> all = harvestRepository.findAllBySeason_Id(season.getId());

        List<HarvestResponse> items = all.stream()
                .filter(h -> {
                    if (from == null && to == null) {
                        return true;
                    }
                    LocalDate date = h.getHarvestDate();
                    boolean afterFrom = from == null || !date.isBefore(from);
                    boolean beforeTo = to == null || !date.isAfter(to);
                    return afterFrom && beforeTo;
                })
                .sorted((h1, h2) -> Integer.compare(
                        h2.getId() != null ? h2.getId() : 0,
                        h1.getId() != null ? h1.getId() : 0))
                .map(harvestMapper::toResponse)
                .toList();

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, items.size());
        List<HarvestResponse> pageItems = fromIndex >= items.size() ? List.of() : items.subList(fromIndex, toIndex);

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<HarvestResponse> pageData = new PageImpl<>(pageItems, pageable, items.size());

        return PageResponse.of(pageData, pageItems);
    }

    public HarvestResponse createHarvest(Integer seasonId, CreateHarvestDetailRequest request) {
        Season season = getSeasonForCurrentFarmer(seasonId);
        ensureSeasonAllowsHarvest(season);

        validateHarvestDateWithinSeason(season, request.getHarvestDate());

        Harvest harvest = Harvest.builder()
                .season(season)
                .harvestDate(request.getHarvestDate())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .note(request.getNote())
                .build();

        Harvest saved = harvestRepository.save(harvest);
        recomputeSeasonActualYield(season);
        return harvestMapper.toResponse(saved);
    }

    public HarvestResponse getHarvest(Integer id) {
        Harvest harvest = getHarvestForCurrentFarmer(id);
        return harvestMapper.toResponse(harvest);
    }

    public HarvestResponse updateHarvest(Integer id, UpdateHarvestDetailRequest request) {
        Harvest harvest = getHarvestForCurrentFarmer(id);
        ensureSeasonAllowsHarvest(harvest.getSeason());

        validateHarvestDateWithinSeason(harvest.getSeason(), request.getHarvestDate());

        harvest.setHarvestDate(request.getHarvestDate());
        harvest.setQuantity(request.getQuantity());
        harvest.setUnit(request.getUnit());
        harvest.setNote(request.getNote());

        Harvest saved = harvestRepository.save(harvest);
        recomputeSeasonActualYield(harvest.getSeason());
        return harvestMapper.toResponse(saved);
    }

    public void deleteHarvest(Integer id) {
        Harvest harvest = getHarvestForCurrentFarmer(id);
        ensureSeasonAllowsHarvest(harvest.getSeason());

        Season season = harvest.getSeason();
        harvestRepository.delete(harvest);
        if (season != null) {
            recomputeSeasonActualYield(season);
        }
    }

    private void ensureSeasonAllowsHarvest(Season season) {
        if (season == null) {
            throw new AppException(ErrorCode.SEASON_NOT_FOUND);
        }
        if (season.getStatus() == SeasonStatus.PLANNED
                || season.getStatus() == SeasonStatus.CANCELLED
                || season.getStatus() == SeasonStatus.ARCHIVED) {
            throw new AppException(ErrorCode.INVALID_SEASON_STATUS_TRANSITION);
        }
    }

    private void validateHarvestDateWithinSeason(Season season, LocalDate date) {
        LocalDate start = season.getStartDate();
        LocalDate end = season.getEndDate() != null ? season.getEndDate() : season.getPlannedHarvestDate();

        if (start == null || date.isBefore(start)) {
            throw new AppException(ErrorCode.HARVEST_DATE_BEFORE_PLANTING);
        }
        if (end != null && date.isAfter(end)) {
            throw new AppException(ErrorCode.INVALID_SEASON_DATES);
        }
    }

    private Harvest getHarvestForCurrentFarmer(Integer id) {
        Harvest harvest = harvestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HARVEST_NOT_FOUND));

        Season season = harvest.getSeason();
        if (season == null) {
            throw new AppException(ErrorCode.SEASON_NOT_FOUND);
        }

        farmAccessService.assertCurrentUserCanAccessSeason(season);
        return harvest;
    }

    private Season getSeasonForCurrentFarmer(Integer id) {
        Season season = seasonRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SEASON_NOT_FOUND));
        farmAccessService.assertCurrentUserCanAccessSeason(season);
        return season;
    }

    private User getCurrentUser() {
        return farmAccessService.getCurrentUser();
    }

    private void recomputeSeasonActualYield(Season season) {
        if (season == null || season.getId() == null) {
            return;
        }
        List<Harvest> harvests = harvestRepository.findAllBySeason_Id(season.getId());
        BigDecimal total = harvests.stream()
                .map(h -> h.getQuantity() != null ? h.getQuantity() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        season.setActualYieldKg(total);
        seasonRepository.save(season);
    }
}
