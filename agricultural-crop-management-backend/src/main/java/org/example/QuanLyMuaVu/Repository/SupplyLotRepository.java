package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.SupplyItem;
import org.example.QuanLyMuaVu.Entity.SupplyLot;
import org.example.QuanLyMuaVu.Entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplyLotRepository extends JpaRepository<SupplyLot, Integer> {

    List<SupplyLot> findAllBySupplyItem(SupplyItem item);

    List<SupplyLot> findAllBySupplier(Supplier supplier);

    boolean existsBySupplier(Supplier supplier);

    boolean existsBySupplyItem(SupplyItem item);

    @Query("""
            select l from SupplyLot l
            where (:supplierId is null or l.supplier.id = :supplierId)
              and (:itemId is null or l.supplyItem.id = :itemId)
              and (:status is null or l.status = :status)
            order by l.id desc
            """)
    Page<SupplyLot> searchWithFilters(
            @Param("supplierId") Integer supplierId,
            @Param("itemId") Integer itemId,
            @Param("status") String status,
            Pageable pageable);
}
