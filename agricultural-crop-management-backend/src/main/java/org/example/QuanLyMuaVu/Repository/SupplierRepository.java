package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
}

