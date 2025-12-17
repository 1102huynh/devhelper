package com.devhelper.service;

import com.devhelper.dto.GitCommandResult;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TestService {

    // Store running test logs: projectId -> log content
    private final Map<String, StringBuilder> testLogs = new ConcurrentHashMap<>();
    private final Map<String, Boolean> testRunning = new ConcurrentHashMap<>();

    public CompletableFuture<GitCommandResult> runTest(String projectPath, String command, boolean openTerminal) {
        return CompletableFuture.supplyAsync(() -> {
            String projectId = projectPath; // Use path as ID for simplicity

            // Initialize log if not exists (don't clear existing logs for sequential runs)
            testLogs.putIfAbsent(projectId, new StringBuilder());
            testRunning.put(projectId, true);
            
            try {
                File dir = new File(projectPath);
                if (!dir.exists()) {
                    return GitCommandResult.failure("Project directory not found", command);
                }

                // Append initial log
                log(projectId, "=".repeat(70));
                log(projectId, "Working Directory: " + projectPath);
                log(projectId, "Command: " + command);
                log(projectId, "=".repeat(70));
                log(projectId, "");

                // If openTerminal is true, open a new CMD window in the project directory
                if (openTerminal) {
                    boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
                    if (isWindows) {
                        // Open new CMD window with the command
                        String cmdCommand = "start cmd.exe /K \"cd /d " + projectPath + " && " + command + "\"";
                        ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/c", cmdCommand);
                        pb.start();

                        log(projectId, "Opened new CMD window in: " + projectPath);
                        log(projectId, "Command will execute in the new window");
                        testRunning.put(projectId, false);
                        return GitCommandResult.success("Test started in new CMD window", command);
                    }
                }

                // Otherwise run in background (original behavior)
                // Prepare process
                String[] cmdParts;
                boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
                if (isWindows) {
                    cmdParts = new String[]{"cmd.exe", "/c", command};
                } else {
                    cmdParts = command.split(" ");
                }

                ProcessBuilder processBuilder = new ProcessBuilder(cmdParts);
                processBuilder.directory(dir);
                processBuilder.redirectErrorStream(true);

                Process process = processBuilder.start();

                // Read output
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        log(projectId, line);
                    }
                }

                // Wait for completion (timeout 30 minutes)
                boolean finished = process.waitFor(30, TimeUnit.MINUTES);
                if (!finished) {
                    process.destroyForcibly();
                    log(projectId, "TIMEOUT: Process terminated after 30 minutes");
                    throw new RuntimeException("Test timed out");
                }

                int exitCode = process.exitValue();
                if (exitCode == 0) {
                    log(projectId, "TEST SUCCESSFUL");
                    return GitCommandResult.success(testLogs.get(projectId).toString(), command);
                } else {
                    log(projectId, "TEST FAILED with exit code " + exitCode);
                    return GitCommandResult.failure(testLogs.get(projectId).toString(), command);
                }

            } catch (Exception e) {
                log(projectId, "ERROR: " + e.getMessage());
                return GitCommandResult.failure(e.getMessage(), command);
            } finally {
                testRunning.put(projectId, false);
            }
        });
    }

    // Backward compatibility method
    public CompletableFuture<GitCommandResult> runTest(String projectPath, String command) {
        return runTest(projectPath, command, false);
    }

    public String getTestLog(String projectPath) {
        StringBuilder log = testLogs.get(projectPath);
        return log != null ? log.toString() : "";
    }
    
    public boolean isTestRunning(String projectPath) {
        return testRunning.getOrDefault(projectPath, false);
    }

    public List<Map<String, String>> getTestSuites(String projectPath) {
        List<Map<String, String>> testSuites = new ArrayList<>();

        try {
            File projectDir = new File(projectPath);
            if (!projectDir.exists()) {
                return testSuites;
            }

            // Check for Maven project structure
            Path testSourcePath = Paths.get(projectPath, "src", "test", "java");
            if (Files.exists(testSourcePath)) {
                // Find Java test files
                try (Stream<Path> paths = Files.walk(testSourcePath)) {
                    List<Path> testFiles = paths
                            .filter(Files::isRegularFile)
                            .filter(p -> p.toString().endsWith("Test.java") ||
                                        p.toString().endsWith("Tests.java") ||
                                        p.toString().endsWith("IT.java") ||
                                        p.toString().contains("Test"))
                            .collect(Collectors.toList());

                    for (Path testFile : testFiles) {
                        String fileName = testFile.getFileName().toString();
                        String relativePath = testSourcePath.relativize(testFile).toString();
                        String className = relativePath.replace(File.separatorChar, '.')
                                .replace(".java", "");

                        Map<String, String> suite = new HashMap<>();
                        suite.put("name", fileName.replace(".java", ""));
                        suite.put("className", className);
                        suite.put("path", testFile.toString());
                        suite.put("type", "junit");
                        testSuites.add(suite);
                    }
                }
            }

            // Check for Cucumber features (for frontend projects or backend with cucumber)
            Path featuresPath = Paths.get(projectPath, "src", "test", "resources", "features");
            if (!Files.exists(featuresPath)) {
                // Try frontend path
                featuresPath = Paths.get(projectPath, "tests", "e2e", "features");
            }

            if (Files.exists(featuresPath)) {
                try (Stream<Path> paths = Files.walk(featuresPath)) {
                    List<Path> featureFiles = paths
                            .filter(Files::isRegularFile)
                            .filter(p -> p.toString().endsWith(".feature"))
                            .collect(Collectors.toList());

                    for (Path featureFile : featureFiles) {
                        String fileName = featureFile.getFileName().toString();

                        Map<String, String> suite = new HashMap<>();
                        suite.put("name", fileName.replace(".feature", ""));
                        suite.put("className", fileName);
                        suite.put("path", featureFile.toString());
                        suite.put("type", "cucumber");
                        testSuites.add(suite);
                    }
                }
            }

            // Scan newXp directory for XifinPortal test suites
            Path newXpPath = Paths.get(projectPath, "src", "test", "resources", "newXp");
            if (Files.exists(newXpPath)) {
                scanTestSuiteDirectory(newXpPath, testSuites, "xifinportal");
            }

            // Scan pfEngines directory for engine test suites
            Path pfEnginesPath = Paths.get(projectPath, "src", "test", "resources", "pfEngines");
            if (Files.exists(pfEnginesPath)) {
                scanTestSuiteDirectory(pfEnginesPath, testSuites, "engine");
            }

            // Scan restassured directory for REST API test suites
            Path restAssuredPath = Paths.get(projectPath, "src", "test", "resources", "restassured");
            if (Files.exists(restAssuredPath)) {
                scanTestSuiteDirectory(restAssuredPath, testSuites, "restapi");
            }

        } catch (Exception e) {
            System.err.println("Error scanning test suites: " + e.getMessage());
        }

        return testSuites;
    }

    /**
     * Scan a directory for test suite files (XML, properties, or other test definitions)
     */
    private void scanTestSuiteDirectory(Path directory, List<Map<String, String>> testSuites, String type) {
        try (Stream<Path> paths = Files.walk(directory)) {
            List<Path> suiteFiles = paths
                    .filter(Files::isRegularFile)
                    .filter(p -> {
                        String fileName = p.toString().toLowerCase();
                        return fileName.endsWith(".xml") ||
                               fileName.endsWith(".properties") ||
                               fileName.endsWith(".suite") ||
                               fileName.endsWith(".json") ||
                               fileName.contains("suite") ||
                               fileName.contains("test");
                    })
                    .collect(Collectors.toList());

            for (Path suiteFile : suiteFiles) {
                String fileName = suiteFile.getFileName().toString();
                String relativePath = directory.relativize(suiteFile).toString();

                // Remove file extension for display name
                String displayName = fileName;
                int lastDot = fileName.lastIndexOf('.');
                if (lastDot > 0) {
                    displayName = fileName.substring(0, lastDot);
                }

                Map<String, String> suite = new HashMap<>();
                suite.put("name", displayName);
                suite.put("className", relativePath);
                suite.put("path", suiteFile.toString());
                suite.put("type", type);
                testSuites.add(suite);
            }
        } catch (Exception e) {
            System.err.println("Error scanning directory " + directory + ": " + e.getMessage());
        }
    }

    private void log(String projectId, String message) {
        StringBuilder sb = testLogs.get(projectId);
        if (sb != null) {
            sb.append(message).append("\n");
        }
    }

    public void clearTestLog(String projectPath) {
        testLogs.put(projectPath, new StringBuilder());
    }
}
