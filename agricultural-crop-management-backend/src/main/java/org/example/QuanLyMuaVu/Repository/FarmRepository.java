package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Farm;
import org.example.QuanLyMuaVu.Entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FarmRepository extends JpaRepository<Farm, Integer> {

    List<Farm> findAllByOwner(User owner);

    Optional<Farm> findByIdAndOwner(Integer id, User owner);

    boolean existsByOwnerAndNameIgnoreCase(User owner, String name);

    // Check if user owns any farms (for delete constraint)
    boolean existsByOwner_Id(Long ownerId);

    // Admin pagination methods
    Page<Farm> findByNameContainingIgnoreCaseAndActive(String name, Boolean active, Pageable pageable);

    Page<Farm> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Farm> findByActive(Boolean active, Pageable pageable);

    // Admin search: by farm name OR owner name/username with EntityGraph for N+1
    // prevention
    @EntityGraph(attributePaths = { "owner", "province", "ward" })
    @Query("SELECT f FROM Farm f WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(f.owner.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(f.owner.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Farm> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @EntityGraph(attributePaths = { "owner", "province", "ward" })
    @Query("SELECT f FROM Farm f WHERE f.active = :active AND " +
            "(:keyword IS NULL OR :keyword = '' OR LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(f.owner.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(f.owner.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Farm> searchByKeywordAndActive(@Param("keyword") String keyword, @Param("active") Boolean active,
            Pageable pageable);
}
