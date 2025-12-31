package org.example.QuanLyMuaVu.Repository;

import org.example.QuanLyMuaVu.Entity.Document;
import org.example.QuanLyMuaVu.Enums.DocumentStatus;
import org.example.QuanLyMuaVu.Enums.DocumentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository for Document entity with pagination and filtering support.
 */
public interface DocumentRepository extends JpaRepository<Document, Long> {

    /**
     * Search documents with optional filters for keyword, type, and status.
     * Keyword searches in title (case-insensitive, min 2 chars enforced at service
     * level).
     * Default sort is by createdAt DESC.
     */
    @Query("""
            SELECT d FROM Document d
            WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
            AND (:type IS NULL OR d.documentType = :type)
            AND (:status IS NULL OR d.status = :status)
            ORDER BY d.createdAt DESC
            """)
    Page<Document> searchWithFilters(
            @Param("keyword") String keyword,
            @Param("type") DocumentType type,
            @Param("status") DocumentStatus status,
            Pageable pageable);

    /**
     * Find documents by title containing keyword (case-insensitive).
     */
    List<Document> findByTitleContainingIgnoreCase(String title);

    /**
     * Find all active documents.
     */
    List<Document> findByStatus(DocumentStatus status);

    /**
     * Check if a document with the given title already exists (case-insensitive).
     */
    boolean existsByTitleIgnoreCase(String title);
}
