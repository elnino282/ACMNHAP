package org.example.QuanLyMuaVu.Controller;

import com.nimbusds.jose.JOSEException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Request.AuthenticationRequest;
import org.example.QuanLyMuaVu.DTO.Request.IntrospectRequest;
import org.example.QuanLyMuaVu.DTO.Request.LogoutRequest;
import org.example.QuanLyMuaVu.DTO.Request.RefreshRequest;
import org.example.QuanLyMuaVu.DTO.Request.ResetPasswordRequest;
import org.example.QuanLyMuaVu.DTO.Request.SignUpRequest;
import org.example.QuanLyMuaVu.DTO.Response.AuthenticationResponse;
import org.example.QuanLyMuaVu.DTO.Response.FarmerResponse;
import org.example.QuanLyMuaVu.DTO.Response.IntrospectResponse;
import org.example.QuanLyMuaVu.Service.AuthenticationService;
import org.example.QuanLyMuaVu.Service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Authentication", description = "Quản lý xác thực và ủy quyền")
public class AuthenticationController {

    AuthenticationService authenticationService;
    UserService userService;

    @PostMapping("/sign-in")
    @Operation(
        summary = "Đăng nhập người dùng",
        description = "Xác thực người dùng và trả về JWT token để truy cập API"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Đăng nhập thành công",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    name = "Success Response",
                    value = """
                        {
                          "result": {
                            "token": "eyJhbGciOiJIUzUxMiJ9...",
                            "authenticated": true,
                            "username": "admin",
                            "roles": ["ADMIN", "USER"]
                          }
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Thông tin đăng nhập không chính xác"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Người dùng không tồn tại"
        )
    })
    ApiResponse<AuthenticationResponse> authenticate(
        @Parameter(
            description = "Thông tin đăng nhập",
            required = true,
            content = @Content(
                examples = @ExampleObject(
                    name = "Login Request",
                    value = """
                        {
                          "username": "admin",
                          "password": "password123"
                        }
                        """
                )
            )
        )
        @RequestBody AuthenticationRequest request
    ) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.success(result);
    }

    @PostMapping("/sign-up")
    @Operation(
        summary = "Đăng ký người dùng mới",
        description = "Tạo tài khoản người dùng mới với vai trò BUYER hoặc FARMER"
    )
    ApiResponse<FarmerResponse> signUp(
        @RequestBody @Valid SignUpRequest request
    ) {
        var result = userService.signUp(request);
        return ApiResponse.success(result);
    }

    @PostMapping("/introspect")
    @Operation(
        summary = "Kiểm tra tính hợp lệ của token",
        description = "Xác minh JWT token còn hợp lệ hay không"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Kiểm tra token thành công",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        )
    })
    ApiResponse<IntrospectResponse> introspect(
        @Parameter(
            description = "Token cần kiểm tra",
            required = true
        )
        @RequestBody IntrospectRequest request
    ) throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.success(result);
    }

    @PostMapping("/refresh")
    @Operation(
        summary = "Làm mới JWT token",
        description = "Tạo token mới khi token cũ sắp hết hạn"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Làm mới token thành công",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Token không hợp lệ hoặc đã hết hạn"
        )
    })
    ApiResponse<AuthenticationResponse> refreshToken(
        @Parameter(
            description = "Token cần làm mới",
            required = true
        )
        @RequestBody RefreshRequest request
    ) throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);
        return ApiResponse.success(result);
    }

    @PreAuthorize("hasAnyRole('ADMIN','BUYER','FARMER')")
    @PostMapping("/sign-out")
    @Operation(
        summary = "Đăng xuất người dùng",
        description = "Vô hiệu hóa JWT token hiện tại"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Đăng xuất thành công"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Token không hợp lệ"
        )
    })
    ApiResponse<Void> logout(
        @Parameter(
            description = "Token cần vô hiệu hóa",
            required = true
        )
        @RequestBody LogoutRequest request
    ) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.success(null);
    }

    @PreAuthorize("hasAnyRole('ADMIN','BUYER','FARMER')")
    @PostMapping("/reset-password")
    @Operation(
        summary = "Đặt lại mật khẩu người dùng",
        description = "Cho phép ADMIN hoặc người dùng đã xác thực đặt lại mật khẩu"
    )
    ApiResponse<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ApiResponse.success(null);
    }
}

