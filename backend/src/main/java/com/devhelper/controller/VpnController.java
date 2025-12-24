package com.devhelper.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/vpn")
@CrossOrigin(originPatterns = "*")
public class VpnController {

    // Default path to Cisco AnyConnect CLI
    private static final String VPNCLI_PATH = "C:\\Program Files (x86)\\Cisco\\Cisco AnyConnect Secure Mobility Client\\vpncli.exe";
    
    // Stored credentials (can be set via API)
    private String vpnServer = "";
    private String vpnUsername = "";
    private String vpnPassword = "";
    private String vpnGroup = ""; // Optional group selection
    
    /**
     * Check VPN connection status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        try {
            ProcessBuilder pb = new ProcessBuilder(VPNCLI_PATH, "state");
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            process.waitFor(10, TimeUnit.SECONDS);
            String result = output.toString();
            
            boolean connected = result.contains("Connected") && !result.contains("Disconnected");
            String state = "Disconnected";
            
            if (result.contains("state: Connected")) {
                state = "Connected";
            } else if (result.contains("state: Connecting")) {
                state = "Connecting";
            } else if (result.contains("state: Disconnecting")) {
                state = "Disconnecting";
            }
            
            return ResponseEntity.ok(Map.of(
                "connected", connected,
                "state", state,
                "details", result.trim()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "connected", false,
                "state", "Unknown",
                "error", e.getMessage()
            ));
        }
    }
    
    /**
     * Connect to VPN
     */
    @PostMapping("/connect")
    public ResponseEntity<?> connect(@RequestBody Map<String, String> request) {
        try {
            String server = request.getOrDefault("server", vpnServer);
            String username = request.getOrDefault("username", vpnUsername);
            String password = request.getOrDefault("password", vpnPassword);
            String group = request.getOrDefault("group", vpnGroup);
            String pushMethod = request.getOrDefault("pushMethod", "push"); // push, phone, sms, or passcode
            
            if (server.isEmpty() || username.isEmpty() || password.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Server, username and password are required"
                ));
            }
            
            // Build the connect command
            ProcessBuilder pb = new ProcessBuilder(VPNCLI_PATH, "-s", "connect", server);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // Get input/output streams
            OutputStream stdin = process.getOutputStream();
            BufferedReader stdout = new BufferedReader(new InputStreamReader(process.getInputStream()));
            
            // Read initial prompts and respond
            StringBuilder output = new StringBuilder();
            String line;
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(stdin));
            
            // Wait a bit for the process to start
            Thread.sleep(500);
            
            // Handle group selection if prompted
            if (!group.isEmpty()) {
                writer.write(group + "\n");
                writer.flush();
                Thread.sleep(300);
            }
            
            // Send username
            writer.write(username + "\n");
            writer.flush();
            Thread.sleep(300);
            
            // Send password
            writer.write(password + "\n");
            writer.flush();
            Thread.sleep(300);
            
            // Send Duo push method (push, phone, sms, or passcode)
            writer.write(pushMethod + "\n");
            writer.flush();
            
            // Wait for connection with timeout
            boolean completed = process.waitFor(30, TimeUnit.SECONDS);
            
            // Read remaining output
            while (stdout.ready() && (line = stdout.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            String result = output.toString();
            boolean success = result.contains("state: Connected") || 
                            result.contains("VPN session established") ||
                            !result.contains("error") && !result.contains("failed");
            
            return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "VPN connection initiated" : "Connection may have failed",
                "output", result.trim()
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Disconnect from VPN
     */
    @PostMapping("/disconnect")
    public ResponseEntity<?> disconnect() {
        try {
            ProcessBuilder pb = new ProcessBuilder(VPNCLI_PATH, "disconnect");
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            process.waitFor(10, TimeUnit.SECONDS);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Disconnect command sent",
                "output", output.toString().trim()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Save VPN credentials for quick connect
     */
    @PostMapping("/credentials")
    public ResponseEntity<?> saveCredentials(@RequestBody Map<String, String> request) {
        vpnServer = request.getOrDefault("server", "");
        vpnUsername = request.getOrDefault("username", "");
        vpnPassword = request.getOrDefault("password", "");
        vpnGroup = request.getOrDefault("group", "");
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Credentials saved"
        ));
    }
    
    /**
     * Get saved credentials (without password)
     */
    @GetMapping("/credentials")
    public ResponseEntity<?> getCredentials() {
        return ResponseEntity.ok(Map.of(
            "server", vpnServer,
            "username", vpnUsername,
            "group", vpnGroup,
            "hasPassword", !vpnPassword.isEmpty()
        ));
    }
}
