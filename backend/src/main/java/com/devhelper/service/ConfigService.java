package com.devhelper.service;

import org.springframework.stereotype.Service;

import com.devhelper.dto.ConfigResultDTO;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ConfigService {

    // Pattern to match jdbc.url=jdbc:oracle:thin:@IP:port:database
    // Example: jdbc.url=jdbc:oracle:thin:@192.168.84.55:1521:xifin
    private static final Pattern JDBC_URL_PATTERN = Pattern.compile(
        "(jdbc\\.url\\s*=\\s*jdbc:oracle:thin:@)(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(:\\d+:.+)"
    );
    
    // Pattern to match jdbc:oracle:thin:@IP:port (more general, in case it's inside XML or other files)
    private static final Pattern JDBC_ORACLE_PATTERN = Pattern.compile(
        "(jdbc:oracle:thin:@)(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(:\\d+)"
    );

    // XML parameter patterns
    // <parameter name="hub" value="http://xifin-qa013.mba.xifin.com:" />
    private static final Pattern HUB_PATTERN = Pattern.compile(
        "(<parameter\\s+name=\"hub\"\\s+value=\")([^\"]+)(\"\\s*/?>)"
    );
    
    // <parameter name="ssoXpUsername" value="..." />
    private static final Pattern SSO_XP_USERNAME_PATTERN = Pattern.compile(
        "(<parameter\\s+name=\"ssoXpUsername\"\\s+value=\")([^\"]+)(\"\\s*/?>)"
    );
    
    // <parameter name="ssoXpPassword" value="..." />
    private static final Pattern SSO_XP_PASSWORD_PATTERN = Pattern.compile(
        "(<parameter\\s+name=\"ssoXpPassword\"\\s+value=\")([^\"]+)(\"\\s*/?>)"
    );
    
    // <parameter name="ssoUsername" value="..." />
    private static final Pattern SSO_USERNAME_PATTERN = Pattern.compile(
        "(<parameter\\s+name=\"ssoUsername\"\\s+value=\")([^\"]+)(\"\\s*/?>)"
    );
    
    // <parameter name="ssoPassword" value="..." />
    private static final Pattern SSO_PASSWORD_PATTERN = Pattern.compile(
        "(<parameter\\s+name=\"ssoPassword\"\\s+value=\")([^\"]+)(\"\\s*/?>)"
    );
    
    // <parameter name="email" value="..." />
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "(<parameter\\s+name=\"email\"\\s+value=\")([^\"]+)(\"\\s*/?>)"
    );
    
    // <parameter name="password" value="..." /> (generic password parameter)
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "(<parameter\\s+name=\"password\"\\s+value=\")([^\"]+)(\"\\s*/?>)"
    );
    
    // <parameter name="orgAlias" value="..." />
    private static final Pattern ORG_ALIAS_PATTERN = Pattern.compile(
        "(<parameter\\s+name=\"orgAlias\"\\s+value=\")([^\"]+)(\"\\s*/?>)"
    );

    /**
     * Replace database IP only in properties files (for all Maven projects)
     * Scans multiple directories: src/main/resources and src/main/config/dev
     */
    public int replaceDatabaseOnly(String projectPath, String newDatabaseIp) throws IOException {
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !projectDir.isDirectory()) {
            throw new IOException("Project directory not found: " + projectPath);
        }

        System.out.println("[ConfigService] Starting database replacement in: " + projectPath);
        System.out.println("[ConfigService] New database IP: " + newDatabaseIp);

        int[] filesUpdated = {0};
        int[] filesScanned = {0};

        // List of directories to scan
        String[] directoriesToScan = {
            "src/main/resources",
            "src/main/config/dev",
            "src/main/config",
            "src\\main\\resources",
            "src\\main\\config\\dev",
            "src\\main\\config"
        };

        for (String dirPath : directoriesToScan) {
            File dir = new File(projectDir, dirPath);
            if (dir.exists() && dir.isDirectory()) {
                System.out.println("[ConfigService] Scanning directory: " + dir.getAbsolutePath());
                scanAndReplaceDatabaseOnly(dir, newDatabaseIp, filesUpdated, filesScanned);
            }
        }

        System.out.println("[ConfigService] Total files scanned: " + filesScanned[0]);
        System.out.println("[ConfigService] Total files updated: " + filesUpdated[0]);

        return filesUpdated[0];
    }

    /**
     * Replace database IP only - returns detailed result with file list
     */
    public ConfigResultDTO replaceDatabaseOnlyWithDetails(String projectPath, String newDatabaseIp) throws IOException {
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !projectDir.isDirectory()) {
            throw new IOException("Project directory not found: " + projectPath);
        }

        System.out.println("[ConfigService] Starting database replacement in: " + projectPath);
        System.out.println("[ConfigService] New database IP: " + newDatabaseIp);

        List<String> updatedFiles = new ArrayList<>();

        String[] directoriesToScan = {
            "src/main/resources",
            "src/main/config/dev",
            "src/main/config",
            "src\\main\\resources",
            "src\\main\\config\\dev",
            "src\\main\\config"
        };

        for (String dirPath : directoriesToScan) {
            File dir = new File(projectDir, dirPath);
            if (dir.exists() && dir.isDirectory()) {
                scanAndReplaceDatabaseOnlyWithDetails(dir, newDatabaseIp, updatedFiles);
            }
        }

        System.out.println("[ConfigService] Total files updated: " + updatedFiles.size());

        return new ConfigResultDTO(true, updatedFiles.size(), "Database IP replaced successfully", updatedFiles);
    }

    /**
     * Scan and replace database in files, collecting file paths
     */
    private void scanAndReplaceDatabaseOnlyWithDetails(File dir, String newDatabaseIp, List<String> updatedFiles) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                String name = file.getName();
                if (name.equals("target") || name.equals("node_modules") || name.equals(".git") || name.equals(".idea")) {
                    continue;
                }
                scanAndReplaceDatabaseOnlyWithDetails(file, newDatabaseIp, updatedFiles);
            } else if (file.getName().toLowerCase().endsWith(".properties")) {
                if (replaceDatabaseInFile(file, newDatabaseIp)) {
                    updatedFiles.add(file.getAbsolutePath());
                }
            }
        }
    }

    /**
     * Replace test suite config - returns detailed result with file list
     */
    public ConfigResultDTO replaceTestSuiteConfigWithDetails(String projectPath, String hub, 
                                      String ssoUsername, String ssoPassword, String orgAlias) throws IOException {
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !projectDir.isDirectory()) {
            throw new IOException("Project directory not found: " + projectPath);
        }

        System.out.println("[ConfigService] Starting test suite replacement in: " + projectPath);

        List<String> updatedFiles = new ArrayList<>();
        
        String userId = "";
        if (ssoUsername != null && ssoUsername.contains("_")) {
            userId = ssoUsername.substring(ssoUsername.lastIndexOf("_") + 1);
        } else if (ssoUsername != null) {
            userId = ssoUsername;
        }
        
        Map<String, String> config = Map.of(
            "hub", hub != null ? hub : "",
            "ssoUsername", ssoUsername != null ? ssoUsername : "",
            "ssoPassword", ssoPassword != null ? ssoPassword : "",
            "orgAlias", orgAlias != null ? orgAlias : "",
            "userId", userId
        );

        // XML directories
        String[] xmlDirectoriesToScan = {
            "src/test/resources/newXp",
            "src/test/resources/pfEngines",
            "src\\test\\resources\\newXp",
            "src\\test\\resources\\pfEngines"
        };

        for (String dirPath : xmlDirectoriesToScan) {
            File dir = new File(projectDir, dirPath);
            if (dir.exists() && dir.isDirectory()) {
                scanAndReplaceTestSuiteOnlyWithDetails(dir, config, updatedFiles);
            }
        }

        // Java directories
        String[] javaDirectoriesToScan = {
            "src/test/java/com/newXp",
            "src/test/java/com/pfEngines",
            "src\\test\\java\\com\\newXp",
            "src\\test\\java\\com\\pfEngines"
        };

        for (String dirPath : javaDirectoriesToScan) {
            File dir = new File(projectDir, dirPath);
            if (dir.exists() && dir.isDirectory()) {
                scanAndReplaceJavaFilesWithDetails(dir, userId, updatedFiles);
            }
        }

        System.out.println("[ConfigService] Total files updated: " + updatedFiles.size());

        return new ConfigResultDTO(true, updatedFiles.size(), "Test suite configuration replaced successfully", updatedFiles);
    }

    private void scanAndReplaceTestSuiteOnlyWithDetails(File dir, Map<String, String> config, List<String> updatedFiles) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                String name = file.getName();
                if (name.equals("target") || name.equals("node_modules") || name.equals(".git") || name.equals(".idea")) {
                    continue;
                }
                scanAndReplaceTestSuiteOnlyWithDetails(file, config, updatedFiles);
            } else if (file.getName().toLowerCase().endsWith(".xml")) {
                if (replaceTestSuiteInFile(file, config)) {
                    updatedFiles.add(file.getAbsolutePath());
                }
            }
        }
    }

    private void scanAndReplaceJavaFilesWithDetails(File dir, String userId, List<String> updatedFiles) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                String name = file.getName();
                if (name.equals("target") || name.equals("node_modules") || name.equals(".git") || name.equals(".idea")) {
                    continue;
                }
                scanAndReplaceJavaFilesWithDetails(file, userId, updatedFiles);
            } else if (file.getName().toLowerCase().endsWith(".java")) {
                if (replaceSubstringInJavaFile(file, userId)) {
                    updatedFiles.add(file.getAbsolutePath());
                }
            }
        }
    }
    /**
     * Replace XML test suite configurations only (hub, sso credentials, orgAlias)
     * For qa-rpmoverall project - scans xifinportal (newXp) and engines (pfEngines) test suites
     * XML Directories: src/test/resources/newXp and src/test/resources/pfEngines
     * Java Directories: src/test/java/com/newXp and src/test/java/com/pfEngines
     */
    public int replaceTestSuiteConfig(String projectPath, String hub, 
                                      String ssoUsername, String ssoPassword, String orgAlias) throws IOException {
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !projectDir.isDirectory()) {
            throw new IOException("Project directory not found: " + projectPath);
        }

        System.out.println("[ConfigService] Starting test suite replacement in: " + projectPath);

        int[] filesUpdated = {0};
        int[] filesScanned = {0};
        
        // Extract userId from ssoUsername (e.g., "webservicetest_chava" -> "chava")
        String userId = "";
        if (ssoUsername != null && ssoUsername.contains("_")) {
            userId = ssoUsername.substring(ssoUsername.lastIndexOf("_") + 1);
        } else if (ssoUsername != null) {
            userId = ssoUsername;
        }
        
        Map<String, String> config = Map.of(
            "hub", hub != null ? hub : "",
            "ssoUsername", ssoUsername != null ? ssoUsername : "",
            "ssoPassword", ssoPassword != null ? ssoPassword : "",
            "orgAlias", orgAlias != null ? orgAlias : "",
            "userId", userId
        );

        // List of directories to scan for XML test suites
        String[] xmlDirectoriesToScan = {
            "src/test/resources/newXp",
            "src/test/resources/pfEngines",
            "src\\test\\resources\\newXp",
            "src\\test\\resources\\pfEngines"
        };

        for (String dirPath : xmlDirectoriesToScan) {
            File dir = new File(projectDir, dirPath);
            if (dir.exists() && dir.isDirectory()) {
                System.out.println("[ConfigService] Scanning XML test suite directory: " + dir.getAbsolutePath());
                scanAndReplaceTestSuiteOnly(dir, config, filesUpdated, filesScanned);
            }
        }

        System.out.println("[ConfigService] Total XML files scanned: " + filesScanned[0]);
        System.out.println("[ConfigService] Total XML files updated: " + filesUpdated[0]);

        // List of directories to scan for Java test files
        int[] javaFilesUpdated = {0};
        int[] javaFilesScanned = {0};
        
        String[] javaDirectoriesToScan = {
            "src/test/java/com/newXp",
            "src/test/java/com/pfEngines",
            "src\\test\\java\\com\\newXp",
            "src\\test\\java\\com\\pfEngines"
        };

        for (String dirPath : javaDirectoriesToScan) {
            File dir = new File(projectDir, dirPath);
            if (dir.exists() && dir.isDirectory()) {
                System.out.println("[ConfigService] Scanning Java test directory: " + dir.getAbsolutePath());
                scanAndReplaceJavaFiles(dir, userId, javaFilesUpdated, javaFilesScanned);
            }
        }

        System.out.println("[ConfigService] Total Java files scanned: " + javaFilesScanned[0]);
        System.out.println("[ConfigService] Total Java files updated: " + javaFilesUpdated[0]);

        return filesUpdated[0] + javaFilesUpdated[0];
    }

    /**
     * Replace database IP in all properties and xml files in src/main/resources (legacy)
     */
    public int replaceDatabaseIp(String projectPath, String newDatabaseIp) throws IOException {
        return replaceConfig(projectPath, newDatabaseIp, null, null, null, null);
    }

    /**
     * Replace all configurations including database IP, hub, credentials, and orgAlias
     */
    public int replaceConfig(String projectPath, String databaseIp, String hub, 
                            String ssoUsername, String ssoPassword, String orgAlias) throws IOException {
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !projectDir.isDirectory()) {
            throw new IOException("Project directory not found: " + projectPath);
        }

        // Only scan src/main/resources folder
        File resourcesDir = new File(projectDir, "src/main/resources");
        if (!resourcesDir.exists() || !resourcesDir.isDirectory()) {
            // Try backslash for Windows
            resourcesDir = new File(projectDir, "src\\main\\resources");
        }
        
        if (!resourcesDir.exists() || !resourcesDir.isDirectory()) {
            System.out.println("No src/main/resources folder found in: " + projectPath);
            return 0;
        }

        int[] filesUpdated = {0};
        
        // Create config map
        Map<String, String> config = Map.of(
            "databaseIp", databaseIp != null ? databaseIp : "",
            "hub", hub != null ? hub : "",
            "ssoUsername", ssoUsername != null ? ssoUsername : "",
            "ssoPassword", ssoPassword != null ? ssoPassword : "",
            "orgAlias", orgAlias != null ? orgAlias : ""
        );
        
        // Scan for properties and xml files in resources folder
        scanAndReplaceConfig(resourcesDir, config, filesUpdated);
        
        return filesUpdated[0];
    }

    private void scanAndReplaceConfig(File dir, Map<String, String> config, int[] filesUpdated) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                // Skip common non-source directories
                String name = file.getName();
                if (name.equals("target") || name.equals("node_modules") || name.equals(".git") || name.equals(".idea")) {
                    continue;
                }
                scanAndReplaceConfig(file, config, filesUpdated);
            } else if (isConfigFile(file)) {
                if (replaceInFileWithConfig(file, config)) {
                    filesUpdated[0]++;
                }
            }
        }
    }

    private void scanAndReplace(File dir, String newDatabaseIp, int[] filesUpdated) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                // Skip common non-source directories
                String name = file.getName();
                if (name.equals("target") || name.equals("node_modules") || name.equals(".git") || name.equals(".idea")) {
                    continue;
                }
                scanAndReplace(file, newDatabaseIp, filesUpdated);
            } else if (isConfigFile(file)) {
                if (replaceInFile(file, newDatabaseIp)) {
                    filesUpdated[0]++;
                }
            }
        }
    }

    private void scanAndReplaceDatabaseOnly(File dir, String newDatabaseIp, int[] filesUpdated, int[] filesScanned) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                String name = file.getName();
                if (name.equals("target") || name.equals("node_modules") || name.equals(".git") || name.equals(".idea")) {
                    continue;
                }
                scanAndReplaceDatabaseOnly(file, newDatabaseIp, filesUpdated, filesScanned);
            } else if (file.getName().toLowerCase().endsWith(".properties")) {
                // Only process .properties files for database replacement
                filesScanned[0]++;
                System.out.println("[ConfigService] Scanning file: " + file.getAbsolutePath());
                if (replaceDatabaseInFile(file, newDatabaseIp)) {
                    filesUpdated[0]++;
                }
            }
        }
    }

    private void scanAndReplaceTestSuiteOnly(File dir, Map<String, String> config, int[] filesUpdated, int[] filesScanned) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                String name = file.getName();
                if (name.equals("target") || name.equals("node_modules") || name.equals(".git") || name.equals(".idea")) {
                    continue;
                }
                scanAndReplaceTestSuiteOnly(file, config, filesUpdated, filesScanned);
            } else if (file.getName().toLowerCase().endsWith(".xml")) {
                // Only process .xml files for test suite replacement
                filesScanned[0]++;
                System.out.println("[ConfigService] Scanning XML file: " + file.getAbsolutePath());
                if (replaceTestSuiteInFile(file, config)) {
                    filesUpdated[0]++;
                }
            }
        }
    }

    /**
     * Scan and replace .substring(0 patterns in Java test files
     */
    private void scanAndReplaceJavaFiles(File dir, String userId, int[] filesUpdated, int[] filesScanned) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                String name = file.getName();
                if (name.equals("target") || name.equals("node_modules") || name.equals(".git") || name.equals(".idea")) {
                    continue;
                }
                scanAndReplaceJavaFiles(file, userId, filesUpdated, filesScanned);
            } else if (file.getName().toLowerCase().endsWith(".java")) {
                filesScanned[0]++;
                System.out.println("[ConfigService] Scanning Java file: " + file.getAbsolutePath());
                if (replaceSubstringInJavaFile(file, userId)) {
                    filesUpdated[0]++;
                }
            }
        }
    }

    /**
     * Replace lines containing .substring(0 with userId value
     * Example: userName = "x" + ssoXpUsername.substring(0, ssoXpUsername.indexOf("@")); -> userName = "userId";
     */
    private boolean replaceSubstringInJavaFile(File file, String userId) throws IOException {
        Path path = file.toPath();
        String content = Files.readString(path, StandardCharsets.UTF_8);
        String originalContent = content;

        // Pattern to match: variableName = anything.substring(0, ...);
        // Captures: variableName = [any expression containing .substring(0];
        // Replaces with: variableName = "userId";
        Pattern substringPattern = Pattern.compile(
            "(\\w+\\s*=\\s*)[^;]*\\.substring\\s*\\(\\s*0[^;]*;",
            Pattern.MULTILINE
        );
        
        Matcher matcher = substringPattern.matcher(content);
        StringBuffer sb = new StringBuffer();
        boolean found = false;
        
        while (matcher.find()) {
            found = true;
            String varAssignment = matcher.group(1); // e.g., "userName = "
            String replacement = varAssignment + "\"" + userId + "\";";
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
            System.out.println("[ConfigService] Replacing substring pattern in: " + file.getName());
        }
        matcher.appendTail(sb);
        
        if (found) {
            content = sb.toString();
        }

        if (!content.equals(originalContent)) {
            Files.writeString(path, content, StandardCharsets.UTF_8);
            System.out.println("[ConfigService] Updated Java file: " + file.getAbsolutePath());
            return true;
        }
        return false;
    }

    private boolean isConfigFile(File file) {
        String name = file.getName().toLowerCase();
        return name.endsWith(".properties") || 
               name.endsWith(".xml") || 
               name.endsWith(".yml") || 
               name.endsWith(".yaml");
    }

    private boolean replaceDatabaseInFile(File file, String newDatabaseIp) throws IOException {
        Path path = file.toPath();
        String content = Files.readString(path, StandardCharsets.UTF_8);
        String originalContent = content;

        // Pattern 1: jdbc.url=jdbc:oracle:thin:@IP:port:database
        Matcher jdbcUrlMatcher = JDBC_URL_PATTERN.matcher(content);
        content = jdbcUrlMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp) + "$3");

        // Pattern 2: jdbc:oracle:thin:@IP:port
        Matcher jdbcMatcher = JDBC_ORACLE_PATTERN.matcher(content);
        content = jdbcMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp) + "$3");

        // Pattern 3: db.host=IP or database.host=IP or oracle.host=IP
        Pattern dbHostPattern = Pattern.compile(
            "((?:db|database|oracle|jdbc)\\.host\\s*=\\s*)(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})"
        );
        Matcher dbHostMatcher = dbHostPattern.matcher(content);
        content = dbHostMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp));

        // Pattern 4: db.server=IP or database.server=IP
        Pattern dbServerPattern = Pattern.compile(
            "((?:db|database|oracle|jdbc)\\.server\\s*=\\s*)(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})"
        );
        Matcher dbServerMatcher = dbServerPattern.matcher(content);
        content = dbServerMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp));

        // Pattern 5: db.ip=IP or database.ip=IP
        Pattern dbIpPattern = Pattern.compile(
            "((?:db|database|oracle|jdbc)\\.ip\\s*=\\s*)(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})"
        );
        Matcher dbIpMatcher = dbIpPattern.matcher(content);
        content = dbIpMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp));

        // Pattern 6: spring.datasource.url=jdbc:oracle:thin:@IP:port
        Pattern springDatasourcePattern = Pattern.compile(
            "(spring\\.datasource\\.url\\s*=\\s*jdbc:oracle:thin:@)(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(:\\d+)"
        );
        Matcher springMatcher = springDatasourcePattern.matcher(content);
        content = springMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp) + "$3");

        // Pattern 7: hibernate.connection.url=jdbc:oracle:thin:@IP:port
        Pattern hibernatePattern = Pattern.compile(
            "(hibernate\\.connection\\.url\\s*=\\s*jdbc:oracle:thin:@)(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(:\\d+)"
        );
        Matcher hibernateMatcher = hibernatePattern.matcher(content);
        content = hibernateMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp) + "$3");

        // Pattern 8: Any 192.168.x.x IP address (as fallback for common internal IPs)
        Pattern genericIpPattern = Pattern.compile(
            "(192\\.168\\.\\d{1,3}\\.\\d{1,3})"
        );
        Matcher genericMatcher = genericIpPattern.matcher(content);
        content = genericMatcher.replaceAll(Matcher.quoteReplacement(newDatabaseIp));

        if (!content.equals(originalContent)) {
            Files.writeString(path, content, StandardCharsets.UTF_8);
            System.out.println("[ConfigService] Updated database in: " + file.getAbsolutePath());
            return true;
        } else {
            System.out.println("[ConfigService] No pattern matched in: " + file.getAbsolutePath());
        }
        return false;
    }

    private boolean replaceTestSuiteInFile(File file, Map<String, String> config) throws IOException {
        Path path = file.toPath();
        String content = Files.readString(path, StandardCharsets.UTF_8);
        String originalContent = content;

        String hub = config.get("hub");
        String ssoUsername = config.get("ssoUsername");
        String ssoPassword = config.get("ssoPassword");
        String orgAlias = config.get("orgAlias");

        // Replace hub URL
        if (hub != null && !hub.isEmpty()) {
            Matcher hubMatcher = HUB_PATTERN.matcher(content);
            content = hubMatcher.replaceAll("$1" + Matcher.quoteReplacement(hub) + "$3");
        }

        // Replace all username/email patterns
        if (ssoUsername != null && !ssoUsername.isEmpty()) {
            Matcher ssoXpUserMatcher = SSO_XP_USERNAME_PATTERN.matcher(content);
            content = ssoXpUserMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoUsername) + "$3");
            
            Matcher ssoUserMatcher = SSO_USERNAME_PATTERN.matcher(content);
            content = ssoUserMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoUsername) + "$3");
            
            Matcher emailMatcher = EMAIL_PATTERN.matcher(content);
            content = emailMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoUsername) + "$3");
        }

        // Replace all password patterns
        if (ssoPassword != null && !ssoPassword.isEmpty()) {
            Matcher ssoXpPassMatcher = SSO_XP_PASSWORD_PATTERN.matcher(content);
            content = ssoXpPassMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoPassword) + "$3");
            
            Matcher ssoPassMatcher = SSO_PASSWORD_PATTERN.matcher(content);
            content = ssoPassMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoPassword) + "$3");
            
            Matcher passMatcher = PASSWORD_PATTERN.matcher(content);
            content = passMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoPassword) + "$3");
        }

        // Replace or add orgAlias
        if (orgAlias != null && !orgAlias.isEmpty()) {
            Matcher orgMatcher = ORG_ALIAS_PATTERN.matcher(content);
            if (orgMatcher.find()) {
                content = orgMatcher.replaceAll("$1" + Matcher.quoteReplacement(orgAlias) + "$3");
            } else if (content.contains("<parameter name=\"ssoXpPassword\"") || 
                       content.contains("<parameter name=\"ssoPassword\"") ||
                       content.contains("<parameter name=\"password\"")) {
                String orgAliasLine = "\n\t<parameter name=\"orgAlias\" value=\"" + orgAlias + "\" />";
                
                if (content.contains("<parameter name=\"ssoXpPassword\"")) {
                    content = content.replaceFirst(
                        "(<parameter\\s+name=\"ssoXpPassword\"\\s+value=\"[^\"]+\"\\s*/?>)",
                        "$1" + Matcher.quoteReplacement(orgAliasLine)
                    );
                } else if (content.contains("<parameter name=\"ssoPassword\"")) {
                    content = content.replaceFirst(
                        "(<parameter\\s+name=\"ssoPassword\"\\s+value=\"[^\"]+\"\\s*/?>)",
                        "$1" + Matcher.quoteReplacement(orgAliasLine)
                    );
                } else if (content.contains("<parameter name=\"password\"")) {
                    content = content.replaceFirst(
                        "(<parameter\\s+name=\"password\"\\s+value=\"[^\"]+\"\\s*/?>)",
                        "$1" + Matcher.quoteReplacement(orgAliasLine)
                    );
                }
            }
        }

        // Change thread-count to 1 for single-threaded execution
        // Matches: thread-count="X" where X is any number
        Pattern threadCountPattern = Pattern.compile(
            "(thread-count\\s*=\\s*[\"'])\\d+([\"'])"
        );
        Matcher threadMatcher = threadCountPattern.matcher(content);
        if (threadMatcher.find()) {
            String currentValue = content.substring(threadMatcher.start(), threadMatcher.end());
            if (!currentValue.contains("\"1\"") && !currentValue.contains("'1'")) {
                content = threadMatcher.replaceAll("$1" + "1" + "$2");
                System.out.println("[ConfigService] Changed thread-count to 1 in: " + file.getAbsolutePath());
            }
        }

        // Comment out RetryListener block if not already commented
        // Pattern matches: <listeners>...<listener class-name='com.xifin.utils.RetryListener'/>...</listeners>
        // Handle both single-line and multi-line formats
        Pattern retryListenerPattern = Pattern.compile(
            "(<listeners>\\s*<listener\\s+class-name=['\"]com\\.xifin\\.utils\\.RetryListener['\"]\\s*/>\\s*</listeners>)",
            Pattern.DOTALL
        );
        Matcher retryMatcher = retryListenerPattern.matcher(content);
        if (retryMatcher.find()) {
            // Only comment if not already commented
            String match = retryMatcher.group(1);
            if (!content.contains("<!--" + match) && !content.contains("<!-- " + match)) {
                content = retryMatcher.replaceAll("<!-- $1 -->");
                System.out.println("[ConfigService] Commented out RetryListener in: " + file.getAbsolutePath());
            }
        }

        // Also handle the multi-line format with newlines and tabs
        Pattern retryListenerMultilinePattern = Pattern.compile(
            "(<listeners>\\s*\\n?\\s*<listener\\s+class-name=['\"]com\\.xifin\\.utils\\.RetryListener['\"]\\s*/>\\s*\\n?\\s*</listeners>)",
            Pattern.DOTALL
        );
        Matcher retryMultiMatcher = retryListenerMultilinePattern.matcher(content);
        if (retryMultiMatcher.find()) {
            String match = retryMultiMatcher.group(1);
            if (!content.contains("<!--") || !content.substring(content.indexOf("<!--")).contains(match)) {
                // Check if this specific block is already commented
                int matchStart = content.indexOf(match);
                if (matchStart > 0) {
                    String beforeMatch = content.substring(Math.max(0, matchStart - 10), matchStart);
                    if (!beforeMatch.contains("<!--")) {
                        content = content.replace(match, "<!--\n\t" + match + "\n\t-->");
                        System.out.println("[ConfigService] Commented out RetryListener (multiline) in: " + file.getAbsolutePath());
                    }
                }
            }
        }

        if (!content.equals(originalContent)) {
            Files.writeString(path, content, StandardCharsets.UTF_8);
            System.out.println("[ConfigService] Updated test suite in: " + file.getAbsolutePath());
            return true;
        }
        return false;
    }

    private boolean replaceInFileWithConfig(File file, Map<String, String> config) throws IOException {
        Path path = file.toPath();
        String content = Files.readString(path, StandardCharsets.UTF_8);
        String originalContent = content;

        String databaseIp = config.get("databaseIp");
        String hub = config.get("hub");
        String ssoUsername = config.get("ssoUsername");
        String ssoPassword = config.get("ssoPassword");
        String orgAlias = config.get("orgAlias");

        // Replace database IP patterns
        if (databaseIp != null && !databaseIp.isEmpty()) {
            Matcher jdbcUrlMatcher = JDBC_URL_PATTERN.matcher(content);
            content = jdbcUrlMatcher.replaceAll("$1" + Matcher.quoteReplacement(databaseIp) + "$3");

            Matcher jdbcMatcher = JDBC_ORACLE_PATTERN.matcher(content);
            content = jdbcMatcher.replaceAll("$1" + Matcher.quoteReplacement(databaseIp) + "$3");
        }

        // Replace hub URL
        if (hub != null && !hub.isEmpty()) {
            Matcher hubMatcher = HUB_PATTERN.matcher(content);
            content = hubMatcher.replaceAll("$1" + Matcher.quoteReplacement(hub) + "$3");
        }

        // Replace all username/email patterns with ssoUsername value
        if (ssoUsername != null && !ssoUsername.isEmpty()) {
            // ssoXpUsername
            Matcher ssoXpUserMatcher = SSO_XP_USERNAME_PATTERN.matcher(content);
            content = ssoXpUserMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoUsername) + "$3");
            
            // ssoUsername
            Matcher ssoUserMatcher = SSO_USERNAME_PATTERN.matcher(content);
            content = ssoUserMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoUsername) + "$3");
            
            // email
            Matcher emailMatcher = EMAIL_PATTERN.matcher(content);
            content = emailMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoUsername) + "$3");
        }

        // Replace all password patterns with ssoPassword value
        if (ssoPassword != null && !ssoPassword.isEmpty()) {
            // ssoXpPassword
            Matcher ssoXpPassMatcher = SSO_XP_PASSWORD_PATTERN.matcher(content);
            content = ssoXpPassMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoPassword) + "$3");
            
            // ssoPassword
            Matcher ssoPassMatcher = SSO_PASSWORD_PATTERN.matcher(content);
            content = ssoPassMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoPassword) + "$3");
            
            // password (generic)
            Matcher passMatcher = PASSWORD_PATTERN.matcher(content);
            content = passMatcher.replaceAll("$1" + Matcher.quoteReplacement(ssoPassword) + "$3");
        }

        // Replace or add orgAlias
        if (orgAlias != null && !orgAlias.isEmpty()) {
            Matcher orgMatcher = ORG_ALIAS_PATTERN.matcher(content);
            if (orgMatcher.find()) {
                // Replace existing orgAlias
                content = orgMatcher.replaceAll("$1" + Matcher.quoteReplacement(orgAlias) + "$3");
            } else if (content.contains("<parameter name=\"ssoXpPassword\"") || 
                       content.contains("<parameter name=\"ssoPassword\"") ||
                       content.contains("<parameter name=\"password\"")) {
                // Add orgAlias after password parameter if not exists
                String orgAliasLine = "\n\t<parameter name=\"orgAlias\" value=\"" + orgAlias + "\" />";
                
                // Try different password patterns
                if (content.contains("<parameter name=\"ssoXpPassword\"")) {
                    content = content.replaceFirst(
                        "(<parameter\\s+name=\"ssoXpPassword\"\\s+value=\"[^\"]+\"\\s*/?>)",
                        "$1" + Matcher.quoteReplacement(orgAliasLine)
                    );
                } else if (content.contains("<parameter name=\"ssoPassword\"")) {
                    content = content.replaceFirst(
                        "(<parameter\\s+name=\"ssoPassword\"\\s+value=\"[^\"]+\"\\s*/?>)",
                        "$1" + Matcher.quoteReplacement(orgAliasLine)
                    );
                } else if (content.contains("<parameter name=\"password\"")) {
                    content = content.replaceFirst(
                        "(<parameter\\s+name=\"password\"\\s+value=\"[^\"]+\"\\s*/?>)",
                        "$1" + Matcher.quoteReplacement(orgAliasLine)
                    );
                }
            }
        }

        // Check if content changed
        if (!content.equals(originalContent)) {
            Files.writeString(path, content, StandardCharsets.UTF_8);
            System.out.println("Updated: " + file.getAbsolutePath());
            return true;
        }

        return false;
    }

    private boolean replaceInFile(File file, String newDatabaseIp) throws IOException {
        Path path = file.toPath();
        String content = Files.readString(path, StandardCharsets.UTF_8);
        String originalContent = content;

        // Replace jdbc.url=jdbc:oracle:thin:@IP:port:database pattern
        Matcher jdbcUrlMatcher = JDBC_URL_PATTERN.matcher(content);
        content = jdbcUrlMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp) + "$3");

        // Replace general jdbc:oracle:thin:@IP:port pattern (for XML or other files)
        Matcher jdbcMatcher = JDBC_ORACLE_PATTERN.matcher(content);
        content = jdbcMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp) + "$3");

        // Check if content changed
        if (!content.equals(originalContent)) {
            Files.writeString(path, content, StandardCharsets.UTF_8);
            System.out.println("Updated: " + file.getAbsolutePath());
            return true;
        }

        return false;
    }
}

