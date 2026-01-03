package org.example.QuanLyMuaVu.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.DTO.Request.AdminDocumentCreateRequest;
import org.example.QuanLyMuaVu.DTO.Request.AdminDocumentUpdateRequest;
import org.example.QuanLyMuaVu.DTO.Response.AdminDocumentResponse;
import org.example.QuanLyMuaVu.Service.AdminDocumentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/**
 * Admin REST endpoints for system-wide document management.
 * All endpoints require ADMIN role.
 * Documents are stored as external links (URLs) for policies, guides, manuals,
 * etc.
 */
@RestController
@RequestMapping("/api/v1/admin/documents")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminDocumentController {

    AdminDocumentService adminDocumentService;

    // ═══════════════════════════════════════════════════════════════
    // LIST DOCUMENTS (PAGINATED)
    // ═══════════════════════════════════════════════════════════════

    @Operation(summary = "List documents (Admin)", description = "Get paginated list of all documents with optional filters")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping
    public ApiResponse<PageResponse<AdminDocumentResponse>> listDocuments(
            @Parameter(description = "Search by title (min 2 chars)") @RequestParam(required = false) String q,

            @Parameter(description = "Filter by document type: POLICY, GUIDE, MANUAL, LEGAL, OTHER") @RequestParam(required = false) String type,

            @Parameter(description = "Filter by status: ACTIVE, INACTIVE") @RequestParam(required = false) String status,

            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,

            @Parameter(description = "Sort field and direction (e.g., 'createdAt,desc')") @RequestParam(required = false) String sort) {
        return ApiResponse.success(adminDocumentService.listDocuments(q, type, status, page, size, sort));
    }

    // ═══════════════════════════════════════════════════════════════
    // GET DOCUMENT BY ID
    // ═══════════════════════════════════════════════════════════════

    @Operation(summary = "Get document by ID (Admin)", description = "Get a single document by its ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Document not found")
    })
    @GetMapping("/{id}")
    public ApiResponse<AdminDocumentResponse> getDocumentById(@PathVariable Long id) {
        return ApiResponse.success(adminDocumentService.getDocumentById(id));
    }

    // ═══════════════════════════════════════════════════════════════
    // CREATE DOCUMENT
    // ═══════════════════════════════════════════════════════════════

    @Operation(summary = "Create document (Admin)", description = "Create a new document")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @PostMapping
    public ApiResponse<AdminDocumentResponse> createDocument(
            @Valid @RequestBody AdminDocumentCreateRequest request,
            Authentication authentication) {
        Long adminUserId = extractUserId(authentication);
        return ApiResponse.success(adminDocumentService.createDocument(request, adminUserId));
    }

    // ═══════════════════════════════════════════════════════════════
    // UPDATE DOCUMENT
    // ═══════════════════════════════════════════════════════════════

    @Operation(summary = "Update document (Admin)", description = "Update an existing document")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Document not found")
    })
    @PutMapping("/{id}")
    public ApiResponse<AdminDocumentResponse> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody AdminDocumentUpdateRequest request) {
        return ApiResponse.success(adminDocumentService.updateDocument(id, request));
    }

    // ═══════════════════════════════════════════════════════════════
    // DELETE DOCUMENT (SOFT DELETE)
    // ═══════════════════════════════════════════════════════════════

    @Operation(summary = "Delete document (Admin)", description = "Soft delete a document (sets status to INACTIVE)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Document not found")
    })
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDocument(@PathVariable Long id) {
        adminDocumentService.deleteDocument(id);
        return ApiResponse.success(null);
    }

    // ═══════════════════════════════════════════════════════════════
    // HARD DELETE DOCUMENT (PERMANENT)
    // ═══════════════════════════════════════════════════════════════

    @Operation(summary = "Hard delete document (Admin)", description = "Permanently delete a document from database. Only INACTIVE documents can be hard deleted.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Document is not INACTIVE"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Document not found")
    })
    @DeleteMapping("/{id}/permanent")
    public ApiResponse<Void> hardDeleteDocument(@PathVariable Long id) {
        adminDocumentService.hardDeleteDocument(id);
        return ApiResponse.success(null);
    }

    // ═══════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Extract the user ID from the JWT authentication principal.
     */
    private Long extractUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            // Try to get user ID from JWT claims
            Object userIdClaim = jwt.getClaim("userId");
            if (userIdClaim instanceof Number) {
                return ((Number) userIdClaim).longValue();
            }
            // Fallback: try to extract from subject
            String subject = jwt.getSubject();
            if (subject != null) {
                try {
                    return Long.parseLong(subject);
                } catch (NumberFormatException e) {
                    // Subject might be username, not ID
                }
            }
        }
        // Default to 1 (admin user) if extraction fails
        return 1L;
    }
}
