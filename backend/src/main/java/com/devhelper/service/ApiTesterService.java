package com.devhelper.service;

import com.devhelper.dto.ApiTestRequest;
import com.devhelper.dto.ApiTestResponse;
import org.apache.hc.client5.http.classic.methods.*;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ApiTesterService {

    public ApiTestResponse testApi(ApiTestRequest request) {
        ApiTestResponse response = new ApiTestResponse();
        long startTime = System.currentTimeMillis();

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpUriRequestBase httpRequest = createRequest(request);

            // Add headers
            if (request.getHeaders() != null) {
                request.getHeaders().forEach(httpRequest::addHeader);
            }

            // Add body for POST, PUT, PATCH
            if (request.getBody() != null && !request.getBody().isEmpty()) {
                if (httpRequest instanceof HttpPost) {
                    ((HttpPost) httpRequest).setEntity(new StringEntity(request.getBody()));
                } else if (httpRequest instanceof HttpPut) {
                    ((HttpPut) httpRequest).setEntity(new StringEntity(request.getBody()));
                } else if (httpRequest instanceof HttpPatch) {
                    ((HttpPatch) httpRequest).setEntity(new StringEntity(request.getBody()));
                }
            }

            try (CloseableHttpResponse httpResponse = httpClient.execute(httpRequest)) {
                long endTime = System.currentTimeMillis();

                response.setStatusCode(httpResponse.getCode());
                response.setStatusText(httpResponse.getReasonPhrase());
                response.setResponseTime(endTime - startTime);

                // Extract headers
                Map<String, String> headers = new HashMap<>();
                for (var header : httpResponse.getHeaders()) {
                    headers.put(header.getName(), header.getValue());
                }
                response.setHeaders(headers);

                // Extract body
                if (httpResponse.getEntity() != null) {
                    String body = EntityUtils.toString(httpResponse.getEntity());
                    response.setBody(body);
                }
            }

        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            response.setStatusCode(0);
            response.setStatusText("Error");
            response.setError(e.getMessage());
            response.setResponseTime(endTime - startTime);
        }

        return response;
    }

    private HttpUriRequestBase createRequest(ApiTestRequest request) {
        return switch (request.getMethod().toUpperCase()) {
            case "POST" -> new HttpPost(request.getUrl());
            case "PUT" -> new HttpPut(request.getUrl());
            case "DELETE" -> new HttpDelete(request.getUrl());
            case "PATCH" -> new HttpPatch(request.getUrl());
            default -> new HttpGet(request.getUrl());
        };
    }
}

