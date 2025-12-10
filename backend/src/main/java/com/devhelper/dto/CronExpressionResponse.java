package com.devhelper.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CronExpressionResponse {
    private String expression;
    private String description;
    private Boolean valid;
    private String error;
}

