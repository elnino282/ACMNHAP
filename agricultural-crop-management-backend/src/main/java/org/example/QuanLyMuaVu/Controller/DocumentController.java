package org.example.QuanLyMuaVu.Controller;

import lombok.RequiredArgsConstructor;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.DTO.Response.DocumentResponse;
import org.example.QuanLyMuaVu.Service.DocumentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only access for system documents and knowledge base articles
 * (business flow [10]); creation and updates are handled via admin APIs.
 */

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PreAuthorize("hasAnyRole('ADMIN','FARMER')")
    @GetMapping
    public ApiResponse<List<DocumentResponse>> list() {
        return ApiResponse.success(documentService.getAll());
    }
}
