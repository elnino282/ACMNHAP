package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Task;
import org.example.QuanLyMuaVu.Enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Integer>, JpaSpecificationExecutor<Task> {
    List<Task> findByTitleContainingIgnoreCase(String title);

    List<Task> findAllBySeason_Id(Integer seasonId);

    boolean existsBySeason_Id(Integer seasonId);

    /**
     * Count tasks by user ID, due date range, and exclude specific status.
     * Used by FarmerDashboardService to count tasks due soon.
     */
    Long countByUser_IdAndDueDateBetweenAndStatusNot(Long userId, LocalDate start, LocalDate end, TaskStatus status);

    /**
     * Find latest 5 tasks by user ID.
     * Used by FarmerDashboardService for recent activity.
     */
    List<Task> findTop5ByUser_IdOrderByCreatedAtDesc(Long userId);

    /**
     * Find all tasks for a season that are not in DONE status.
     * Used by AdminSeasonService to auto-cancel pending tasks on season completion.
     */
    List<Task> findBySeason_IdAndStatusNot(Integer seasonId, TaskStatus status);

    /**
     * Count tasks for a season that are not in DONE status.
     * Used for UX warning when completing a season.
     */
    Long countBySeason_IdAndStatusNot(Integer seasonId, TaskStatus status);
}
