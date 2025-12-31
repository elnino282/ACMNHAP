package org.example.QuanLyMuaVu.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Request.AdminDocumentCreateRequest;
import org.example.QuanLyMuaVu.DTO.Request.AdminDocumentUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Response.AdminDocumentResponse;
import org.example.QuanLyMuaVu.Entity.Document;
import org.example.QuanLyMuaVu.Enums.DocumentStatus;
import org.example.QuanLyMuaVu.Enums.DocumentType;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.Repository.DocumentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Admin Document management.
 * Provides CRUD operations with RBAC enforcement (handled at controller level)
 * and soft-delete functionality.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminDocumentService {

    DocumentRepository documentRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    // ═══════════════════════════════════════════════════════════════
    // LIST DOCUMENTS (PAGINATED)
    // ═══════════════════════════════════════════════════════════════

    /**
     * List documents with pagination and optional filters.
     *
     * @param keyword Search by title (min 2 chars, enforced here)
     * @param type    Filter by document type
     * @param status  Filter by status
     * @param page    Page number (0-indexed)
     * @param size    Page size
     * @param sort    Sort field (default: createdAt)
     * @return Paginated list of documents
     */
    @Transactional(readOnly = true)
    public PageResponse<AdminDocumentResponse> listDocuments(
            String keyword,
            String type,
            String status,
            int page,
            int size,
            String sort) {
        // Enforce minimum keyword length
        String effectiveKeyword = (keyword != null && keyword.length() >= 2) ? keyword : null;

        // Parse type enum
        DocumentType typeEnum = null;
        if (type != null && !type.isBlank()) {
            try {
                typeEnum = DocumentType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid document type: {}", type);
            }
        }

        // Parse status enum
        DocumentStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = DocumentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid document status: {}", status);
            }
        }

        // Build pageable with default sort by createdAt DESC
        Sort sorting = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String field = parts[0];
            Sort.Direction direction = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            sorting = Sort.by(direction, field);
        }

        Page<Document> documentPage = documentRepository.searchWithFilters(
                effectiveKeyword,
                typeEnum,
                statusEnum,
                PageRequest.of(page, size, sorting));

        List<AdminDocumentResponse> content = documentPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.of(documentPage, content);
    }

    // ═══════════════════════════════════════════════════════════════
    // GET DOCUMENT BY ID
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get a single document by ID.
     *
     * @param id Document ID
     * @return Document response
     * @throws AppException if document not found
     */
    @Transactional(readOnly = true)
    public AdminDocumentResponse getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));
        return toResponse(document);
    }

    // ═══════════════════════════════════════════════════════════════
    // CREATE DOCUMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Create a new document.
     *
     * @param request     Document creation request
     * @param adminUserId ID of the admin user creating the document
     * @return Created document response
     */
    @Transactional
    public AdminDocumentResponse createDocument(AdminDocumentCreateRequest request, Long adminUserId) {
        // Parse enums
        DocumentType typeEnum = DocumentType.valueOf(request.getDocumentType().toUpperCase());
        DocumentStatus statusEnum = DocumentStatus.valueOf(request.getStatus().toUpperCase());

        Document document = Document.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .documentUrl(request.getDocumentUrl())
                .documentType(typeEnum)
                .status(statusEnum)
                .createdBy(adminUserId)
                .build();

        Document saved = documentRepository.save(document);
        log.info("Created document: id={}, title={}, createdBy={}", saved.getId(), saved.getTitle(), adminUserId);

        return toResponse(saved);
    }

    // ═══════════════════════════════════════════════════════════════
    // UPDATE DOCUMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Update an existing document.
     *
     * @param id      Document ID
     * @param request Update request
     * @return Updated document response
     * @throws AppException if document not found
     */
    @Transactional
    public AdminDocumentResponse updateDocument(Long id, AdminDocumentUpdateRequest request) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

        // Parse enums
        DocumentType typeEnum = DocumentType.valueOf(request.getDocumentType().toUpperCase());
        DocumentStatus statusEnum = DocumentStatus.valueOf(request.getStatus().toUpperCase());

        document.setTitle(request.getTitle());
        document.setDescription(request.getDescription());
        document.setDocumentUrl(request.getDocumentUrl());
        document.setDocumentType(typeEnum);
        document.setStatus(statusEnum);

        Document saved = documentRepository.save(document);
        log.info("Updated document: id={}", saved.getId());

        return toResponse(saved);
    }

    // ═══════════════════════════════════════════════════════════════
    // DELETE DOCUMENT (SOFT DELETE)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Soft delete a document by setting status to INACTIVE.
     *
     * @param id Document ID
     * @throws AppException if document not found
     */
    @Transactional
    public void deleteDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

        document.setStatus(DocumentStatus.INACTIVE);
        documentRepository.save(document);
        log.info("Soft deleted document: id={}", id);
    }

    // ═══════════════════════════════════════════════════════════════
    // MAPPER
    // ═══════════════════════════════════════════════════════════════

    /**
     * Convert Document entity to AdminDocumentResponse DTO.
     * Explicitly maps all fields to prevent DTO mismatch.
     */
    private AdminDocumentResponse toResponse(Document doc) {
        return AdminDocumentResponse.builder()
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
