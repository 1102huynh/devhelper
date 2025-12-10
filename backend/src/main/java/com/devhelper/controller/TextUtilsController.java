package com.devhelper.controller;

import com.devhelper.dto.TextUtilsRequest;
import com.devhelper.dto.TextUtilsResponse;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/text")
public class TextUtilsController {

    @PostMapping("/convert")
    public TextUtilsResponse convertText(@RequestBody TextUtilsRequest request) {
        String input = request.getText();
        String operation = request.getOperation();

        String result;
        switch (operation.toLowerCase()) {
            case "uppercase":
                result = input.toUpperCase();
                break;
            case "lowercase":
                result = input.toLowerCase();
                break;
            case "capitalize":
                result = capitalizeWords(input);
                break;
            case "camelcase":
                result = toCamelCase(input);
                break;
            case "snakecase":
                result = toSnakeCase(input);
                break;
            case "kebabcase":
                result = toKebabCase(input);
                break;
            case "reverse":
                result = new StringBuilder(input).reverse().toString();
                break;
            case "trim":
                result = input.trim();
                break;
            case "removewhitespace":
                result = input.replaceAll("\\s+", "");
                break;
            case "removelines":
                result = input.replaceAll("\\n+", " ");
                break;
            default:
                result = input;
        }

        return TextUtilsResponse.builder()
                .result(result)
                .originalLength(input.length())
                .resultLength(result.length())
                .wordCount(countWords(result))
                .lineCount(countLines(result))
                .build();
    }

    @PostMapping("/stats")
    public Map<String, Object> getTextStats(@RequestBody TextUtilsRequest request) {
        String text = request.getText();
        return Map.of(
            "length", text.length(),
            "wordCount", countWords(text),
            "lineCount", countLines(text),
            "characterCount", text.length(),
            "byteSize", text.getBytes(StandardCharsets.UTF_8).length
        );
    }

    private String capitalizeWords(String input) {
        String[] words = input.split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)))
                      .append(word.substring(1).toLowerCase())
                      .append(" ");
            }
        }
        return result.toString().trim();
    }

    private String toCamelCase(String input) {
        String[] words = input.split("[\\s_-]+");
        StringBuilder result = new StringBuilder(words[0].toLowerCase());
        for (int i = 1; i < words.length; i++) {
            if (!words[i].isEmpty()) {
                result.append(Character.toUpperCase(words[i].charAt(0)))
                      .append(words[i].substring(1).toLowerCase());
            }
        }
        return result.toString();
    }

    private String toSnakeCase(String input) {
        return input.replaceAll("([a-z])([A-Z])", "$1_$2")
                   .replaceAll("[\\s-]+", "_")
                   .toLowerCase();
    }

    private String toKebabCase(String input) {
        return input.replaceAll("([a-z])([A-Z])", "$1-$2")
                   .replaceAll("[\\s_]+", "-")
                   .toLowerCase();
    }

    private int countWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        return text.trim().split("\\s+").length;
    }

    private int countLines(String text) {
        if (text == null || text.isEmpty()) {
            return 0;
        }
        return text.split("\n").length;
    }
}

