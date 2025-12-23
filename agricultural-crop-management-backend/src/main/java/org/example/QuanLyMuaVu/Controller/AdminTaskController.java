package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Response.TaskResponse;
import org.example.QuanLyMuaVu.Entity.Task;
import org.example.QuanLyMuaVu.Enums.TaskStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin REST endpoints for system-wide task monitoring.
 * Returns all tasks across all seasons for administrative purposes.
 */
@RestController
@RequestMapping("/api/v1/admin/tasks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Tasks", description = "Admin endpoints for system-wide task monitoring")
public class AdminTaskController {

        TaskRepository taskRepository;

        @Operation(summary = "List all tasks (Admin)", description = "Get paginated list of all tasks across all seasons")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping
        public ApiResponse<PageResponse<TaskResponse>> listAllTasks(
                        @Parameter(description = "Filter by status") @RequestParam(value = "status", required = false) String status,
                        @Parameter(description = "Filter by season ID") @RequestParam(value = "seasonId", required = false) Integer seasonId,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {

                Page<Task> taskPage = taskRepository.findAll(PageRequest.of(page, size));

                List<TaskResponse> content = taskPage.getContent().stream()
                                .map(this::toTaskResponse)
                                .collect(Collectors.toList());

                return ApiResponse.success(PageResponse.of(taskPage, content));
        }

        @Operation(summary = "Get task detail (Admin)", description = "Get detailed information about a specific task")
        @GetMapping("/{id}")
        public ApiResponse<TaskResponse> getTask(@PathVariable Integer id) {
                Task task = taskRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));
                return ApiResponse.success(toTaskResponse(task));
        }

        @Operation(summary = "Update task status (Admin)", description = "Update the status of a task")
        @PatchMapping("/{id}/status")
        public ApiResponse<TaskResponse> updateTaskStatus(
                        @PathVariable Integer id,
                        @RequestBody Map<String, String> request) {
                Task task = taskRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

                String newStatus = request.get("status");
                if (newStatus != null) {
                        try {
                                task.setStatus(TaskStatus.valueOf(newStatus));
                                taskRepository.save(task);
                        } catch (IllegalArgumentException e) {
                                throw new AppException(ErrorCode.BAD_REQUEST);
                        }
                }

                return ApiResponse.success(toTaskResponse(task));
        }

        private TaskResponse toTaskResponse(Task t) {
                return TaskResponse.builder()
                                .id(t.getId())
                                .userName(t.getUser() != null ? t.getUser().getUsername() : null)
                                .seasonName(t.getSeason() != null ? t.getSeason().getSeasonName() : null)
                                .title(t.getTitle())
                                .description(t.getDescription())
                                .plannedDate(t.getPlannedDate())
                                .dueDate(t.getDueDate())
                                .status(t.getStatus() != null ? t.getStatus().name() : null)
                                .createdAt(t.getCreatedAt())
                                .build();
        }
}
