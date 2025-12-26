package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Crop;
import org.example.QuanLyMuaVu.Entity.Variety;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VarietyRepository extends JpaRepository<Variety, Integer> {

    List<Variety> findAllByCrop(Crop crop);

    /**
     * Check if any variety belongs to the given crop.
     * Used for orphan data prevention in CropService.delete().
     */
    boolean existsByCrop_Id(Integer cropId);
}
