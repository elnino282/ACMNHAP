package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Response.PlotResponse;
import org.example.QuanLyMuaVu.Entity.Farm;
import org.example.QuanLyMuaVu.Entity.Plot;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Enums.SeasonStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Mapper.PlotMapper;
import org.example.QuanLyMuaVu.Repository.FarmRepository;
import org.example.QuanLyMuaVu.Repository.PlotRepository;
import org.example.QuanLyMuaVu.Repository.SeasonRepository;
import org.example.QuanLyMuaVu.Repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class PlotService {

    PlotRepository plotRepository;
    UserRepository userRepository;
    FarmRepository farmRepository;
    SeasonRepository seasonRepository;
    PlotMapper plotMapper;

    /**
     * Legacy create method that accepts userId inside the request.
     */
    public PlotResponse create(org.example.QuanLyMuaVu.DTO.Request.PlotRequest request) {
        var user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Farm farm = null;
        if (request.getFarmId() != null) {
            farm = farmRepository.findById(request.getFarmId())
                    .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));
        }
        Plot plot = Plot.builder()
                .user(user)
                .farm(farm)
                .build();
        plotMapper.updateEntity(plot, request);
        plot = plotRepository.save(plot);
        return plotMapper.toResponse(plot);
    }

    public List<PlotResponse> getAll() {
        return plotRepository.findAll().stream().map(plotMapper::toResponse).toList();
    }

    public PlotResponse update(Integer id, org.example.QuanLyMuaVu.DTO.Request.PlotRequest request) {
        Plot plot = plotRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
        plotMapper.updateEntity(plot, request);
        return plotMapper.toResponse(plotRepository.save(plot));
    }

    public void delete(Integer id) {
        Plot plot = plotRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
        ensureNoActiveSeasons(plot);
        plotRepository.delete(plot);
    }

    // --- Farmer workspace helpers ---

    public List<PlotResponse> listPlotsForCurrentFarmer() {
        User currentUser = getCurrentUser();
        return plotRepository.findAllByUser(currentUser).stream()
                .map(plotMapper::toResponse)
                .toList();
    }

    public List<PlotResponse> listPlotsByFarm(Integer farmId) {
        User currentUser = getCurrentUser();
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));
        if (!farm.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return plotRepository.findAllByFarm(farm).stream()
                .map(plotMapper::toResponse)
                .toList();
    }

    public PlotResponse createPlotForCurrentFarmer(org.example.QuanLyMuaVu.DTO.Request.PlotRequest request) {
        User currentUser = getCurrentUser();

        if (plotRepository.existsByUserAndPlotNameIgnoreCase(currentUser, request.getPlotName())) {
            throw new AppException(ErrorCode.PLOT_NAME_EXISTS);
        }

        Farm farm = null;
        if (request.getFarmId() != null) {
            farm = farmRepository.findById(request.getFarmId())
                    .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));
            if (!farm.getOwner().getId().equals(currentUser.getId())) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
        }

        Plot plot = Plot.builder()
                .user(currentUser)
                .farm(farm)
                .build();
        plotMapper.updateEntity(plot, request);

        Plot saved = plotRepository.save(plot);
        return plotMapper.toResponse(saved);
    }

    public PlotResponse createPlotForFarm(Integer farmId, org.example.QuanLyMuaVu.DTO.Request.PlotRequest request) {
        User currentUser = getCurrentUser();
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));
        if (!farm.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (plotRepository.existsByUserAndPlotNameIgnoreCase(currentUser, request.getPlotName())) {
            throw new AppException(ErrorCode.PLOT_NAME_EXISTS);
        }

        Plot plot = Plot.builder()
                .user(currentUser)
                .farm(farm)
                .build();
        plotMapper.updateEntity(plot, request);

        Plot saved = plotRepository.save(plot);
        return plotMapper.toResponse(saved);
    }

    public PlotResponse getPlotForCurrentFarmer(Integer id) {
        User currentUser = getCurrentUser();
        Plot plot = plotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
        if (!plot.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return plotMapper.toResponse(plot);
    }

    public PlotResponse updatePlotForCurrentFarmer(Integer id,
            org.example.QuanLyMuaVu.DTO.Request.PlotRequest request) {
        User currentUser = getCurrentUser();
        Plot plot = plotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
        if (!plot.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (!plot.getPlotName().equalsIgnoreCase(request.getPlotName())
                && plotRepository.existsByUserAndPlotNameIgnoreCase(currentUser, request.getPlotName())) {
            throw new AppException(ErrorCode.PLOT_NAME_EXISTS);
        }

        plotMapper.updateEntity(plot, request);

        Plot saved = plotRepository.save(plot);
        return plotMapper.toResponse(saved);
    }

    public void deletePlotForCurrentFarmer(Integer id) {
        User currentUser = getCurrentUser();
        Plot plot = plotRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
        if (!plot.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        ensureNoActiveSeasons(plot);
        plotRepository.delete(plot);
    }

    private void ensureNoActiveSeasons(Plot plot) {
        Set<SeasonStatus> activeStatuses = EnumSet.of(SeasonStatus.PLANNED, SeasonStatus.ACTIVE);
        boolean hasActive = seasonRepository.existsByPlot_IdAndStatusIn(plot.getId(), activeStatuses);
        if (hasActive) {
            throw new AppException(ErrorCode.PLOT_HAS_ACTIVE_SEASONS);
        }
    }

    private User getCurrentUser() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
