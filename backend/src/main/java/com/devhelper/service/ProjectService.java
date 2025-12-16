package com.devhelper.service;

import com.devhelper.dto.GitCommandResult;
import com.devhelper.dto.ProjectDTO;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    // Store build status for each project path
    private final Map<String, BuildStatus> buildStatusCache = new ConcurrentHashMap<>();
    
    private static class BuildStatus {
        String status; // "success" or "failed"
        String time;
        String log; // Build output log
        
        BuildStatus(String status, String time, String log) {
            this.status = status;
            this.time = time;
            this.log = log;
        }
    }

    /**
     * List all project folders from the given base path
     */
    public CompletableFuture<List<ProjectDTO>> listProjects(String basePath) {
        return CompletableFuture.supplyAsync(() -> {
            List<ProjectDTO> projects = new ArrayList<>();
            
            try {
                Path path = Paths.get(basePath);
                if (!Files.exists(path) || !Files.isDirectory(path)) {
                    return projects;
                }

                List<Path> directories = Files.list(path)
                        .filter(Files::isDirectory)
                        .filter(p -> !p.getFileName().toString().startsWith("."))
                        .collect(Collectors.toList());

                for (Path dir : directories) {
                    ProjectDTO project = new ProjectDTO();
                    project.setName(dir.getFileName().toString());
                    project.setPath(dir.toAbsolutePath().toString());
                    
                    // Check if it's a git repository
                    Path gitDir = dir.resolve(".git");
                    boolean isGitRepo = Files.exists(gitDir) && Files.isDirectory(gitDir);
                    project.setGitRepo(isGitRepo);
                    
                    if (isGitRepo) {
                        // Get current branch
                        String branch = executeGitCommand(dir.toFile(), "git", "rev-parse", "--abbrev-ref", "HEAD");
                        project.setCurrentBranch(branch.trim());
                        
                        // Check for uncommitted changes
                        String status = executeGitCommand(dir.toFile(), "git", "status", "--porcelain");
                        project.setUncommittedChanges(!status.trim().isEmpty());
                        
                        // Get recent branches (up to 5)
                        String branchesOutput = executeGitCommand(dir.toFile(), "git", "branch", "--sort=-committerdate");
                        List<String> branches = new ArrayList<>();
                        for (String line : branchesOutput.split("\n")) {
                            String branchName = line.trim().replace("* ", "");
                            if (!branchName.isEmpty() && branches.size() < 5) {
                                branches.add(branchName);
                            }
                        }
                        project.setRecentBranches(branches);
                    }
                    
                    // Check if it's a Maven project (has pom.xml)
                    Path pomFile = dir.resolve("pom.xml");
                    project.setMavenProject(Files.exists(pomFile));
                    
                    // Check if it's a Node.js project (has package.json)
                    Path packageJson = dir.resolve("package.json");
                    project.setNodeProject(Files.exists(packageJson));
                    
                    // Get build status from cache
                    BuildStatus buildStatus = buildStatusCache.get(project.getPath());
                    if (buildStatus != null) {
                        project.setLastBuildStatus(buildStatus.status);
                        project.setLastBuildTime(buildStatus.time);
                    }
                    
                    projects.add(project);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            
            return projects;
        });
    }

    /**
     * Get build log for a project
     */
    public String getBuildLog(String projectPath) {
        BuildStatus status = buildStatusCache.get(projectPath);
        return status != null ? status.log : null;
    }

    /**
     * Execute Maven build command
     */
    public CompletableFuture<GitCommandResult> mavenBuild(String projectPath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                File dir = new File(projectPath);
                // Check if pom.xml exists
                if (!new File(dir, "pom.xml").exists()) {
                    return GitCommandResult.failure("Not a Maven project (pom.xml not found)", "mvn clean install");
                }
                // Use cmd.exe /c on Windows to run mvn command
                String os = System.getProperty("os.name").toLowerCase();
                String output;
                if (os.contains("win")) {
                    output = executeGitCommand(dir, "cmd.exe", "/c", "mvn", "clean", "install", "-DskipTests");
                } else {
                    output = executeGitCommand(dir, "mvn", "clean", "install", "-DskipTests");
                }
                // Save success status with log
                String timeNow = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
                buildStatusCache.put(projectPath, new BuildStatus("success", timeNow, output));
                return GitCommandResult.success(output, "mvn clean install -DskipTests");
            } catch (Exception e) {
                // Save failed status with error log
                String timeNow = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
                buildStatusCache.put(projectPath, new BuildStatus("failed", timeNow, e.getMessage()));
                return GitCommandResult.failure(e.getMessage(), "mvn clean install -DskipTests");
            }
        });
    }

    /**
     * Execute npm build command
     */
    public CompletableFuture<GitCommandResult> npmBuild(String projectPath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                File dir = new File(projectPath);
                // Check if package.json exists
                if (!new File(dir, "package.json").exists()) {
                    return GitCommandResult.failure("Not a Node.js project (package.json not found)", "npm install");
                }
                // Use cmd.exe /c on Windows to run npm command
                String os = System.getProperty("os.name").toLowerCase();
                String output;
                if (os.contains("win")) {
                    output = executeGitCommand(dir, "cmd.exe", "/c", "npm", "install");
                } else {
                    output = executeGitCommand(dir, "npm", "install");
                }
                // Save success status with log
                String timeNow = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
                buildStatusCache.put(projectPath, new BuildStatus("success", timeNow, output));
                return GitCommandResult.success(output, "npm install");
            } catch (Exception e) {
                // Save failed status with error log
                String timeNow = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
                buildStatusCache.put(projectPath, new BuildStatus("failed", timeNow, e.getMessage()));
                return GitCommandResult.failure(e.getMessage(), "npm install");
            }
        });
    }

    /**
     * Execute git stash command
     */
    public CompletableFuture<GitCommandResult> gitStash(String projectPath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                File dir = new File(projectPath);
                String output = executeGitCommand(dir, "git", "stash");
                return GitCommandResult.success(output, "git stash");
            } catch (Exception e) {
                return GitCommandResult.failure(e.getMessage(), "git stash");
            }
        });
    }

    /**
     * Execute git stash pop command
     */
    public CompletableFuture<GitCommandResult> gitStashPop(String projectPath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                File dir = new File(projectPath);
                String output = executeGitCommand(dir, "git", "stash", "pop");
                return GitCommandResult.success(output, "git stash pop");
            } catch (Exception e) {
                return GitCommandResult.failure(e.getMessage(), "git stash pop");
            }
        });
    }

    /**
     * Execute git push command
     */
    public CompletableFuture<GitCommandResult> gitPush(String projectPath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                File dir = new File(projectPath);
                String output = executeGitCommand(dir, "git", "push");
                return GitCommandResult.success(output, "git push");
            } catch (Exception e) {
                return GitCommandResult.failure(e.getMessage(), "git push");
            }
        });
    }

    /**
     * Execute git fetch command
     */
    public CompletableFuture<GitCommandResult> gitFetch(String projectPath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                File dir = new File(projectPath);
                String output = executeGitCommand(dir, "git", "fetch", "--all");
                return GitCommandResult.success(output, "git fetch --all");
            } catch (Exception e) {
                return GitCommandResult.failure(e.getMessage(), "git fetch --all");
            }
        });
    }

    /**
     * Execute git pull command
     */
    public CompletableFuture<GitCommandResult> gitPull(String projectPath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                File dir = new File(projectPath);
                String output = executeGitCommand(dir, "git", "pull");
                return GitCommandResult.success(output, "git pull");
            } catch (Exception e) {
                return GitCommandResult.failure(e.getMessage(), "git pull");
            }
        });
    }

    /**
     * Execute git checkout command
     */
    public CompletableFuture<GitCommandResult> gitCheckout(String projectPath, String branch) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                File dir = new File(projectPath);
                String output = executeGitCommand(dir, "git", "checkout", branch);
                return GitCommandResult.success(output, "git checkout " + branch);
            } catch (Exception e) {
                return GitCommandResult.failure(e.getMessage(), "git checkout " + branch);
            }
        });
    }

    /**
     * Get git status
     */
    public CompletableFuture<GitCommandResult> gitStatus(String projectPath) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                File dir = new File(projectPath);
                String output = executeGitCommand(dir, "git", "status");
                return GitCommandResult.success(output, "git status");
            } catch (Exception e) {
                return GitCommandResult.failure(e.getMessage(), "git status");
            }
        });
    }

    /**
     * Execute a git command and return the output
     */
    private String executeGitCommand(File directory, String... command) throws Exception {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.directory(directory);
        processBuilder.redirectErrorStream(true);
        
        Process process = processBuilder.start();
        
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        
        boolean finished = process.waitFor(30, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("Command timed out");
        }
        
        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new RuntimeException("Command failed with exit code: " + exitCode + "\n" + output.toString());
        }
        
        return output.toString();
    }
}
