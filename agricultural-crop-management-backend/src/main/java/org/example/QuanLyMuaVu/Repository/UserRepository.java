package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByUsernameAndIdNot(String username, Long id);

    Optional<User> findByUsername(String username);

    @Query("select u from User u left join fetch u.roles where u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);

    List<User> findAllByRoles_Code(String roleCode);

    Page<User> findAllByRoles_Code(String roleCode, Pageable pageable);

    long countByStatus(UserStatus status);

    Page<User> findAllByRoles_CodeAndUsernameContainingIgnoreCase(String roleCode, String keyword, Pageable pageable);

    Page<User> findAllByRoles_CodeAndStatus(String roleCode, UserStatus status, Pageable pageable);

    Page<User> findAllByRoles_CodeAndStatusAndUsernameContainingIgnoreCase(
            String roleCode,
            UserStatus status,
            String keyword,
            Pageable pageable);

    // Unified user search methods (all users)
    @Query("SELECT u FROM User u WHERE " +
            "(:keyword IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:status IS NULL OR u.status = :status)")
    Page<User> searchAllUsers(@Param("keyword") String keyword, @Param("status") UserStatus status, Pageable pageable);
}
