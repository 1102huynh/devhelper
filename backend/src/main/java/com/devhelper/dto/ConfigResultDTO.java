package com.devhelper.dto;

import java.util.ArrayList;
import java.util.List;

public class ConfigResultDTO {
    private boolean success;
    private int filesUpdated;
    private String message;
    private List<String> updatedFiles;

    public ConfigResultDTO() {
        this.updatedFiles = new ArrayList<>();
    }

    public ConfigResultDTO(boolean success, int filesUpdated, String message, List<String> updatedFiles) {
        this.success = success;
        this.filesUpdated = filesUpdated;
        this.message = message;
        this.updatedFiles = updatedFiles != null ? updatedFiles : new ArrayList<>();
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getFilesUpdated() {
        return filesUpdated;
    }

    public void setFilesUpdated(int filesUpdated) {
        this.filesUpdated = filesUpdated;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getUpdatedFiles() {
        return updatedFiles;
    }

    public void setUpdatedFiles(List<String> updatedFiles) {
        this.updatedFiles = updatedFiles;
    }
}
