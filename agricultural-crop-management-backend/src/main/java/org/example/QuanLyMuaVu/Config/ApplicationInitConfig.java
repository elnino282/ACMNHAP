package org.example.QuanLyMuaVu.Config;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.Constant.PredefinedRole;
import org.example.QuanLyMuaVu.Entity.Role;
import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Enums.UserStatus;
import org.example.QuanLyMuaVu.Repository.RoleRepository;
import org.example.QuanLyMuaVu.Repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    static final String ADMIN_USER_NAME = "admin";

    static final String ADMIN_PASSWORD = "12345678";

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        log.info("Dang khoi tao du lieu mac dinh (vai tro va nguoi dung admin)...");
        return args -> {
            // 1. Ensure default roles exist
            Role adminRole = ensureRoleExists(
                    PredefinedRole.ADMIN_ROLE,
                    "Administrator",
                    "System administrator",
                    roleRepository
            );
            ensureRoleExists(
                    PredefinedRole.FARMER_ROLE,
                    "Farmer",
                    "Farmer user",
                    roleRepository
            );
            ensureRoleExists(
                    PredefinedRole.BUYER_ROLE,
                    "Buyer",
                    "Buyer user",
                    roleRepository
            );

            // 2. Ensure default admin user exists (and has ADMIN role)
            ensureAdminUserExists(adminRole, userRepository);

            log.info("Khoi tao du lieu mac dinh hoan tat.");
        };
    }

    private Role ensureRoleExists(String code, String name, String description, RoleRepository roleRepository) {
        return roleRepository.findByCode(code)
                .orElseGet(() -> {
                    log.info("Creating default role with code: {}", code);
                    Role role = Role.builder()
                            .code(code)
                            .name(name)
                            .description(description)
                            .build();
                    return roleRepository.save(role);
                });
    }

    private void ensureAdminUserExists(Role adminRole, UserRepository userRepository) {
        var adminOptional = userRepository.findByUsernameWithRoles(ADMIN_USER_NAME);

        if (adminOptional.isEmpty()) {
            var roles = new HashSet<Role>();
            roles.add(adminRole);

            User user = User.builder()
                    .username(ADMIN_USER_NAME)
                    .password(passwordEncoder.encode(ADMIN_PASSWORD))
                    .status(UserStatus.ACTIVE)
                    .roles(roles)
                    .build();

            userRepository.save(user);
            log.warn("Nguoi dung quan tri da duoc tao voi mat khau mac dinh, vui long thay doi mat khau!");
        } else {
            User admin = adminOptional.get();
            var roles = admin.getRoles() == null ? new HashSet<Role>() : new HashSet<>(admin.getRoles());
            boolean hasAdminRole = roles.stream()
                    .anyMatch(role -> PredefinedRole.ADMIN_ROLE.equals(role.getCode()));
            if (!hasAdminRole) {
                roles.add(adminRole);
                admin.setRoles(roles);
                userRepository.save(admin);
                log.info("Da cap nhat nguoi dung admin de dam bao co vai tro ADMIN.");
            }
        }
    }
}
