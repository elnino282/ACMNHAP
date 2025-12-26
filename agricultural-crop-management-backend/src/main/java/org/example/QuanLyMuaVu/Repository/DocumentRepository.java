package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Integer> {
    List<Document> findByTitleContainingIgnoreCase(String title);
}
