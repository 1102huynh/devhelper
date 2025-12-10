package com.devhelper.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiffResponse {
    private List<DiffLine> differences;
    private Integer totalLines;
    private Long changedLines;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiffLine {
        private String type; // "added", "removed", "unchanged"
        private String content;
        private Integer lineNumber;
    }
}

