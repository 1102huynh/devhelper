package com.devhelper.dto;

public class GitCommandRequest {
    private String projectPath;
    private String command;
    private String branch;
    private String message;
    private boolean openTerminal;

    public GitCommandRequest() {}

    public String getProjectPath() {
        return projectPath;
    }

    public void setProjectPath(String projectPath) {
        this.projectPath = projectPath;
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isOpenTerminal() {
        return openTerminal;
    }

    public void setOpenTerminal(boolean openTerminal) {
        this.openTerminal = openTerminal;
    }
}
