package org.example.QuanLyMuaVu.Mapper;

import org.example.QuanLyMuaVu.DTO.Response.IncidentResponse;
import org.example.QuanLyMuaVu.Entity.Incident;
import org.springframework.stereotype.Component;

@Component
public class IncidentMapper {

    public IncidentResponse toResponse(Incident incident) {
        if (incident == null) {
            return null;
        }
        return IncidentResponse.builder()
                .id(incident.getId())
                .seasonId(incident.getSeason() != null ? incident.getSeason().getId() : null)
                .seasonName(incident.getSeason() != null ? incident.getSeason().getSeasonName() : null)
                .reportedById(incident.getReportedBy() != null ? incident.getReportedBy().getId() : null)
                .reportedByUsername(incident.getReportedBy() != null ? incident.getReportedBy().getUsername() : null)
                .incidentType(incident.getIncidentType())
                .severity(incident.getSeverity() != null ? incident.getSeverity().name() : null)
                .description(incident.getDescription())
                .status(incident.getStatus() != null ? incident.getStatus().name() : null)
                .deadline(incident.getDeadline())
                // Assignment
                .assigneeId(incident.getAssignee() != null ? incident.getAssignee().getId() : null)
                .assigneeUsername(incident.getAssignee() != null ? incident.getAssignee().getUsername() : null)
                // Resolution tracking
                .resolvedAt(incident.getResolvedAt())
                .resolvedById(incident.getResolvedBy() != null ? incident.getResolvedBy().getId() : null)
                .resolvedByUsername(incident.getResolvedBy() != null ? incident.getResolvedBy().getUsername() : null)
                .resolutionNote(incident.getResolutionNote())
                // Cancellation tracking
                .cancellationReason(incident.getCancellationReason())
                .createdAt(incident.getCreatedAt())
                .build();
    }
}
