package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Farm;
import org.example.QuanLyMuaVu.Entity.Plot;
import org.example.QuanLyMuaVu.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlotRepository extends JpaRepository<Plot, Integer> {
    List<Plot> findByPlotNameContainingIgnoreCase(String name);

    List<Plot> findAllByUser(User user);

    List<Plot> findAllByFarm(Farm farm);

    // For cascade owner update when farm owner changes
    List<Plot> findAllByFarm_Id(Integer farmId);

    boolean existsByFarm(Farm farm);

    boolean existsByUserAndPlotNameIgnoreCase(User user, String plotName);
}
