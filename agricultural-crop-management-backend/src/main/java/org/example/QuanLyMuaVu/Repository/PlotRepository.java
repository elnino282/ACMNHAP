package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Farm;
import org.example.QuanLyMuaVu.Entity.Plot;
import org.example.QuanLyMuaVu.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlotRepository extends JpaRepository<Plot, Integer> {
    List<Plot> findByPlotNameContainingIgnoreCase(String name);

    List<Plot> findAllByUser(User user);

    List<Plot> findAllByFarm(Farm farm);

    boolean existsByFarm(Farm farm);

    boolean existsByUserAndPlotNameIgnoreCase(User user, String plotName);
}
