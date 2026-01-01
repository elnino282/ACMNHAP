package org.example.QuanLyMuaVu.DTO.Request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Filter object for Admin Reports queries.
 * Consolidates all filter parameters into a single object.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportFilter {

    /** Filter by year (converted to date range internally) */
    private Integer year;

    /** Alternative: explicit start date (takes precedence over year) */
    private LocalDate fromDate;

    /** Alternative: explicit end date (takes precedence over year) */
    private LocalDate toDate;

    /** Filter by crop ID */
    private Integer cropId;

    /** Filter by farm ID */
    private Integer farmId;

    /** Filter by plot ID */
    private Integer plotId;

    /**
     * Get effective start date for query.
     * Uses fromDate if set, otherwise computes from year.
     * Defaults to current year if neither is set.
     */
    public LocalDate getEffectiveFromDate() {
        if (fromDate != null) {
            return fromDate;
        }
        int y = year != null ? year : LocalDate.now().getYear();
        return LocalDate.of(y, 1, 1);
    }

    /**
     * Get effective end date for query (exclusive).
     * Uses toDate if set, otherwise computes from year.
     * Defaults to next year start if neither is set.
     */
    public LocalDate getEffectiveToDate() {
        if (toDate != null) {
            return toDate;
        }
        int y = year != null ? year : LocalDate.now().getYear();
        return LocalDate.of(y + 1, 1, 1);
    }
}
