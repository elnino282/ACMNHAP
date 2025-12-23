package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Response.FarmerDashboardResponse;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Service.FarmerDashboardService;
import org.example.QuanLyMuaVu.Service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/farmer/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Farmer Dashboard", description = "Farmer dashboard summary and metrics")
public class FarmerDashboardController {

    FarmerDashboardService farmerDashboardService;
    UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Get farmer dashboard", description = "Returns summary metrics and recent activity for the authenticated farmer")
    public ApiResponse<FarmerDashboardResponse> getDashboard(Authentication authentication) {
        User currentUser = userService.getUserByUsername(authentication.getName());
        var dashboard = farmerDashboardService.getDashboard(currentUser);
        return ApiResponse.success(dashboard);
    }
}
