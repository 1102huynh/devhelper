package com.devhelper.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegexTestRequest {
    private String pattern;
    private String testString;
    private List<String> flags; // i (case-insensitive), g (global), m (multiline)
}

