package com.devhelper.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SshCommand {
    private String id;
    private String name;
    private String command;
    private String description;
    private String category;
    private Long createdAt;
    private Long updatedAt;
}

