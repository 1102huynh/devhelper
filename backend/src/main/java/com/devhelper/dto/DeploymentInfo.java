package com.devhelper.dto;

public class DeploymentInfo {
    private String id;
    private String projectName;
    private String projectPath;
    private String warFileName;
    private String warFilePath;
    private long warFileSize;
    private String fileType; // "WAR" or "JAR"
    private String status; // "pending", "deployed", "running"
    private String contextPath; // URL path for the app (e.g., /myapp)
    private String tomcatPath;
    private String tomcatName;
    private String createdAt;
    private String deployedAt;

    public DeploymentInfo() {}

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getProjectPath() {
        return projectPath;
    }

    public void setProjectPath(String projectPath) {
        this.projectPath = projectPath;
    }

    public String getWarFileName() {
        return warFileName;
    }

    public void setWarFileName(String warFileName) {
        this.warFileName = warFileName;
    }

    public String getWarFilePath() {
        return warFilePath;
    }

    public void setWarFilePath(String warFilePath) {
        this.warFilePath = warFilePath;
    }

    public long getWarFileSize() {
        return warFileSize;
    }

    public void setWarFileSize(long warFileSize) {
        this.warFileSize = warFileSize;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTomcatPath() {
        return tomcatPath;
    }

    public void setTomcatPath(String tomcatPath) {
        this.tomcatPath = tomcatPath;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getDeployedAt() {
        return deployedAt;
    }

    public void setDeployedAt(String deployedAt) {
        this.deployedAt = deployedAt;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getTomcatName() {
        return tomcatName;
    }

    public void setTomcatName(String tomcatName) {
        this.tomcatName = tomcatName;
    }

    public String getContextPath() {
        return contextPath;
    }

    public void setContextPath(String contextPath) {
        this.contextPath = contextPath;
    }
}
