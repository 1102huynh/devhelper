package com.devhelper.dto;

public class TomcatInfo {
    private String name;
    private String path;
    private String version;
    private boolean hasWebapps;

    public TomcatInfo() {}

    public TomcatInfo(String name, String path, String version, boolean hasWebapps) {
        this.name = name;
        this.path = path;
        this.version = version;
        this.hasWebapps = hasWebapps;
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

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public boolean isHasWebapps() {
        return hasWebapps;
    }

    public void setHasWebapps(boolean hasWebapps) {
        this.hasWebapps = hasWebapps;
    }
}
