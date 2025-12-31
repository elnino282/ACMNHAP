package org.example.QuanLyMuaVu.DTO.Response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Response DTO for document data (legacy compatibility).
 * Updated to match new Document entity schema.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocumentResponse {
    Long id;
    String title;
    String description;
    String documentUrl;
    String documentType;
    String status;
    String createdAt;
    String updatedAt;
    Long createdBy;
}
