package com.devhelper.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;

@RestController
@RequestMapping("/api/jenkins")
@CrossOrigin(originPatterns = "*")
public class JenkinsController {

    // Jenkins credentials - using API token for authentication
    // Remote server: 10.20.3.92:9090, User: admin, API Token: api_local
    private String jenkinsUser = "admin";
    private String jenkinsToken = "11d9858a7c88d79f647f63500d3b45a127";

    /**
     * Check Jenkins server status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@RequestParam String serverUrl) {
        try {
            String url = normalizeUrl(serverUrl) + "/api/json";
            HttpURLConnection conn = createConnection(url);
            
            int responseCode = conn.getResponseCode();
            conn.disconnect();
            
            boolean online = responseCode == 200 || responseCode == 403; // 403 means auth required but server is up
            
            return ResponseEntity.ok(Map.of(
                "online", online,
                "url", serverUrl,
                "responseCode", responseCode
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "online", false,
                "url", serverUrl,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get list of Jenkins views
     */
    @GetMapping("/views")
    public ResponseEntity<?> getViews(@RequestParam String serverUrl) {
        try {
            String url = normalizeUrl(serverUrl) + "/api/json?tree=views[name,url]";
            String response = fetchJson(url);
            
            if (response == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch views"));
            }

            List<Map<String, String>> views = parseViews(response);
            
            return ResponseEntity.ok(Map.of(
                "views", views,
                "count", views.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get list of Jenkins jobs (optionally by view)
     */
    @GetMapping("/jobs")
    public ResponseEntity<?> getJobs(
            @RequestParam String serverUrl,
            @RequestParam(required = false) String viewName) {
        try {
            String url;
            if (viewName != null && !viewName.isEmpty() && !viewName.equals("all")) {
                // Get jobs from specific view
                url = normalizeUrl(serverUrl) + "/view/" + encodeJobName(viewName) + 
                    "/api/json?tree=jobs[name,url,color,lastBuild[number,result,timestamp,duration]]";
            } else {
                // Get all jobs
                url = normalizeUrl(serverUrl) + "/api/json?tree=jobs[name,url,color,lastBuild[number,result,timestamp,duration]]";
            }
            
            String response = fetchJson(url);
            
            if (response == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch jobs"));
            }

            // Parse jobs from JSON (simple parsing without external library)
            List<Map<String, Object>> jobs = parseJobs(response);
            
            return ResponseEntity.ok(Map.of(
                "jobs", jobs,
                "count", jobs.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Trigger a build for a job
     */
    @PostMapping("/build")
    public ResponseEntity<?> triggerBuild(@RequestBody Map<String, String> request) {
        try {
            String serverUrl = request.get("serverUrl");
            String jobName = request.get("jobName");
            
            String url = normalizeUrl(serverUrl) + "/job/" + encodeJobName(jobName) + "/build";
            HttpURLConnection conn = createPostConnection(url, serverUrl);
            
            int responseCode = conn.getResponseCode();
            conn.disconnect();
            
            if (responseCode == 201 || responseCode == 200) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Build triggered for " + jobName
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Failed to trigger build. Response code: " + responseCode
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Stop a running build
     */
    @PostMapping("/stop")
    public ResponseEntity<?> stopBuild(@RequestBody Map<String, Object> request) {
        try {
            String serverUrl = (String) request.get("serverUrl");
            String jobName = (String) request.get("jobName");
            int buildNumber = request.get("buildNumber") != null ? 
                ((Number) request.get("buildNumber")).intValue() : 0;
            
            String url;
            if (buildNumber > 0) {
                // Stop specific build
                url = normalizeUrl(serverUrl) + "/job/" + encodeJobName(jobName) + "/" + buildNumber + "/stop";
            } else {
                // Stop last build
                url = normalizeUrl(serverUrl) + "/job/" + encodeJobName(jobName) + "/lastBuild/stop";
            }
            
            HttpURLConnection conn = createPostConnection(url, serverUrl);
            
            int responseCode = conn.getResponseCode();
            conn.disconnect();
            
            return ResponseEntity.ok(Map.of(
                "success", responseCode == 200 || responseCode == 302,
                "message", "Stop request sent for " + jobName
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Disable a job
     */
    @PostMapping("/disable")
    public ResponseEntity<?> disableJob(@RequestBody Map<String, String> request) {
        try {
            String serverUrl = request.get("serverUrl");
            String jobName = request.get("jobName");
            
            String url = normalizeUrl(serverUrl) + "/job/" + encodeJobName(jobName) + "/disable";
            HttpURLConnection conn = createPostConnection(url, serverUrl);
            
            int responseCode = conn.getResponseCode();
            conn.disconnect();
            
            return ResponseEntity.ok(Map.of(
                "success", responseCode == 200 || responseCode == 302,
                "message", "Job " + jobName + " disabled"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Enable a job
     */
    @PostMapping("/enable")
    public ResponseEntity<?> enableJob(@RequestBody Map<String, String> request) {
        try {
            String serverUrl = request.get("serverUrl");
            String jobName = request.get("jobName");
            
            String url = normalizeUrl(serverUrl) + "/job/" + encodeJobName(jobName) + "/enable";
            HttpURLConnection conn = createPostConnection(url, serverUrl);
            
            int responseCode = conn.getResponseCode();
            conn.disconnect();
            
            return ResponseEntity.ok(Map.of(
                "success", responseCode == 200 || responseCode == 302,
                "message", "Job " + jobName + " enabled"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get build info for a job
     */
    @GetMapping("/job/{jobName}/builds")
    public ResponseEntity<?> getBuilds(@RequestParam String serverUrl, @PathVariable String jobName) {
        try {
            String url = normalizeUrl(serverUrl) + "/job/" + encodeJobName(jobName) + 
                "/api/json?tree=builds[number,result,timestamp,duration,building]";
            String response = fetchJson(url);
            
            if (response == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch builds"));
            }

            List<Map<String, Object>> builds = parseBuilds(response);
            
            return ResponseEntity.ok(Map.of(
                "builds", builds,
                "jobName", jobName
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get console output of a build
     */
    @GetMapping("/job/{jobName}/{buildNumber}/console")
    public ResponseEntity<?> getConsoleOutput(
            @RequestParam String serverUrl,
            @PathVariable String jobName,
            @PathVariable int buildNumber) {
        try {
            String url = normalizeUrl(serverUrl) + "/job/" + encodeJobName(jobName) + 
                "/" + buildNumber + "/consoleText";
            String consoleText = fetchText(url);
            
            return ResponseEntity.ok(Map.of(
                "console", consoleText != null ? consoleText : "",
                "jobName", jobName,
                "buildNumber", buildNumber
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Set Jenkins credentials
     */
    @PostMapping("/credentials")
    public ResponseEntity<?> setCredentials(@RequestBody Map<String, String> request) {
        this.jenkinsUser = request.getOrDefault("username", "admin");
        this.jenkinsToken = request.getOrDefault("token", "");
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Credentials updated"
        ));
    }

    // Helper methods
    private String normalizeUrl(String url) {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "http://" + url;
        }
        if (url.endsWith("/")) {
            url = url.substring(0, url.length() - 1);
        }
        return url;
    }

    private String encodeJobName(String jobName) {
        try {
            return java.net.URLEncoder.encode(jobName, "UTF-8").replace("+", "%20");
        } catch (Exception e) {
            return jobName;
        }
    }

    private HttpURLConnection createConnection(String urlStr) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(10000);
        
        // Add basic auth if token is set
        if (jenkinsToken != null && !jenkinsToken.isEmpty()) {
            String auth = jenkinsUser + ":" + jenkinsToken;
            String encoded = Base64.getEncoder().encodeToString(auth.getBytes());
            conn.setRequestProperty("Authorization", "Basic " + encoded);
        }
        
        return conn;
    }

    /**
     * Create a POST connection with CSRF crumb
     */
    private HttpURLConnection createPostConnection(String urlStr, String serverUrl) throws Exception {
        HttpURLConnection conn = createConnection(urlStr);
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        
        // Get and add CSRF crumb
        String[] crumb = getCrumb(serverUrl);
        if (crumb != null && crumb.length == 2) {
            conn.setRequestProperty(crumb[0], crumb[1]);
        }
        
        return conn;
    }

    /**
     * Fetch CSRF crumb from Jenkins
     */
    private String[] getCrumb(String serverUrl) {
        try {
            String crumbUrl = normalizeUrl(serverUrl) + "/crumbIssuer/api/json";
            HttpURLConnection conn = createConnection(crumbUrl);
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");
            
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
                String crumbField = extractStringValue(json, "crumbRequestField");
                String crumbValue = extractStringValue(json, "crumb");
                
                if (crumbField != null && crumbValue != null) {
                    return new String[]{crumbField, crumbValue};
                }
            }
            conn.disconnect();
        } catch (Exception e) {
            System.out.println("[JenkinsController] Failed to get crumb: " + e.getMessage());
        }
        return null;
    }

    private String fetchJson(String urlStr) {
        try {
            HttpURLConnection conn = createConnection(urlStr);
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");
            
            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                conn.disconnect();
                return response.toString();
            }
            conn.disconnect();
        } catch (Exception e) {
            System.out.println("[JenkinsController] Error fetching: " + e.getMessage());
        }
        return null;
    }

    private String fetchText(String urlStr) {
        try {
            HttpURLConnection conn = createConnection(urlStr);
            conn.setRequestMethod("GET");
            
            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line).append("\n");
                }
                reader.close();
                conn.disconnect();
                return response.toString();
            }
            conn.disconnect();
        } catch (Exception e) {
            System.out.println("[JenkinsController] Error fetching text: " + e.getMessage());
        }
        return null;
    }

    private List<Map<String, String>> parseViews(String json) {
        List<Map<String, String>> views = new ArrayList<>();
        
        int viewsStart = json.indexOf("\"views\":[");
        if (viewsStart < 0) return views;
        
        int arrStart = json.indexOf("[", viewsStart);
        int arrEnd = findMatchingBracket(json, arrStart);
        if (arrEnd < 0) return views;
        
        String viewsArray = json.substring(arrStart + 1, arrEnd);
        
        int pos = 0;
        while (pos < viewsArray.length()) {
            int objStart = viewsArray.indexOf("{", pos);
            if (objStart < 0) break;
            
            int objEnd = findMatchingBrace(viewsArray, objStart);
            if (objEnd < 0) break;
            
            String viewJson = viewsArray.substring(objStart, objEnd + 1);
            String name = extractStringValue(viewJson, "name");
            String url = extractStringValue(viewJson, "url");
            
            if (name != null) {
                Map<String, String> view = new HashMap<>();
                view.put("name", name);
                view.put("url", url);
                views.add(view);
            }
            
            pos = objEnd + 1;
        }
        
        return views;
    }

    private List<Map<String, Object>> parseJobs(String json) {
        List<Map<String, Object>> jobs = new ArrayList<>();
        
        // Simple JSON parsing for jobs array
        int jobsStart = json.indexOf("\"jobs\":[");
        if (jobsStart < 0) return jobs;
        
        int arrStart = json.indexOf("[", jobsStart);
        int arrEnd = findMatchingBracket(json, arrStart);
        if (arrEnd < 0) return jobs;
        
        String jobsArray = json.substring(arrStart + 1, arrEnd);
        
        // Parse each job object
        int pos = 0;
        while (pos < jobsArray.length()) {
            int objStart = jobsArray.indexOf("{", pos);
            if (objStart < 0) break;
            
            int objEnd = findMatchingBrace(jobsArray, objStart);
            if (objEnd < 0) break;
            
            String jobJson = jobsArray.substring(objStart, objEnd + 1);
            Map<String, Object> job = parseJobObject(jobJson);
            if (job != null && job.get("name") != null) {
                jobs.add(job);
            }
            
            pos = objEnd + 1;
        }
        
        return jobs;
    }

    private Map<String, Object> parseJobObject(String json) {
        Map<String, Object> job = new HashMap<>();
        
        job.put("name", extractStringValue(json, "name"));
        job.put("url", extractStringValue(json, "url"));
        job.put("color", extractStringValue(json, "color"));
        
        // Parse lastBuild if exists
        int lastBuildStart = json.indexOf("\"lastBuild\":");
        if (lastBuildStart > 0) {
            int buildObjStart = json.indexOf("{", lastBuildStart);
            if (buildObjStart > 0) {
                int buildObjEnd = findMatchingBrace(json, buildObjStart);
                if (buildObjEnd > 0) {
                    String buildJson = json.substring(buildObjStart, buildObjEnd + 1);
                    Map<String, Object> lastBuild = new HashMap<>();
                    lastBuild.put("number", extractIntValue(buildJson, "number"));
                    lastBuild.put("result", extractStringValue(buildJson, "result"));
                    lastBuild.put("timestamp", extractLongValue(buildJson, "timestamp"));
                    lastBuild.put("duration", extractLongValue(buildJson, "duration"));
                    job.put("lastBuild", lastBuild);
                }
            }
        }
        
        return job;
    }

    private List<Map<String, Object>> parseBuilds(String json) {
        List<Map<String, Object>> builds = new ArrayList<>();
        
        int buildsStart = json.indexOf("\"builds\":[");
        if (buildsStart < 0) return builds;
        
        int arrStart = json.indexOf("[", buildsStart);
        int arrEnd = findMatchingBracket(json, arrStart);
        if (arrEnd < 0) return builds;
        
        String buildsArray = json.substring(arrStart + 1, arrEnd);
        
        int pos = 0;
        while (pos < buildsArray.length()) {
            int objStart = buildsArray.indexOf("{", pos);
            if (objStart < 0) break;
            
            int objEnd = findMatchingBrace(buildsArray, objStart);
            if (objEnd < 0) break;
            
            String buildJson = buildsArray.substring(objStart, objEnd + 1);
            Map<String, Object> build = new HashMap<>();
            build.put("number", extractIntValue(buildJson, "number"));
            build.put("result", extractStringValue(buildJson, "result"));
            build.put("timestamp", extractLongValue(buildJson, "timestamp"));
            build.put("duration", extractLongValue(buildJson, "duration"));
            build.put("building", buildJson.contains("\"building\":true"));
            builds.add(build);
            
            pos = objEnd + 1;
        }
        
        return builds;
    }

    private String extractStringValue(String json, String key) {
        String pattern = "\"" + key + "\":\"";
        int start = json.indexOf(pattern);
        if (start < 0) return null;
        start += pattern.length();
        int end = json.indexOf("\"", start);
        if (end < 0) return null;
        return json.substring(start, end);
    }

    private int extractIntValue(String json, String key) {
        String pattern = "\"" + key + "\":";
        int start = json.indexOf(pattern);
        if (start < 0) return 0;
        start += pattern.length();
        int end = start;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '-')) {
            end++;
        }
        try {
            return Integer.parseInt(json.substring(start, end));
        } catch (Exception e) {
            return 0;
        }
    }

    private long extractLongValue(String json, String key) {
        String pattern = "\"" + key + "\":";
        int start = json.indexOf(pattern);
        if (start < 0) return 0;
        start += pattern.length();
        int end = start;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '-')) {
            end++;
        }
        try {
            return Long.parseLong(json.substring(start, end));
        } catch (Exception e) {
            return 0;
        }
    }

    private int findMatchingBracket(String s, int start) {
        int count = 1;
        for (int i = start + 1; i < s.length(); i++) {
            if (s.charAt(i) == '[') count++;
            else if (s.charAt(i) == ']') count--;
            if (count == 0) return i;
        }
        return -1;
    }

    private int findMatchingBrace(String s, int start) {
        int count = 1;
        for (int i = start + 1; i < s.length(); i++) {
            if (s.charAt(i) == '{') count++;
            else if (s.charAt(i) == '}') count--;
            if (count == 0) return i;
        }
        return -1;
    }
}
