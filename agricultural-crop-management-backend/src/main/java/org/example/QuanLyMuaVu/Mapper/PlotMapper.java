package org.example.QuanLyMuaVu.Mapper;

import org.example.QuanLyMuaVu.DTO.Request.PlotRequest;
import org.example.QuanLyMuaVu.DTO.Response.PlotResponse;
import org.example.QuanLyMuaVu.Entity.Plot;
import org.example.QuanLyMuaVu.Entity.Province;
import org.example.QuanLyMuaVu.Entity.Ward;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class PlotMapper {
    public void updateEntity(Plot plot, PlotRequest request) {
        if (plot == null || request == null)
            return;
        plot.setPlotName(request.getPlotName());
        if (request.getProvinceId() != null) {
            plot.setProvince(Province.builder().id(request.getProvinceId()).build());
        }
        if (request.getWardId() != null) {
            plot.setWard(Ward.builder().id(request.getWardId()).build());
        }
        plot.setArea(request.getArea());
        // SoilType and status are now String fields
        if (request.getSoilType() != null) {
            plot.setSoilType(request.getSoilType());
        }
        if (request.getStatus() != null) {
            plot.setStatus(request.getStatus());
        }
    }

    public PlotResponse toResponse(Plot plot) {
        if (plot == null)
            return null;
        return PlotResponse.builder()
                .id(plot.getId())
                .userName(plot.getUser() != null ? plot.getUser().getUsername() : null)
                .plotName(plot.getPlotName())
                .provinceId(plot.getProvince() != null ? plot.getProvince().getId() : null)
                .wardId(plot.getWard() != null ? plot.getWard().getId() : null)
                .area(plot.getArea())
                .soilType(plot.getSoilType())
                .status(plot.getStatus())
                .createdAt(plot.getCreatedAt())
                .farmId(plot.getFarm() != null ? plot.getFarm().getId() : null)
                .farmName(plot.getFarm() != null ? plot.getFarm().getName() : null)
                .build();
    }
}
