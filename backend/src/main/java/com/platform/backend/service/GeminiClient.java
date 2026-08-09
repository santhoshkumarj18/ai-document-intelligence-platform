package com.platform.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Base64;

@Component
public class GeminiClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String model;

    public GeminiClient(
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.model}") String model,
            @Value("${gemini.base-url}") String baseUrl) {
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("x-goog-api-key", apiKey)
                .build();
    }

    public JsonNode extractStructured(byte[] fileBytes, String mimeType, String prompt, JsonNode jsonSchema)
            throws Exception {
        String base64Data = Base64.getEncoder().encodeToString(fileBytes);

        ObjectNode documentPart = objectMapper.createObjectNode();
        boolean isImage = mimeType != null && mimeType.startsWith("image/");
        documentPart.put("type", isImage ? "image" : "document");
        documentPart.put("data", base64Data);
        documentPart.put("mime_type", mimeType);

        ObjectNode textPart = objectMapper.createObjectNode();
        textPart.put("type", "text");
        textPart.put("text", prompt);

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "text");
        responseFormat.put("mime_type", "application/json");
        responseFormat.set("schema", jsonSchema);

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", model);
        requestBody.set("input", objectMapper.createArrayNode().add(documentPart).add(textPart));
        requestBody.set("response_format", responseFormat);

        String jsonBody = objectMapper.writeValueAsString(requestBody);
        System.out.println("GEMINI REQUEST BODY = " + jsonBody);

        // Fetch as a raw String rather than asking RestClient to auto-convert
        // into JsonNode — that requires a Jackson HttpMessageConverter bean
        // that isn't present in this app's context (same root cause as the
        // earlier "No qualifying bean of type ObjectMapper" constructor error).
        // Parsing manually with our own local objectMapper sidesteps it entirely.
        String responseBody = restClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonBody)
                .retrieve()
                .body(String.class);

        JsonNode response = objectMapper.readTree(responseBody);

        return parseOutputText(response);
    }

    private JsonNode parseOutputText(JsonNode response) {
        JsonNode steps = response.path("steps");
        if (!steps.isArray() || steps.isEmpty()) {
            throw new IllegalStateException("Gemini response had no steps: " + response);
        }

        JsonNode lastStep = steps.get(steps.size() - 1);
        JsonNode content = lastStep.path("content");

        for (JsonNode part : content) {
            if ("text".equals(part.path("type").asText())) {
                String text = part.path("text").asText();
                try {
                    return objectMapper.readTree(text);
                } catch (Exception e) {
                    throw new IllegalStateException("Gemini returned invalid JSON: " + text, e);
                }
            }
        }

        throw new IllegalStateException("No text content found in Gemini response: " + response);
    }
}