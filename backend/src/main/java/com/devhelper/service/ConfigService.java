package com.devhelper.service;

import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
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
     */
    public int replaceDatabaseOnly(String projectPath, String newDatabaseIp) throws IOException {
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !projectDir.isDirectory()) {
            throw new IOException("Project directory not found: " + projectPath);
        }

        File resourcesDir = new File(projectDir, "src/main/resources");
        if (!resourcesDir.exists() || !resourcesDir.isDirectory()) {
            resourcesDir = new File(projectDir, "src\\main\\resources");
        }
        
        if (!resourcesDir.exists() || !resourcesDir.isDirectory()) {
            return 0;
        }

        int[] filesUpdated = {0};
        scanAndReplaceDatabaseOnly(resourcesDir, newDatabaseIp, filesUpdated);
        return filesUpdated[0];
    }

    /**
     * Replace XML test suite configurations only (hub, sso credentials, orgAlias)
     * For qa-rpmoverall project - scans xifinportal and engines test suites
     */
    public int replaceTestSuiteConfig(String projectPath, String hub, 
                                      String ssoUsername, String ssoPassword, String orgAlias) throws IOException {
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !projectDir.isDirectory()) {
            throw new IOException("Project directory not found: " + projectPath);
        }

        File resourcesDir = new File(projectDir, "src/main/resources");
        if (!resourcesDir.exists() || !resourcesDir.isDirectory()) {
            resourcesDir = new File(projectDir, "src\\main\\resources");
        }
        
        if (!resourcesDir.exists() || !resourcesDir.isDirectory()) {
            return 0;
        }

        int[] filesUpdated = {0};
        
        Map<String, String> config = Map.of(
            "hub", hub != null ? hub : "",
            "ssoUsername", ssoUsername != null ? ssoUsername : "",
            "ssoPassword", ssoPassword != null ? ssoPassword : "",
            "orgAlias", orgAlias != null ? orgAlias : ""
        );
        
        scanAndReplaceTestSuiteOnly(resourcesDir, config, filesUpdated);
        return filesUpdated[0];
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

    private void scanAndReplaceDatabaseOnly(File dir, String newDatabaseIp, int[] filesUpdated) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                String name = file.getName();
                if (name.equals("target") || name.equals("node_modules") || name.equals(".git") || name.equals(".idea")) {
                    continue;
                }
                scanAndReplaceDatabaseOnly(file, newDatabaseIp, filesUpdated);
            } else if (file.getName().toLowerCase().endsWith(".properties")) {
                // Only process .properties files for database replacement
                if (replaceDatabaseInFile(file, newDatabaseIp)) {
                    filesUpdated[0]++;
                }
            }
        }
    }

    private void scanAndReplaceTestSuiteOnly(File dir, Map<String, String> config, int[] filesUpdated) throws IOException {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                String name = file.getName();
                if (name.equals("target") || name.equals("node_modules") || name.equals(".git") || name.equals(".idea")) {
                    continue;
                }
                scanAndReplaceTestSuiteOnly(file, config, filesUpdated);
            } else if (file.getName().toLowerCase().endsWith(".xml")) {
                // Only process .xml files for test suite replacement
                if (replaceTestSuiteInFile(file, config)) {
                    filesUpdated[0]++;
                }
            }
        }
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

        // Replace jdbc.url pattern
        Matcher jdbcUrlMatcher = JDBC_URL_PATTERN.matcher(content);
        content = jdbcUrlMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp) + "$3");

        // Replace general jdbc:oracle:thin:@IP:port pattern
        Matcher jdbcMatcher = JDBC_ORACLE_PATTERN.matcher(content);
        content = jdbcMatcher.replaceAll("$1" + Matcher.quoteReplacement(newDatabaseIp) + "$3");

        if (!content.equals(originalContent)) {
            Files.writeString(path, content, StandardCharsets.UTF_8);
            System.out.println("Updated database in: " + file.getAbsolutePath());
            return true;
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

        if (!content.equals(originalContent)) {
            Files.writeString(path, content, StandardCharsets.UTF_8);
            System.out.println("Updated test suite in: " + file.getAbsolutePath());
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

