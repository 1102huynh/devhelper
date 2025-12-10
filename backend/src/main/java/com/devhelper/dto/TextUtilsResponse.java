package com.devhelper.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextUtilsResponse {
    private String result;
    private Integer originalLength;
    private Integer resultLength;
    private Integer wordCount;
    private Integer lineCount;
}

