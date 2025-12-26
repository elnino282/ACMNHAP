package org.example.QuanLyMuaVu.Mapper;

import org.example.QuanLyMuaVu.DTO.Request.FarmerCreationRequest;
import org.example.QuanLyMuaVu.DTO.Request.FarmerUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Request.UserUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Response.FarmerResponse;
import org.example.QuanLyMuaVu.Entity.Role;
import org.example.QuanLyMuaVu.Entity.User;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Primary
public class FarmerMapperManual implements FarmerMapper {

    @Override
    public User toUser(FarmerCreationRequest request) {
        if (request == null) {
            return null;
        }
        return User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .build();
    }

    @Override
    public FarmerResponse toFarmerResponse(User user) {
        if (user == null) {
            return null;
        }

        List<String> roleCodes = List.of();
        if (user.getRoles() != null) {
            roleCodes = user.getRoles().stream()
                    .filter(role -> role != null && role.getCode() != null)
                    .map(Role::getCode)
                    .toList();
        }

        return FarmerResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .status(user.getStatus() != null ? user.getStatus().getCode() : null)
                .roles(roleCodes)
                .build();
    }

    @Override
    public void updateUser(User user, FarmerUpdateRequest request) {
        if (user == null || request == null) {
            return;
        }
        user.setPassword(request.getPassword());
    }

    @Override
    public void updateUserFromRequest(User user, UserUpdateRequest request) {
        if (user == null || request == null) {
            return;
        }
        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
    }
}
