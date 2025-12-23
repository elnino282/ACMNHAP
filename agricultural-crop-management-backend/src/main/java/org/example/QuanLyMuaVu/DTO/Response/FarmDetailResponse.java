package org.example.QuanLyMuaVu.DTO.Response;

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
public class FarmDetailResponse {

    Integer id;
    String name;
    Integer provinceId;
    Integer wardId;
    String provinceName;
    String wardName;
    BigDecimal area;
    Boolean active;
    String ownerUsername;
}
