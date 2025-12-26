package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Request.FarmerCreationRequest;
import org.example.QuanLyMuaVu.DTO.Request.FarmerUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Request.FarmerUpdateRolesRequest;
import org.example.QuanLyMuaVu.DTO.Request.UserUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Request.UserStatusUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Response.FarmerResponse;
import org.example.QuanLyMuaVu.Service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

        UserService userService;

        // ==================== UNIFIED USER ENDPOINTS ====================

        @Operation(summary = "Search & paginate all users", description = "Search all users (any role) by keyword and status with pagination")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping
        public ApiResponse<PageResponse<FarmerResponse>> getAllUsers(
                        @Parameter(description = "Free-text search on username, email, fullName") @RequestParam(value = "keyword", required = false) String keyword,
                        @Parameter(description = "User status: ACTIVE/INACTIVE/LOCKED") @RequestParam(value = "status", required = false) String status,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
                return ApiResponse.success(userService.searchAllUsers(keyword, status, page, size));
        }

        @Operation(summary = "Create user account", description = "Admin creates a new user with specified roles")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict - Username or Email already exists")
        })
        @PostMapping
        public ApiResponse<FarmerResponse> createUser(@Valid @RequestBody FarmerCreationRequest request) {
                return ApiResponse.success(userService.createFarmer(request));
        }

        @Operation(summary = "Get user detail", description = "Retrieve user detail by id")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @GetMapping("/{userId}")
        public ApiResponse<FarmerResponse> getUser(@PathVariable Long userId) {
                return ApiResponse.success(userService.getFarmer(userId));
        }

        @Operation(summary = "Update user", description = "Update user information (username, email, fullName, phone, roles, status)")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict - Username or Email already exists")
        })
        @PutMapping("/{userId}")
        public ApiResponse<FarmerResponse> updateUser(
                        @PathVariable Long userId,
                        @Valid @RequestBody UserUpdateRequest request) {
                return ApiResponse.success(userService.updateUser(userId, request));
        }

        @Operation(summary = "Update user status", description = "Update user status (ACTIVE/INACTIVE/LOCKED)")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @PatchMapping("/{userId}/status")
        public ApiResponse<FarmerResponse> updateUserStatus(
                        @PathVariable Long userId,
                        @Valid @RequestBody UserStatusUpdateRequest request) {
                return ApiResponse.success(userService.updateUserStatus(userId, request));
        }

        @Operation(summary = "Reset user password", description = "Admin resets user password")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request - Password too short"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @PatchMapping("/{userId}/password")
        public ApiResponse<FarmerResponse> resetUserPassword(
                        @PathVariable Long userId,
                        @Valid @RequestBody FarmerUpdateRequest request) {
                return ApiResponse.success(userService.updatePassword(userId, request));
        }

        @Operation(summary = "Delete user", description = "Delete a user account. Returns error if user has associated farms.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict - User has associated data")
        })
        @DeleteMapping("/{userId}")
        public ApiResponse<String> deleteUser(@PathVariable Long userId) {
                userService.deleteFarmer(userId);
                return ApiResponse.success("User has been deleted");
        }

        @Operation(summary = "Check if user can be deleted", description = "Check if user has associated data (farms)")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
        })
        @GetMapping("/{userId}/can-delete")
        public ApiResponse<Boolean> canDeleteUser(@PathVariable Long userId) {
                return ApiResponse.success(userService.canDeleteUser(userId));
        }

        // ==================== LEGACY FARMER-SPECIFIC ENDPOINTS ====================

        @Operation(summary = "Search & paginate farmers", description = "Search farmers by keyword and status with pagination")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @GetMapping("/farmers")
        public ApiResponse<PageResponse<FarmerResponse>> farmers(
                        @Parameter(description = "Free-text search on username") @RequestParam(value = "keyword", required = false) String keyword,
                        @Parameter(description = "User status: ACTIVE/INACTIVE/LOCKED") @RequestParam(value = "status", required = false) String status,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
                return ApiResponse.success(userService.searchFarmers(keyword, status, page, size));
        }

        @Operation(summary = "Get farmer detail", description = "Retrieve farmer detail by id")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @GetMapping("/farmers/{farmerId}")
        public ApiResponse<FarmerResponse> getFarmer(@PathVariable Long farmerId) {
                return ApiResponse.success(userService.getFarmer(farmerId));
        }

        @Operation(summary = "Create farmer account", description = "Admin creates a new farmer account")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
        })
        @PostMapping("/farmers")
        public ApiResponse<FarmerResponse> createFarmer(@Valid @RequestBody FarmerCreationRequest request) {
                return ApiResponse.success(userService.createFarmer(request));
        }

        @Operation(summary = "Update farmer status", description = "Update farmer status (ACTIVE/INACTIVE/LOCKED)")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @PatchMapping("/farmers/{farmerId}/status")
        public ApiResponse<FarmerResponse> updateFarmerStatus(
                        @PathVariable Long farmerId,
                        @Valid @RequestBody UserStatusUpdateRequest request) {
                return ApiResponse.success(userService.updateUserStatus(farmerId, request));
        }

        @Operation(summary = "Search & paginate buyers", description = "Search buyers by keyword and status with pagination")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @GetMapping("/buyers")
        public ApiResponse<PageResponse<FarmerResponse>> buyers(
                        @Parameter(description = "Free-text search on username") @RequestParam(value = "keyword", required = false) String keyword,
                        @Parameter(description = "User status: ACTIVE/INACTIVE/LOCKED") @RequestParam(value = "status", required = false) String status,
                        @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
                        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
                return ApiResponse.success(userService.searchBuyers(keyword, status, page, size));
        }

        @Operation(summary = "Delete farmer", description = "Delete a farmer account")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @DeleteMapping("/farmers/{farmerId}")
        public ApiResponse<String> deleteFarmer(@PathVariable Long farmerId) {
                userService.deleteFarmer(farmerId);
                return ApiResponse.success("Farmer has been deleted");
        }

        @Operation(summary = "Update farmer roles", description = "Admin updates farmer roles")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
        })
        @PutMapping("/farmers/{farmerId}/roles")
        public ApiResponse<FarmerResponse> updateFarmerRoles(
                        @PathVariable Long farmerId,
                        @Valid @RequestBody FarmerUpdateRolesRequest request) {
                return ApiResponse.success(userService.updateRoles(farmerId, request));
        }
}
