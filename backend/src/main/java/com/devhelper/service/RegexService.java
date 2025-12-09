package com.devhelper.service;

import com.devhelper.dto.RegexTestRequest;
import com.devhelper.dto.RegexTestResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

@Service
public class RegexService {

    public RegexTestResponse testRegex(RegexTestRequest request) {
        RegexTestResponse response = new RegexTestResponse();

        try {
            // Build flags
            int flags = 0;
            if (request.getFlags() != null) {
                for (String flag : request.getFlags()) {
                    switch (flag.toLowerCase()) {
                        case "i":
                            flags |= Pattern.CASE_INSENSITIVE;
                            break;
                        case "m":
                            flags |= Pattern.MULTILINE;
                            break;
                        case "s":
                            flags |= Pattern.DOTALL;
                            break;
                    }
                }
            }

            Pattern pattern = Pattern.compile(request.getPattern(), flags);
            Matcher matcher = pattern.matcher(request.getTestString());

            List<RegexTestResponse.Match> matches = new ArrayList<>();

            while (matcher.find()) {
                List<String> groups = new ArrayList<>();
                for (int i = 1; i <= matcher.groupCount(); i++) {
                    groups.add(matcher.group(i));
                }

                matches.add(new RegexTestResponse.Match(
                    matcher.group(),
                    matcher.start(),
                    matcher.end(),
                    groups
                ));
            }

            response.setValid(true);
            response.setMatches(matches);
            response.setMatchCount(matches.size());

        } catch (PatternSyntaxException e) {
            response.setValid(false);
            response.setError(e.getMessage());
            response.setMatches(new ArrayList<>());
            response.setMatchCount(0);
        }

        return response;
    }
}

