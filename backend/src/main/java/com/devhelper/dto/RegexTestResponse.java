package com.devhelper.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegexTestResponse {
    @JsonProperty("isValid")
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

