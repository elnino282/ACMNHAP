package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Farm;
import org.example.QuanLyMuaVu.Entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {

    List<Warehouse> findAllByFarm(Farm farm);

    org.springframework.data.domain.Page<Warehouse> findByNameContainingIgnoreCase(String name,
            org.springframework.data.domain.Pageable pageable);
}
