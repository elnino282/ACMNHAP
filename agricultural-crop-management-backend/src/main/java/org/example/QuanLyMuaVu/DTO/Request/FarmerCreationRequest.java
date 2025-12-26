package org.example.QuanLyMuaVu.DTO.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FarmerCreationRequest {

    @NotBlank(message = "USERNAME_BLANK")
    String username;

    @NotBlank(message = "PASSWORD_BLANK")
    @Size(min = 8, message = "PASSWORD_INVALID")
    String password;

    @Email(message = "INVALID_EMAIL_FORMAT")
    String email;

    String fullName;

    String phone;

    // List of role codes (e.g., ["FARMER", "BUYER"])
    List<String> roles;
}
