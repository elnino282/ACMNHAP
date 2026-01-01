package org.example.QuanLyMuaVu.DTO.Response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlotResponse {
    Integer id;
    String userName;
    String plotName;
    Integer provinceId;
    Integer wardId;
    BigDecimal area;
    String soilType;
    String status;
    LocalDateTime createdAt;

    // Farm relationship for admin display
    Integer farmId;
    String farmName;
}
