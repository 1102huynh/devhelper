package com.devhelper.controller;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uuid")
public class UuidController {

    @GetMapping("/generate")
    public Map<String, Object> generateUuid(@RequestParam(defaultValue = "1") int count) {
        List<String> uuids = new ArrayList<>();
        for (int i = 0; i < Math.min(count, 100); i++) {
            uuids.add(UUID.randomUUID().toString());
        }
        return Map.of(
            "uuids", uuids,
            "count", uuids.size()
        );
    }

    @GetMapping("/generate/v4")
    public Map<String, String> generateV4() {
        return Map.of("uuid", UUID.randomUUID().toString());
    }
}


