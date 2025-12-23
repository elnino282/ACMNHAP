package org.example.QuanLyMuaVu.DTO.Request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FarmCreateRequest {

    @NotBlank(message = "KEY_INVALID")
    @Size(max = 255, message = "KEY_INVALID")
    String name;

    @NotNull(message = "PROVINCE_REQUIRED")
    Integer provinceId;

    @NotNull(message = "WARD_REQUIRED")
    Integer wardId;

    @DecimalMin(value = "0.0", inclusive = false, message = "INVALID_PLOT_AREA")
    BigDecimal area;
}
