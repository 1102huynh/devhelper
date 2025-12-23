package com.devhelper.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/selenium")
@CrossOrigin(originPatterns = "*")
public class SeleniumController {

    // Default paths for Selenium bat files
    private static final String DEFAULT_HUB_PATH = "D:\\Selenium4\\SeleniumHub.bat";
    private static final String DEFAULT_NODE_PATH = "D:\\Selenium4\\SeleniumNodeStart.bat";
    
    // Track running processes
    private Process hubProcess = null;
    private Process nodeProcess = null;

    /**
     * Start Selenium Hub
     */
    @PostMapping("/start-hub")
    public ResponseEntity<?> startHub(@RequestBody(required = false) Map<String, String> request) {
        try {
            String hubPath = request != null && request.get("hubPath") != null 
                ? request.get("hubPath") 
                : DEFAULT_HUB_PATH;

            // Check if already running
            if (isHubRunning()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Hub is already running",
                    "status", "running"
                ));
            }

            // Get the directory containing the bat file
            java.io.File batFile = new java.io.File(hubPath);
            java.io.File workingDir = batFile.getParentFile();

            // Start the hub bat file with correct working directory
            ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/c", "start", "Selenium Hub", "/D", workingDir.getAbsolutePath(), hubPath);
            pb.directory(workingDir);
            pb.redirectErrorStream(true);
            hubProcess = pb.start();

            // Wait a bit for hub to start
            Thread.sleep(3000);

