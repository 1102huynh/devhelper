package com.devhelper.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JsonFormatResponse {
    @JsonProperty("isValid")
    private boolean isValid;
    private String formatted;
    private String minified;
    private String error;
    private int size;
}

