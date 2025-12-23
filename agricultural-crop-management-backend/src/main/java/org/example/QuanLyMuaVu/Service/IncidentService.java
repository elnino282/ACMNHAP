package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Request.CreateIncidentRequest;
import org.example.QuanLyMuaVu.DTO.Request.UpdateIncidentRequest;
import org.example.QuanLyMuaVu.DTO.Response.IncidentResponse;
import org.example.QuanLyMuaVu.Entity.Incident;
import org.example.QuanLyMuaVu.Entity.Season;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Enums.IncidentSeverity;
import org.example.QuanLyMuaVu.Enums.IncidentStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.IncidentRepository;
import org.example.QuanLyMuaVu.Repository.SeasonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class IncidentService {

    IncidentRepository incidentRepository;
    SeasonRepository seasonRepository;
    FarmAccessService farmAccessService;

    public List<IncidentResponse> listBySeason(Integer seasonId) {
        Season season = getSeasonForCurrentFarmer(seasonId);
        return incidentRepository.findAllBySeason(season)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public IncidentResponse create(Integer seasonId, CreateIncidentRequest request) {
        Season season = getSeasonForCurrentFarmer(seasonId);
        User reporter = getCurrentUser();

        Incident incident = Incident.builder()
                .season(season)
                .reportedBy(reporter)
                .incidentType(request.getIncidentType())
                .severity(IncidentSeverity.fromCode(request.getSeverity()))
                .description(request.getDescription())
                .status(IncidentStatus.OPEN)
                .deadline(request.getDeadline())
                .createdAt(LocalDateTime.now())
                .build();

        Incident saved = incidentRepository.save(incident);
        return toResponse(saved);
    }

    public IncidentResponse update(Integer id, UpdateIncidentRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        // Ensure the current farmer is a member of the season's farm
        getSeasonForCurrentFarmer(incident.getSeason().getId());

        if (request.getSeverity() != null) {
            incident.setSeverity(IncidentSeverity.fromCode(request.getSeverity()));
        }
        if (request.getDescription() != null) {
            incident.setDescription(request.getDescription());
        }
        if (request.getDeadline() != null) {
            incident.setDeadline(request.getDeadline());
        }
        IncidentStatus newStatus = IncidentStatus.fromCode(request.getStatus());
        IncidentStatus currentStatus = incident.getStatus();
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        incident.setStatus(newStatus);

        if (request.getResolvedAt() != null) {
            incident.setResolvedAt(request.getResolvedAt());
        } else if (newStatus == IncidentStatus.RESOLVED && incident.getResolvedAt() == null) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        Incident saved = incidentRepository.save(incident);
        return toResponse(saved);
    }

    public void delete(Integer id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        // Ownership / membership check
        getSeasonForCurrentFarmer(incident.getSeason().getId());
        incidentRepository.delete(incident);
    }

    private Season getSeasonForCurrentFarmer(Integer id) {
        User currentUser = getCurrentUser();
        Season season = seasonRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SEASON_NOT_FOUND));
        farmAccessService.assertCurrentUserCanAccessSeason(season);
        return season;
    }

    private User getCurrentUser() {
        return farmAccessService.getCurrentUser();
    }

    private IncidentResponse toResponse(Incident incident) {
        Season season = incident.getSeason();
        User reporter = incident.getReportedBy();
        return IncidentResponse.builder()
                .id(incident.getId())
                .seasonId(season != null ? season.getId() : null)
                .seasonName(season != null ? season.getSeasonName() : null)
                .reportedById(reporter != null ? reporter.getId() : null)
                .reportedByUsername(reporter != null ? reporter.getUsername() : null)
                .incidentType(incident.getIncidentType())
                .severity(incident.getSeverity() != null ? incident.getSeverity().name() : null)
                .description(incident.getDescription())
                .status(incident.getStatus() != null ? incident.getStatus().name() : null)
                .deadline(incident.getDeadline())
                .resolvedAt(incident.getResolvedAt())
                .createdAt(incident.getCreatedAt())
                .build();
    }

    private boolean isValidStatusTransition(IncidentStatus currentStatus, IncidentStatus targetStatus) {
        if (targetStatus == null) {
            return false;
        }
        if (currentStatus == null) {
            return targetStatus == IncidentStatus.OPEN;
        }
        if (currentStatus == targetStatus) {
            return true;
        }
        return switch (currentStatus) {
            case OPEN -> targetStatus == IncidentStatus.IN_PROGRESS
                    || targetStatus == IncidentStatus.RESOLVED
                    || targetStatus == IncidentStatus.CANCELLED;
            case IN_PROGRESS -> targetStatus == IncidentStatus.RESOLVED
                    || targetStatus == IncidentStatus.CANCELLED;
            case RESOLVED, CANCELLED -> false;
        };
    }
}
