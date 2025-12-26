package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    @Query("""
            select s from Supplier s
            where :keyword is null or lower(s.name) like lower(concat('%', :keyword, '%'))
            """)
    Page<Supplier> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
