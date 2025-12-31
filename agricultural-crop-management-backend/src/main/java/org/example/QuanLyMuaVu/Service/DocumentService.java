package org.example.QuanLyMuaVu.Service;

import lombok.RequiredArgsConstructor;
import org.example.QuanLyMuaVu.DTO.Request.DocumentRequest;
import org.example.QuanLyMuaVu.DTO.Response.DocumentResponse;
import org.example.QuanLyMuaVu.Entity.Document;
import org.example.QuanLyMuaVu.Enums.DocumentStatus;
import org.example.QuanLyMuaVu.Enums.DocumentType;
import org.example.QuanLyMuaVu.Repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Legacy Document Service (for backward compatibility with farmer/user access).
 * Admin operations should use AdminDocumentService.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DocumentService {
    private final DocumentRepository documentRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public DocumentResponse create(DocumentRequest request) {
        Document doc = Document.builder()
                .title(request.getTitle())
                .description(request.getContent())
                .documentUrl("https://placeholder.com/document")
                .documentType(DocumentType.OTHER)
                .status(DocumentStatus.ACTIVE)
                .createdBy(1L) // Default to admin user ID (legacy behavior)
                .build();
        doc = documentRepository.save(doc);
        return toResponse(doc);
    }

    public List<DocumentResponse> getAll() {
        return documentRepository.findByStatus(DocumentStatus.ACTIVE).stream()
                .map(this::toResponse)
                .toList();
    }

    public DocumentResponse getById(Long id) {
        return documentRepository.findById(id).map(this::toResponse).orElse(null);
    }

    public DocumentResponse update(Long id, DocumentRequest request) {
        Document doc = documentRepository.findById(id).orElseThrow();
        doc.setTitle(request.getTitle());
        doc.setDescription(request.getContent());
        return toResponse(documentRepository.save(doc));
    }

    public void delete(Long id) {
        // Soft delete - set status to INACTIVE
        Document doc = documentRepository.findById(id).orElseThrow();
        doc.setStatus(DocumentStatus.INACTIVE);
        documentRepository.save(doc);
    }

    private DocumentResponse toResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .description(doc.getDescription())
                .documentUrl(doc.getDocumentUrl())
                .documentType(doc.getDocumentType() != null ? doc.getDocumentType().name() : null)
                .status(doc.getStatus() != null ? doc.getStatus().name() : null)
                .createdAt(doc.getCreatedAt() != null ? doc.getCreatedAt().format(DATE_FORMATTER) : null)
                .updatedAt(doc.getUpdatedAt() != null ? doc.getUpdatedAt().format(DATE_FORMATTER) : null)
                .createdBy(doc.getCreatedBy())
                .build();
    }
}
