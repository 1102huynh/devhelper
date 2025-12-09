package com.devhelper.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JsonFormatRequest {
    private String jsonString;
    private int indentSize = 2;
    private boolean sortKeys = false;
}

