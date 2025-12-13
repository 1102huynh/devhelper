package com.devhelper.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    private static final String DATA_DIR = "D:/devhelper-data/";

    private final ObjectMapper objectMapper;

    public FileStorageService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @PostConstruct
    public void init() {
        try {
            Path dataPath = Paths.get(DATA_DIR);
            if (!Files.exists(dataPath)) {
                Files.createDirectories(dataPath);
                logger.info("✅ Created data directory: {}", DATA_DIR);
            } else {
                logger.info("✅ Data directory already exists: {}", DATA_DIR);
            }
        } catch (IOException e) {
            logger.error("❌ Failed to create data directory: {}", e.getMessage());
        }
    }

    /**
     * Read data from JSON file
     */
    public <T> List<T> readFromFile(String fileName, Class<T> clazz) {
        File file = new File(DATA_DIR + fileName);

        if (!file.exists()) {
            logger.info("📄 File not found, returning empty list: {}", fileName);
            return new ArrayList<>();
        }

        try {
            List<T> data = objectMapper.readValue(file,
                objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
            logger.info("✅ Read {} items from {}", data.size(), fileName);
            return data;
        } catch (IOException e) {
            logger.error("❌ Failed to read from file {}: {}", fileName, e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Write data to JSON file
     */
    public <T> void writeToFile(String fileName, List<T> data) {
        File file = new File(DATA_DIR + fileName);

        try {
            // Ensure parent directory exists
            file.getParentFile().mkdirs();

            // Write with pretty printing
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, data);
            logger.info("✅ Wrote {} items to {}", data.size(), fileName);
        } catch (IOException e) {
            logger.error("❌ Failed to write to file {}: {}", fileName, e.getMessage());
            throw new RuntimeException("Failed to save data to file: " + fileName, e);
        }
    }

    /**
     * Get data directory path
     */
    public String getDataDirectory() {
        return DATA_DIR;
    }

    /**
     * Check if file exists
     */
    public boolean fileExists(String fileName) {
        return new File(DATA_DIR + fileName).exists();
    }

    /**
     * Delete file
     */
    public boolean deleteFile(String fileName) {
        File file = new File(DATA_DIR + fileName);
        if (file.exists()) {
            boolean deleted = file.delete();
            if (deleted) {
                logger.info("🗑️ Deleted file: {}", fileName);
            }
            return deleted;
        }
        return false;
    }
}

