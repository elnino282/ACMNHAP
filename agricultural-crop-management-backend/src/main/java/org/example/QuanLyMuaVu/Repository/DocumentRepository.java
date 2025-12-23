package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {
    List<Document> findByTitleContainingIgnoreCase(String title);
}
