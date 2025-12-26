package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.SupplyItem;
import org.example.QuanLyMuaVu.Enums.SupplyCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplyItemRepository extends JpaRepository<SupplyItem, Integer> {

    @Query("""
            select i from SupplyItem i
            where (:keyword is null or lower(i.name) like lower(concat('%', :keyword, '%')))
              and (:category is null or i.category = :category)
              and (:restricted is null or i.restrictedFlag = :restricted)
            """)
    Page<SupplyItem> searchWithFilters(
            @Param("keyword") String keyword,
            @Param("category") SupplyCategory category,
            @Param("restricted") Boolean restricted,
            Pageable pageable);
}
