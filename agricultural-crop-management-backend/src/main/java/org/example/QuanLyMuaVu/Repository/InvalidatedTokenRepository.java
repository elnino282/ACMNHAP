package org.example.QuanLyMuaVu.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.QuanLyMuaVu.Entity.InvalidatedToken;

public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
}
