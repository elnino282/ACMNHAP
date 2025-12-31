package org.example.QuanLyMuaVu.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.Enums.DocumentStatus;
import org.example.QuanLyMuaVu.Enums.DocumentType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing a system-wide document stored as an external link.
 * Used for policy documents, guides, manuals, legal terms, etc.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    Long id;

    @Column(name = "title", nullable = false, length = 255)
    String title;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "document_url", nullable = false, length = 1024)
    String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 100)
    DocumentType documentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    DocumentStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "created_by", nullable = false)
    Long createdBy;
}
