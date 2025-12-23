package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.SupplyItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplyItemRepository extends JpaRepository<SupplyItem, Integer> {
}

