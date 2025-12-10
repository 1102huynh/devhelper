package com.devhelper.controller;

import com.devhelper.dto.DiffRequest;
import com.devhelper.dto.DiffResponse;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/diff")
@CrossOrigin(origins = "*")
public class DiffController {

    @PostMapping("/compare")
    public DiffResponse compareDiff(@RequestBody DiffRequest request) {
        String text1 = request.getText1();
        String text2 = request.getText2();

        List<String> lines1 = Arrays.asList(text1.split("\n"));
        List<String> lines2 = Arrays.asList(text2.split("\n"));

        List<DiffResponse.DiffLine> diffLines = new ArrayList<>();

        // Simple line-by-line comparison
        int maxLines = Math.max(lines1.size(), lines2.size());
        for (int i = 0; i < maxLines; i++) {
            String line1 = i < lines1.size() ? lines1.get(i) : "";
            String line2 = i < lines2.size() ? lines2.get(i) : "";

            if (i >= lines1.size()) {
                diffLines.add(new DiffResponse.DiffLine("added", line2, i + 1));
            } else if (i >= lines2.size()) {
                diffLines.add(new DiffResponse.DiffLine("removed", line1, i + 1));
            } else if (!line1.equals(line2)) {
                diffLines.add(new DiffResponse.DiffLine("removed", line1, i + 1));
                diffLines.add(new DiffResponse.DiffLine("added", line2, i + 1));
            } else {
                diffLines.add(new DiffResponse.DiffLine("unchanged", line1, i + 1));
            }
        }

        return DiffResponse.builder()
                .differences(diffLines)
                .totalLines(maxLines)
                .changedLines(diffLines.stream()
                    .filter(d -> !d.getType().equals("unchanged"))
                    .count())
                .build();
    }
}

