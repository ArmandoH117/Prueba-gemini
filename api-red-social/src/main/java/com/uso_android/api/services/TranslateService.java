package com.uso_android.api.services;

import java.net.URI;
import java.time.Duration;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uso_android.api.dtos.groq.TranslateDto.GroqMessage;
import com.uso_android.api.dtos.groq.TranslateDto.GroqReq;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.http.*;

@Service
public class TranslateService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.model}")
    private String model;

    @Value("${groq.url}")
    private String url;

    private final ObjectMapper mapper = new ObjectMapper();

    private final HttpClient http = java.net.http.HttpClient.newHttpClient();

    public String translate(String text, String source, String target) {
        try {
            if (text == null || text.trim().isEmpty())
                return "";

            source = (source == null || source.isBlank()) ? "auto" : source.toLowerCase();
            target = (target == null || target.isBlank()) ? "es" : target.toLowerCase();

            var systemPrompt = """
                    Eres un traductor profesional. Tareas estrictas:
                    - Devuelve SOLO la traducción al idioma TARGET, sin comillas, sin notas y sin explicación.
                    TARGET=%s
                    """
                    .formatted(target);

            GroqReq payload = new GroqReq(
                    model,
                    List.of(
                            new GroqMessage("system", systemPrompt),
                            new GroqMessage("user", text)),
                    1.0);

            String body = mapper.writeValueAsString(payload);

            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(60))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() < 200 || res.statusCode() >= 300) {
                throw new RuntimeException("Groq error HTTP " + res.statusCode() + ": " + res.body());
            }

            var root = mapper.readTree(res.body());
            var translation = root.path("choices").path(0).path("message").path("content").asText("").trim();

            return translation;
        } catch (Exception e) {
            throw new RuntimeException("Falló la traducción con Groq", e);
        }
    }

}