            boolean isRunning = isHubRunning();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", isRunning ? "Hub started successfully" : "Hub starting...",
                "status", isRunning ? "running" : "starting"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "status", "error"
            ));
        }
    }

    /**
     * Start Selenium Node
     */
    @PostMapping("/start-node")
    public ResponseEntity<?> startNode(@RequestBody(required = false) Map<String, String> request) {
        try {
            String nodePath = request != null && request.get("nodePath") != null 
                ? request.get("nodePath") 
                : DEFAULT_NODE_PATH;

            // Get the directory containing the bat file
            java.io.File batFile = new java.io.File(nodePath);
            java.io.File workingDir = batFile.getParentFile();

            // Start the node bat file with correct working directory
            ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/c", "start", "Selenium Node", "/D", workingDir.getAbsolutePath(), nodePath);
            pb.directory(workingDir);
            pb.redirectErrorStream(true);
            nodeProcess = pb.start();

            // Wait a bit for node to register
            Thread.sleep(3000);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Node started successfully",
                "status", "running"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "status", "error"
            ));
        }
    }

    /**
     * Stop all Selenium processes
     */
    @PostMapping("/stop-all")
    public ResponseEntity<?> stopAll() {
        try {
            // Kill java processes running Selenium
            ProcessBuilder pb = new ProcessBuilder("taskkill", "/F", "/IM", "java.exe", "/FI", "WINDOWTITLE eq Selenium*");
            pb.start().waitFor(5, TimeUnit.SECONDS);

            // Also try to kill by window title
            ProcessBuilder pb2 = new ProcessBuilder("taskkill", "/F", "/FI", "WINDOWTITLE eq Selenium Hub*");
            pb2.start().waitFor(2, TimeUnit.SECONDS);

            ProcessBuilder pb3 = new ProcessBuilder("taskkill", "/F", "/FI", "WINDOWTITLE eq Selenium Node*");
            pb3.start().waitFor(2, TimeUnit.SECONDS);

            hubProcess = null;
            nodeProcess = null;

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All Selenium processes stopped"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get Selenium Grid status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        boolean hubRunning = isHubRunning();
        int nodeCount = hubRunning ? getNodeCount() : 0;

        return ResponseEntity.ok(Map.of(
            "hubRunning", hubRunning,
            "hubUrl", "http://localhost:4444",
            "nodeCount", nodeCount,
            "gridConsoleUrl", "http://localhost:4444/ui"
        ));
    }

    /**
     * Check if Hub is running by pinging the status endpoint
     */
    private boolean isHubRunning() {
        try {
            URL url = new URL("http://localhost:4444/status");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(2000);
            conn.setReadTimeout(2000);
            
            int responseCode = conn.getResponseCode();
            conn.disconnect();
            
            return responseCode == 200;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get number of registered nodes
     */
    private int getNodeCount() {
        try {
            URL url = new URL("http://localhost:4444/status");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(2000);
            conn.setReadTimeout(2000);
            
            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                conn.disconnect();
                
                // Simple parse to count nodes (look for "nodes" array)
                String json = response.toString();
                if (json.contains("\"nodes\"")) {
                    // Count occurrences of "id" in nodes section
                    int count = 0;
                    int index = json.indexOf("\"nodes\"");
                    if (index > 0) {
                        String nodesSection = json.substring(index);
                        int idIndex = 0;
                        while ((idIndex = nodesSection.indexOf("\"id\"", idIndex + 1)) != -1) {
                            count++;
                        }
                    }
                    return count;
                }
            }
            conn.disconnect();
        } catch (Exception e) {
            // Ignore
        }
        return 0;
    }

    // ChromeDriver download directory
    private static final String CHROMEDRIVER_DIR = "D:\\Selenium4\\";

    /**
     * Get current Chrome browser version and latest ChromeDriver version
     */
    @GetMapping("/chromedriver-info")
    public ResponseEntity<?> getChromeDriverInfo() {
        try {
            String currentChromeVersion = getCurrentChromeVersion();
            String latestDriverVersion = getLatestChromeDriverVersion(currentChromeVersion);
            String installedDriverVersion = getInstalledChromeDriverVersion();

            boolean updateAvailable = !latestDriverVersion.equals(installedDriverVersion);

            return ResponseEntity.ok(Map.of(
                "chromeVersion", currentChromeVersion,
                "latestDriverVersion", latestDriverVersion,
                "installedDriverVersion", installedDriverVersion,
                "updateAvailable", updateAvailable,
                "downloadPath", CHROMEDRIVER_DIR
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Download latest ChromeDriver
     */
    @PostMapping("/download-chromedriver")
    public ResponseEntity<?> downloadChromeDriver() {
        try {
            String currentChromeVersion = getCurrentChromeVersion();
            String latestDriverVersion = getLatestChromeDriverVersion(currentChromeVersion);
            
            System.out.println("[SeleniumController] Downloading ChromeDriver version: " + latestDriverVersion);

            // Get download URL from Chrome for Testing API
            String downloadUrl = getChromeDriverDownloadUrl(latestDriverVersion);
            
            if (downloadUrl == null || downloadUrl.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Could not find download URL for ChromeDriver " + latestDriverVersion
                ));
            }

            System.out.println("[SeleniumController] Download URL: " + downloadUrl);

            // Download zip file
            java.io.File tempZip = new java.io.File(CHROMEDRIVER_DIR + "chromedriver_temp.zip");
            downloadFile(downloadUrl, tempZip);

            // Extract zip
            extractZip(tempZip, new java.io.File(CHROMEDRIVER_DIR));

            // Delete temp zip
            tempZip.delete();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "ChromeDriver " + latestDriverVersion + " downloaded successfully",
                "version", latestDriverVersion,
                "path", CHROMEDRIVER_DIR + "chromedriver.exe"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get current Chrome browser version from registry
     */
    private String getCurrentChromeVersion() {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "reg", "query", 
                "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon",
                "/v", "version"
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("version")) {
                    String[] parts = line.trim().split("\\s+");
                    if (parts.length >= 3) {
                        return parts[parts.length - 1]; // Return version like "131.0.6778.109"
                    }
                }
            }
            reader.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "unknown";
    }

    /**
     * Get latest ChromeDriver version matching Chrome version
     */
    private String getLatestChromeDriverVersion(String chromeVersion) {
        try {
            // Extract major version (e.g., "131" from "131.0.6778.109")
            String majorVersion = chromeVersion.split("\\.")[0];
            
            // Use Chrome for Testing API to get matching driver version
            URL url = new URL("https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_" + majorVersion);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            
            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String version = reader.readLine().trim();
                reader.close();
                conn.disconnect();
                return version;
            }
            conn.disconnect();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "unknown";
    }

    /**
     * Get installed ChromeDriver version
     */
    private String getInstalledChromeDriverVersion() {
        try {
            java.io.File chromeDriver = new java.io.File(CHROMEDRIVER_DIR + "chromedriver.exe");
            if (!chromeDriver.exists()) {
                // Check in subdirectory
                chromeDriver = findChromeDriverExe(new java.io.File(CHROMEDRIVER_DIR));
                if (chromeDriver == null) {
                    return "not installed";
                }
            }

            ProcessBuilder pb = new ProcessBuilder(chromeDriver.getAbsolutePath(), "--version");
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line = reader.readLine();
            reader.close();
            
            if (line != null && line.contains("ChromeDriver")) {
                // Parse "ChromeDriver 131.0.6778.108 (...)" -> "131.0.6778.108"
                String[] parts = line.split(" ");
                if (parts.length >= 2) {
                    return parts[1];
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "not installed";
    }

    /**
     * Find chromedriver.exe recursively
     */
    private java.io.File findChromeDriverExe(java.io.File dir) {
        java.io.File[] files = dir.listFiles();
        if (files == null) return null;
        
        for (java.io.File file : files) {
            if (file.isDirectory()) {
                java.io.File found = findChromeDriverExe(file);
                if (found != null) return found;
            } else if (file.getName().equals("chromedriver.exe")) {
                return file;
            }
        }
        return null;
    }

    /**
     * Get ChromeDriver download URL from Chrome for Testing API
     */
    private String getChromeDriverDownloadUrl(String version) {
        try {
            URL url = new URL("https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            
            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                conn.disconnect();
                
                String json = response.toString();
                
                // Find the version and get win64 download URL
                // Look for: "version": "131.0.6778.108" ... "chromedriver" ... "platform": "win64" ... "url": "..."
                int versionIndex = json.indexOf("\"version\":\"" + version + "\"");
                if (versionIndex == -1) {
                    versionIndex = json.indexOf("\"version\": \"" + version + "\"");
                }
                
                if (versionIndex > 0) {
                    // Find chromedriver section for this version
                    int chromedriverIndex = json.indexOf("\"chromedriver\"", versionIndex);
                    if (chromedriverIndex > 0) {
                        // Find win64 platform
                        int win64Index = json.indexOf("\"platform\":\"win64\"", chromedriverIndex);
                        if (win64Index == -1) {
                            win64Index = json.indexOf("\"platform\": \"win64\"", chromedriverIndex);
                        }
                        
                        if (win64Index > 0) {
                            // Find url
                            int urlIndex = json.indexOf("\"url\":", win64Index);
                            if (urlIndex > 0) {
                                int urlStart = json.indexOf("\"", urlIndex + 6) + 1;
                                int urlEnd = json.indexOf("\"", urlStart);
                                return json.substring(urlStart, urlEnd);
                            }
                        }
                    }
                }
            }
            conn.disconnect();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Download file from URL
     */
    private void downloadFile(String urlStr, java.io.File dest) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(30000);
        conn.setReadTimeout(60000);
        
        try (java.io.InputStream in = conn.getInputStream();
             java.io.FileOutputStream out = new java.io.FileOutputStream(dest)) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
        conn.disconnect();
    }

    /**
     * Extract zip file
     */
    private void extractZip(java.io.File zipFile, java.io.File destDir) throws Exception {
        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(
                new java.io.FileInputStream(zipFile))) {
            java.util.zip.ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                java.io.File newFile = new java.io.File(destDir, entry.getName());
                
                if (entry.isDirectory()) {
                    newFile.mkdirs();
                } else {
                    // Create parent directories
                    newFile.getParentFile().mkdirs();
                    
                    // Write file
                    try (java.io.FileOutputStream fos = new java.io.FileOutputStream(newFile)) {
                        byte[] buffer = new byte[8192];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                zis.closeEntry();
            }
        }
    }
}
