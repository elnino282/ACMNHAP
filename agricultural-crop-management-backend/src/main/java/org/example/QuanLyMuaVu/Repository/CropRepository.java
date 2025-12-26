package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropRepository extends JpaRepository<Crop, Integer> {
    List<Crop> findByCropNameContainingIgnoreCase(String name);

    boolean existsByCropNameIgnoreCase(String cropName);
}
