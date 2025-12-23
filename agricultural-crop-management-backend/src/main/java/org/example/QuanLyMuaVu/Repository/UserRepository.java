package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.User;
import org.example.QuanLyMuaVu.Enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

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
            Pageable pageable
    );
}
