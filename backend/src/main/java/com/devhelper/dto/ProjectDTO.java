package com.devhelper.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class ProjectDTO {
    private String name;
    private String path;
    
    @JsonProperty("isGitRepo")
    private boolean gitRepo;
    
    private String currentBranch;
    
    @JsonProperty("hasUncommittedChanges")
    private boolean uncommittedChanges;
    
    @JsonProperty("isMavenProject")
    private boolean mavenProject;
    
    @JsonProperty("isNodeProject")
    private boolean nodeProject;
    
    private List<String> recentBranches;
    
    // Build status: "success", "failed", or null
    private String lastBuildStatus;
    private String lastBuildTime;

    public ProjectDTO() {}

    public ProjectDTO(String name, String path, boolean gitRepo) {
        this.name = name;
        this.path = path;
        this.gitRepo = gitRepo;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public boolean isGitRepo() {
        return gitRepo;
    }

    public void setGitRepo(boolean gitRepo) {
        this.gitRepo = gitRepo;
    }

    public String getCurrentBranch() {
        return currentBranch;
    }

    public void setCurrentBranch(String currentBranch) {
        this.currentBranch = currentBranch;
    }

    public boolean isUncommittedChanges() {
        return uncommittedChanges;
    }

    public void setUncommittedChanges(boolean uncommittedChanges) {
        this.uncommittedChanges = uncommittedChanges;
    }

    public List<String> getRecentBranches() {
        return recentBranches;
    }

    public void setRecentBranches(List<String> recentBranches) {
        this.recentBranches = recentBranches;
    }

    public boolean isMavenProject() {
        return mavenProject;
    }

    public void setMavenProject(boolean mavenProject) {
        this.mavenProject = mavenProject;
    }

    public String getLastBuildStatus() {
        return lastBuildStatus;
    }

    public void setLastBuildStatus(String lastBuildStatus) {
        this.lastBuildStatus = lastBuildStatus;
    }

    public String getLastBuildTime() {
        return lastBuildTime;
    }

    public void setLastBuildTime(String lastBuildTime) {
        this.lastBuildTime = lastBuildTime;
    }

    public boolean isNodeProject() {
        return nodeProject;
    }

    public void setNodeProject(boolean nodeProject) {
        this.nodeProject = nodeProject;
    }
}
