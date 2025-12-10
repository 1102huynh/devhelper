package com.devhelper.controller;

import com.devhelper.dto.CronExpressionRequest;
import com.devhelper.dto.CronExpressionResponse;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/cron")
public class CronController {

    @PostMapping("/parse")
    public CronExpressionResponse parseCronExpression(@RequestBody CronExpressionRequest request) {
        try {
            String expression = request.getExpression();
            String[] parts = expression.trim().split("\\s+");

            if (parts.length < 5 || parts.length > 7) {
                return CronExpressionResponse.builder()
                        .valid(false)
                        .error("Invalid cron expression format. Expected 5-7 parts.")
                        .build();
            }

            StringBuilder description = new StringBuilder();

            // Parse minute (0-59)
            description.append("At ");
            if (parts[0].equals("*")) {
                description.append("every minute");
            } else if (parts[0].contains("/")) {
                description.append("every ").append(parts[0].split("/")[1]).append(" minute(s)");
            } else {
                description.append("minute ").append(parts[0]);
            }

            // Parse hour (0-23)
            description.append(", ");
            if (parts[1].equals("*")) {
                description.append("every hour");
            } else if (parts[1].contains("/")) {
                description.append("every ").append(parts[1].split("/")[1]).append(" hour(s)");
            } else {
                description.append("at hour ").append(parts[1]);
            }

            // Parse day of month (1-31)
            description.append(", ");
            if (parts[2].equals("*")) {
                description.append("every day");
            } else if (parts[2].contains("/")) {
                description.append("every ").append(parts[2].split("/")[1]).append(" day(s)");
            } else {
                description.append("on day ").append(parts[2]);
            }

            // Parse month (1-12)
            description.append(", ");
            if (parts[3].equals("*")) {
                description.append("every month");
            } else {
                description.append("in month ").append(parts[3]);
            }

            // Parse day of week (0-6)
            description.append(", ");
            if (parts[4].equals("*")) {
                description.append("every day of week");
            } else {
                String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
                try {
                    int dayNum = Integer.parseInt(parts[4]);
                    if (dayNum >= 0 && dayNum < 7) {
                        description.append("on ").append(days[dayNum]);
                    } else {
                        description.append("on day ").append(parts[4]);
                    }
                } catch (NumberFormatException e) {
                    description.append("on day ").append(parts[4]);
                }
            }

            return CronExpressionResponse.builder()
                    .expression(expression)
                    .description(description.toString())
                    .valid(true)
                    .build();
        } catch (Exception e) {
            return CronExpressionResponse.builder()
                    .valid(false)
                    .error("Failed to parse cron expression: " + e.getMessage())
                    .build();
        }
    }
}

