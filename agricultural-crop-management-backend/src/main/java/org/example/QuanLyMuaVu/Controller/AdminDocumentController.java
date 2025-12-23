package org.example.QuanLyMuaVu.Controller;

import lombok.RequiredArgsConstructor;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Request.DocumentRequest;
import org.example.QuanLyMuaVu.DTO.Response.DocumentResponse;
import org.example.QuanLyMuaVu.Service.DocumentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin endpoints for creating, updating and deleting global documents
 * and knowledge base content (business flow [10]).
 */

@RestController
@RequestMapping("/api/v1/admin/documents")
@RequiredArgsConstructor
public class AdminDocumentController {
    private final DocumentService documentService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<DocumentResponse> create(@RequestBody DocumentRequest request) {
        return ApiResponse.success(documentService.create(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<DocumentResponse> update(@PathVariable Integer id, @RequestBody DocumentRequest request) {
        return ApiResponse.success(documentService.update(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        documentService.delete(id);
        return ApiResponse.success(null);
    }
}
