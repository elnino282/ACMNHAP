package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Task;
import org.example.QuanLyMuaVu.Enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
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
}
