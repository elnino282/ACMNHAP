package org.example.QuanLyMuaVu.DTO.Request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlotRequest {
    Long userId;
    Integer farmId;

    @NotBlank(message = "KEY_INVALID")
    String plotName;

    Integer provinceId;
    
    Integer wardId;

    @DecimalMin(value = "0.0", inclusive = false, message = "INVALID_PLOT_AREA")
    BigDecimal area;

    String soilType;
    String status;
}
