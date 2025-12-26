package org.example.QuanLyMuaVu.DTO.Response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IncidentResponse {

    Integer id;
    Integer seasonId;
    String seasonName;
    Long reportedById;
    String reportedByUsername;
    String incidentType;
    String severity;
    String description;
    String status;
    LocalDate deadline;

    // Assignment
    Long assigneeId;
    String assigneeUsername;

    // Resolution tracking
    LocalDateTime resolvedAt;
    Long resolvedById;
    String resolvedByUsername;
    String resolutionNote;

    // Cancellation tracking
    String cancellationReason;

    LocalDateTime createdAt;
}
