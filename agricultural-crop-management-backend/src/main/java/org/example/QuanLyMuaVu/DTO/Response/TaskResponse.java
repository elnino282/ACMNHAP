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
public class TaskResponse {
    Integer id;
    String userName;
    Long userId;
    String seasonName;
    Integer seasonId;
    Integer farmId;
    String farmName;
    Integer cropId;
    String cropName;
    String title;
    String description;
    LocalDate plannedDate;
    LocalDate dueDate;
    String status;
    String notes;
    LocalDateTime createdAt;
}
