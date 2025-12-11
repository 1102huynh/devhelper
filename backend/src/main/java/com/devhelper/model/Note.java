package com.devhelper.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Note {
    private String id;
    private String title;
    private String content;
    private String tags;
    private boolean pinned = false;
    private Long createdAt;
    private Long updatedAt;
}

