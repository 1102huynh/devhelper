package com.devhelper.service;

import com.devhelper.dto.GitCommandResult;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class TestService {

    // Store running test logs: projectId -> log content
    private final Map<String, StringBuilder> testLogs = new ConcurrentHashMap<>();
    private final Map<String, Boolean> testRunning = new ConcurrentHashMap<>();

    public CompletableFuture<GitCommandResult> runTest(String projectPath, String command) {
        return CompletableFuture.supplyAsync(() -> {
            String projectId = projectPath; // Use path as ID for simplicity
            testLogs.put(projectId, new StringBuilder());
            testRunning.put(projectId, true);
            
            try {
                File dir = new File(projectPath);
                if (!dir.exists()) {
                    return GitCommandResult.failure("Project directory not found", command);
                }

                // Append initial log
                log(projectId, "Starting test command: " + command);
                log(projectId, "Directory: " + projectPath);

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

    public String getTestLog(String projectPath) {
        StringBuilder log = testLogs.get(projectPath);
        return log != null ? log.toString() : "";
    }
    
    public boolean isTestRunning(String projectPath) {
        return testRunning.getOrDefault(projectPath, false);
    }

    private void log(String projectId, String message) {
        StringBuilder sb = testLogs.get(projectId);
        if (sb != null) {
            sb.append(message).append("\n");
        }
    }
}
