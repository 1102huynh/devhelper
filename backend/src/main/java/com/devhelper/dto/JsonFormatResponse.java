package com.devhelper.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JsonFormatResponse {
    private boolean isValid;
    private String formatted;
    private String minified;
    private String error;
    private int size;
}

