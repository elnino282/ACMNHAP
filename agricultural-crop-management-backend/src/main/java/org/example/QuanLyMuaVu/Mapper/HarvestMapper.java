package org.example.QuanLyMuaVu.Mapper;

import org.example.QuanLyMuaVu.DTO.Request.HarvestRequest;
import org.example.QuanLyMuaVu.DTO.Response.HarvestResponse;
import org.example.QuanLyMuaVu.Entity.Harvest;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class HarvestMapper {
    public void update(Harvest harvest, HarvestRequest request) {
        if (harvest == null || request == null) return;
        harvest.setHarvestDate(request.getHarvestDate());
        harvest.setQuantity(request.getQuantity());
        harvest.setUnit(request.getUnit());
        harvest.setNote(request.getNote());
    }

    public HarvestResponse toResponse(Harvest harvest) {
        if (harvest == null) return null;
        return HarvestResponse.builder()
                .id(harvest.getId())
                .seasonName(harvest.getSeason() != null ? harvest.getSeason().getSeasonName() : null)
                .harvestDate(harvest.getHarvestDate())
                .quantity(harvest.getQuantity())
                .unit(harvest.getUnit())
                .note(harvest.getNote())
                .createdAt(harvest.getCreatedAt())
                .build();
    }
}
