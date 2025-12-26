package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Request.CancelIncidentRequest;
import org.example.QuanLyMuaVu.DTO.Request.ResolveIncidentRequest;
import org.example.QuanLyMuaVu.DTO.Request.TriageIncidentRequest;
import org.example.QuanLyMuaVu.DTO.Response.IncidentResponse;
import org.example.QuanLyMuaVu.Entity.Incident;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Enums.IncidentSeverity;
import org.example.QuanLyMuaVu.Enums.IncidentStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Mapper.IncidentMapper;
import org.example.QuanLyMuaVu.Repository.IncidentRepository;
import org.example.QuanLyMuaVu.Repository.UserRepository;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.example.QuanLyMuaVu.Enums.IncidentStatus.*;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminIncidentService {

    IncidentRepository incidentRepository;
    IncidentMapper incidentMapper;
    UserRepository userRepository;

    // ═══════════════════════════════════════════════════════════════
    // STATE MACHINE CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Allowed state transitions map.
     * OPEN -> IN_PROGRESS (via triage)
     * OPEN -> CANCELLED (via cancel)
     * IN_PROGRESS -> RESOLVED (via resolve)
     * IN_PROGRESS -> CANCELLED (via cancel)
     */
    private static final Map<IncidentStatus, Set<IncidentStatus>> ALLOWED_TRANSITIONS = Map.of(
            OPEN, Set.of(IN_PROGRESS, CANCELLED),
            IN_PROGRESS, Set.of(RESOLVED, CANCELLED));

    // ═══════════════════════════════════════════════════════════════
    // QUERY OPERATIONS
    // ═══════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════
    // TRIAGE OPERATION (OPEN -> IN_PROGRESS)
    // ═══════════════════════════════════════════════════════════════

    @Transactional
    public IncidentResponse triage(Integer incidentId, TriageIncidentRequest request) {
        log.info("Admin triaging incident {} with severity: {}, deadline: {}, assigneeId: {}",
                incidentId, request.getSeverity(), request.getDeadline(), request.getAssigneeId());

        try {
            Incident incident = incidentRepository.findById(incidentId)
                    .orElseThrow(() -> new AppException(ErrorCode.INCIDENT_NOT_FOUND));

            // Validate transition: must be OPEN
            validateTransition(incident.getStatus(), IN_PROGRESS);

            // Validate deadline if provided
            if (request.getDeadline() != null && request.getDeadline().isBefore(LocalDate.now())) {
                throw new AppException(ErrorCode.INVALID_DEADLINE);
            }

            // Update severity
            IncidentSeverity newSeverity = IncidentSeverity.fromCode(request.getSeverity());
            incident.setSeverity(newSeverity);

            // Set deadline if provided
            if (request.getDeadline() != null) {
                incident.setDeadline(request.getDeadline());
            }

            // Set assignee if provided
            if (request.getAssigneeId() != null) {
                User assignee = userRepository.findById(request.getAssigneeId())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                incident.setAssignee(assignee);
            }

            // Transition to IN_PROGRESS
            incident.setStatus(IN_PROGRESS);

            incidentRepository.save(incident);
            log.info("Incident {} triaged successfully", incidentId);
            return incidentMapper.toResponse(incident);

        } catch (OptimisticLockingFailureException e) {
            log.warn("Optimistic locking failure for incident {}", incidentId);
            throw new AppException(ErrorCode.OPTIMISTIC_LOCK_ERROR);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // RESOLVE OPERATION (IN_PROGRESS -> RESOLVED)
    // ═══════════════════════════════════════════════════════════════

    @Transactional
    public IncidentResponse resolve(Integer incidentId, ResolveIncidentRequest request) {
        log.info("Admin resolving incident {} with note: {}", incidentId, request.getResolutionNote());

        try {
            Incident incident = incidentRepository.findById(incidentId)
                    .orElseThrow(() -> new AppException(ErrorCode.INCIDENT_NOT_FOUND));

            // Validate transition: must be IN_PROGRESS
            validateTransition(incident.getStatus(), RESOLVED);

            // Set resolution details
            incident.setStatus(RESOLVED);
            incident.setResolvedAt(LocalDateTime.now());
            incident.setResolutionNote(request.getResolutionNote());

            // Set resolved by current user
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            userRepository.findByUsername(username).ifPresent(incident::setResolvedBy);

            incidentRepository.save(incident);
            log.info("Incident {} resolved successfully", incidentId);
            return incidentMapper.toResponse(incident);

        } catch (OptimisticLockingFailureException e) {
            log.warn("Optimistic locking failure for incident {}", incidentId);
            throw new AppException(ErrorCode.OPTIMISTIC_LOCK_ERROR);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CANCEL OPERATION (OPEN/IN_PROGRESS -> CANCELLED)
    // ═══════════════════════════════════════════════════════════════

    @Transactional
    public IncidentResponse cancel(Integer incidentId, CancelIncidentRequest request) {
        log.info("Admin cancelling incident {} with reason: {}", incidentId, request.getCancellationReason());

        try {
            Incident incident = incidentRepository.findById(incidentId)
                    .orElseThrow(() -> new AppException(ErrorCode.INCIDENT_NOT_FOUND));

            // Validate transition: must be OPEN or IN_PROGRESS
            validateTransition(incident.getStatus(), CANCELLED);

            // Set cancellation details
            incident.setStatus(CANCELLED);
            incident.setCancellationReason(request.getCancellationReason());

            incidentRepository.save(incident);
            log.info("Incident {} cancelled successfully", incidentId);
            return incidentMapper.toResponse(incident);

        } catch (OptimisticLockingFailureException e) {
            log.warn("Optimistic locking failure for incident {}", incidentId);
            throw new AppException(ErrorCode.OPTIMISTIC_LOCK_ERROR);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // LEGACY STATUS UPDATE (kept for backward compatibility)
    // ═══════════════════════════════════════════════════════════════

    @Transactional
    public IncidentResponse updateStatus(Integer incidentId, String newStatus) {
        log.info("Admin updating incident {} status to: {}", incidentId, newStatus);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new AppException(ErrorCode.INCIDENT_NOT_FOUND));

        IncidentStatus targetStatus = IncidentStatus.valueOf(newStatus);

        // Validate transition
        validateTransition(incident.getStatus(), targetStatus);

        incident.setStatus(targetStatus);

        // Set resolved_at when status changes to RESOLVED
        if (targetStatus == RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        incidentRepository.save(incident);
        return incidentMapper.toResponse(incident);
    }

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION HELPERS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Validate that the transition from current status to target status is allowed.
     */
    private void validateTransition(IncidentStatus current, IncidentStatus target) {
        if (current == null) {
            throw new AppException(ErrorCode.INVALID_INCIDENT_STATUS_TRANSITION);
        }

        Set<IncidentStatus> allowedTargets = ALLOWED_TRANSITIONS.get(current);
        if (allowedTargets == null || !allowedTargets.contains(target)) {
            log.warn("Invalid transition attempted: {} -> {}", current, target);
            throw new AppException(ErrorCode.INVALID_INCIDENT_STATUS_TRANSITION);
        }
    }
}
