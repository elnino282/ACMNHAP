package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.SupplyItem;
import org.example.QuanLyMuaVu.Entity.SupplyLot;
import org.example.QuanLyMuaVu.Entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyLotRepository extends JpaRepository<SupplyLot, Integer> {

    List<SupplyLot> findAllBySupplyItem(SupplyItem item);

    List<SupplyLot> findAllBySupplier(Supplier supplier);
}

