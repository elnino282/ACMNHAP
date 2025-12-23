package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Response.IncidentResponse;
import org.example.QuanLyMuaVu.Entity.Incident;
import org.example.QuanLyMuaVu.Enums.IncidentStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Mapper.IncidentMapper;
import org.example.QuanLyMuaVu.Repository.IncidentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminIncidentService {

    IncidentRepository incidentRepository;
    IncidentMapper incidentMapper;

    public PageResponse<IncidentResponse> getAllIncidents(String status, String severity, String type, int page,
            int size) {
        log.info("Admin fetching all incidents - status: {}, severity: {}, type: {}, page: {}, size: {}",
                status, severity, type, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<Incident> incidentPage = incidentRepository.findAll(pageable);

        List<IncidentResponse> content = incidentPage.getContent().stream()
                .filter(i -> status == null || (i.getStatus() != null && i.getStatus().name().equals(status)))
                .filter(i -> severity == null || (i.getSeverity() != null && i.getSeverity().name().equals(severity)))
                .filter(i -> type == null || (i.getIncidentType() != null && i.getIncidentType().equals(type)))
                .map(incidentMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.of(incidentPage, content);
    }

    public IncidentResponse getIncidentById(Integer incidentId) {
        log.info("Admin fetching incident detail for ID: {}", incidentId);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new AppException(ErrorCode.INCIDENT_NOT_FOUND));

        return incidentMapper.toResponse(incident);
    }

    @Transactional
    public IncidentResponse updateStatus(Integer incidentId, String newStatus) {
        log.info("Admin updating incident {} status to: {}", incidentId, newStatus);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new AppException(ErrorCode.INCIDENT_NOT_FOUND));

        IncidentStatus targetStatus = IncidentStatus.valueOf(newStatus);
        incident.setStatus(targetStatus);

        // Set resolved_at when status changes to RESOLVED
        if (targetStatus == IncidentStatus.RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        incidentRepository.save(incident);
        return incidentMapper.toResponse(incident);
    }
}
