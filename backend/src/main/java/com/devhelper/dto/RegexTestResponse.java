package com.devhelper.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegexTestResponse {
    private boolean isValid;
    private String error;
    private List<Match> matches;
    private int matchCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Match {
        private String value;
        private int start;
        private int end;
        private List<String> groups;
    }
}

