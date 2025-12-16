package com.devhelper.dto;

public class GitCommandResult {
    private boolean success;
    private String output;
    private String error;
    private String command;

    public GitCommandResult() {}

    public GitCommandResult(boolean success, String output, String error, String command) {
        this.success = success;
        this.output = output;
        this.error = error;
        this.command = command;
    }

    public static GitCommandResult success(String output, String command) {
        return new GitCommandResult(true, output, null, command);
    }

    public static GitCommandResult failure(String error, String command) {
        return new GitCommandResult(false, null, error, command);
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }
}
