package com.devhelper.service;

import com.devhelper.dto.DeploymentInfo;
import com.devhelper.dto.TomcatInfo;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DeployService {

    // Store pending deployments
    private final Map<String, DeploymentInfo> deployments = new ConcurrentHashMap<>();

    /**
     * List Tomcat installations from base path
     */
    public List<TomcatInfo> listTomcats(String basePath) {
        List<TomcatInfo> tomcats = new ArrayList<>();
        
        File baseDir = new File(basePath);
        if (!baseDir.exists() || !baseDir.isDirectory()) {
            return tomcats;
        }

        File[] subDirs = baseDir.listFiles(File::isDirectory);
        if (subDirs == null) {
            return tomcats;
        }

        for (File dir : subDirs) {
            // Check if it's a Tomcat installation (has bin/startup.bat or bin/startup.sh)
            File binDir = new File(dir, "bin");
            File startupBat = new File(binDir, "startup.bat");
            File startupSh = new File(binDir, "startup.sh");
            
            if (startupBat.exists() || startupSh.exists()) {
                File webappsDir = new File(dir, "webapps");
                
                // Try to extract version from folder name (apache-tomcat-9.0.80)
                String name = dir.getName();
                String version = "";
                if (name.toLowerCase().contains("tomcat")) {
                    String[] parts = name.split("-");
                    if (parts.length >= 3) {
                        version = parts[parts.length - 1];
                    }
                }
                
                TomcatInfo tomcat = new TomcatInfo(
                    name,
                    dir.getAbsolutePath(),
                    version,
                    webappsDir.exists()
                );
                tomcats.add(tomcat);
            }
        }

        return tomcats;
    }

    /**
     * Prepare deployment - find WAR or JAR file and add to pending list
     */
    public DeploymentInfo prepareDeployment(String projectPath, String projectName) throws IOException {
        File targetDir = new File(projectPath, "target");
        
        if (!targetDir.exists()) {
            throw new IOException("Target directory not found. Please build the project first.");
        }

        // Find WAR file first, then JAR file
        File[] warFiles = targetDir.listFiles((dir, name) -> name.endsWith(".war"));
        File[] jarFiles = targetDir.listFiles((dir, name) -> 
            name.endsWith(".jar") && !name.contains("-sources") && !name.contains("-javadoc"));
        
        File deployFile = null;
        String fileType = "";
        
        if (warFiles != null && warFiles.length > 0) {
            deployFile = warFiles[0];
            fileType = "WAR";
        } else if (jarFiles != null && jarFiles.length > 0) {
            deployFile = jarFiles[0];
            fileType = "JAR";
        }
        
        if (deployFile == null) {
            throw new IOException("No WAR or JAR file found in target directory. Please build the project first.");
        }
        
        // Create deployment info
        String deploymentId = UUID.randomUUID().toString().substring(0, 8);
        DeploymentInfo deploymentInfo = new DeploymentInfo();
        deploymentInfo.setId(deploymentId);
        deploymentInfo.setProjectName(projectName);
        deploymentInfo.setProjectPath(projectPath);
        deploymentInfo.setWarFileName(deployFile.getName());
        deploymentInfo.setWarFilePath(deployFile.getAbsolutePath());
        deploymentInfo.setWarFileSize(deployFile.length());
        deploymentInfo.setFileType(fileType);
        deploymentInfo.setStatus("pending");
        deploymentInfo.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        // Add to pending deployments
        deployments.put(deploymentId, deploymentInfo);

        return deploymentInfo;
    }

    /**
     * Get all deployments
     */
    public List<DeploymentInfo> getDeployments() {
        return new ArrayList<>(deployments.values());
    }

    /**
     * Get deployment by ID
     */
    public DeploymentInfo getDeployment(String id) {
        return deployments.get(id);
    }

    /**
     * Deploy WAR/JAR to Tomcat
     */
    public DeploymentInfo deployToTomcat(String deploymentId, String tomcatPath) throws IOException {
        DeploymentInfo deployment = deployments.get(deploymentId);
        
        if (deployment == null) {
            throw new IOException("Deployment not found: " + deploymentId);
        }

        // Check source file exists
        File sourceFile = new File(deployment.getWarFilePath());
        if (!sourceFile.exists()) {
            throw new IOException("Source file not found: " + deployment.getWarFilePath() + ". Please rebuild the project.");
        }

        File tomcatDir = new File(tomcatPath);
        if (!tomcatDir.exists()) {
            throw new IOException("Tomcat directory not found: " + tomcatPath);
        }

        File webappsDir = new File(tomcatDir, "webapps");
        if (!webappsDir.exists()) {
            throw new IOException("Tomcat webapps directory not found: " + webappsDir.getAbsolutePath());
        }

        // Copy WAR/JAR file to webapps
        Path source = sourceFile.toPath();
        Path destination = webappsDir.toPath().resolve(deployment.getWarFileName());
        
        System.out.println("Copying " + source + " to " + destination);
        
        Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
        
        System.out.println("Copy completed successfully!");

        // Update deployment status
        deployment.setStatus("deployed");
        deployment.setTomcatPath(tomcatPath);
        deployment.setTomcatName(new File(tomcatPath).getName());
        deployment.setDeployedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        // Set context path (WAR filename without extension)
        String fileName = deployment.getWarFileName();
        String contextPath = "/" + fileName.replaceAll("\\.(war|jar)$", "");
        deployment.setContextPath(contextPath);

        return deployment;
    }

    /**
     * Start Tomcat
     */
    public String startTomcat(String tomcatPath) throws IOException, InterruptedException {
        File tomcatDir = new File(tomcatPath);
        File binDir = new File(tomcatDir, "bin");
        
        String os = System.getProperty("os.name").toLowerCase();
        
        // Check for catalina.bat (preferred) or startup.bat
        File catalinaScript = new File(binDir, os.contains("win") ? "catalina.bat" : "catalina.sh");
        if (!catalinaScript.exists()) {
            throw new IOException("Tomcat catalina script not found: " + catalinaScript.getAbsolutePath());
        }

        // Use unique window title based on tomcat folder name for easy identification
        String windowTitle = "DevHelper-Tomcat-" + tomcatDir.getName();

        ProcessBuilder pb;
        if (os.contains("win")) {
            // Use catalina.bat run to run Tomcat in foreground within our window
            // This keeps the window open and under our control with a specific title
            // The "title" command sets the window title, then catalina.bat run starts Tomcat
            pb = new ProcessBuilder("cmd.exe", "/c", 
                "start \"" + windowTitle + "\" /D \"" + binDir.getAbsolutePath() + "\" " +
                "cmd /c \"title " + windowTitle + " && catalina.bat run\"");
        } else {
            pb = new ProcessBuilder("./catalina.sh", "run");
        }
        
        pb.directory(binDir);
        pb.redirectErrorStream(true);
        
        // Start the process but don't wait for it
        pb.start();

        return "Tomcat starting...";
    }

    /**
     * Stop Tomcat
     */
    public String stopTomcat(String tomcatPath) throws IOException, InterruptedException {
        File tomcatDir = new File(tomcatPath);
        File binDir = new File(tomcatDir, "bin");
        
        String os = System.getProperty("os.name").toLowerCase();
        
        // Use the same unique window title as in startTomcat
        String windowTitle = "DevHelper-Tomcat-" + tomcatDir.getName();

        if (os.contains("win")) {
            // Method 1: Use taskkill with /T to kill the window and ALL child processes (including Java)
            try {
                // /T = tree kill (kills all child processes)
                // /F = force kill
                // /FI = filter by window title
                ProcessBuilder killTreePb = new ProcessBuilder("cmd.exe", "/c", 
                    "taskkill /FI \"WINDOWTITLE eq " + windowTitle + "\" /T /F");
                killTreePb.redirectErrorStream(true);
                Process killProcess = killTreePb.start();
                killProcess.waitFor(3, java.util.concurrent.TimeUnit.SECONDS);
            } catch (Exception e) {
                // Ignore errors
            }

            // Method 2: Also try to kill by partial title match (in case title changed slightly)
            try {
                ProcessBuilder killPartialPb = new ProcessBuilder("cmd.exe", "/c", 
                    "taskkill /FI \"WINDOWTITLE eq " + windowTitle + "*\" /T /F");
                killPartialPb.redirectErrorStream(true);
                Process killProcess = killPartialPb.start();
                killProcess.waitFor(2, java.util.concurrent.TimeUnit.SECONDS);
            } catch (Exception e) {
                // Ignore errors
            }

            // Method 3: Run catalina.bat stop as backup to ensure Tomcat process stops
            try {
                File catalinaScript = new File(binDir, "catalina.bat");
                if (catalinaScript.exists()) {
                    ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/c", 
                        "cd /d \"" + binDir.getAbsolutePath() + "\" && catalina.bat stop");
                    pb.directory(binDir);
                    pb.redirectErrorStream(true);
                    pb.start();
                }
            } catch (Exception e) {
                // Ignore errors
            }
        } else {
            // Linux/Mac: use catalina.sh stop
            ProcessBuilder pb = new ProcessBuilder("./catalina.sh", "stop");
            pb.directory(binDir);
            pb.redirectErrorStream(true);
            pb.start();
        }

        return "Tomcat stopping...";
    }

    /**
     * Remove deployment
     */
    public void removeDeployment(String deploymentId) {
        deployments.remove(deploymentId);
    }
}
