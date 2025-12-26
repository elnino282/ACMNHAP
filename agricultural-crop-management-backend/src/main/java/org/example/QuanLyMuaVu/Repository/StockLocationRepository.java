package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.StockLocation;
import org.example.QuanLyMuaVu.Entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockLocationRepository extends JpaRepository<StockLocation, Integer> {

    List<StockLocation> findAllByWarehouse(Warehouse warehouse);
}
