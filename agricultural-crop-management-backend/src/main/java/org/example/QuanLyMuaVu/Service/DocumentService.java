package org.example.QuanLyMuaVu.Service;

import lombok.RequiredArgsConstructor;
import org.example.QuanLyMuaVu.DTO.Request.DocumentRequest;
import org.example.QuanLyMuaVu.DTO.Response.DocumentResponse;
import org.example.QuanLyMuaVu.Entity.Document;
import org.example.QuanLyMuaVu.Repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentService {
    private final DocumentRepository documentRepository;

    public DocumentResponse create(DocumentRequest request) {
        Document doc = Document.builder().title(request.getTitle()).content(request.getContent()).build();
        doc = documentRepository.save(doc);
        return toResponse(doc);
    }

    public List<DocumentResponse> getAll() {
        return documentRepository.findAll().stream().map(this::toResponse).toList();
    }

    public DocumentResponse getById(Integer id) {
        return documentRepository.findById(id).map(this::toResponse).orElse(null);
    }

    public DocumentResponse update(Integer id, DocumentRequest request) {
        Document doc = documentRepository.findById(id).orElseThrow();
        doc.setTitle(request.getTitle());
        doc.setContent(request.getContent());
        return toResponse(documentRepository.save(doc));
    }

    public void delete(Integer id) {
        documentRepository.deleteById(id);
    }

    private DocumentResponse toResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .content(doc.getContent())
                .build();
    }
}
