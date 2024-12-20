package com.application.Client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.application.Dto.MediaTextResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import reactor.core.publisher.Mono;

import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class NaverCloudClient {
    private final ObjectMapper objectMapper;

    @Value("${naver.cloud.id}")
    private String CLIENT_ID;

    @Value("${naver.cloud.secret}")
    private String CLIENT_SECRET;

    private final WebClient webClient;

    public NaverCloudClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl("https://naveropenapi.apigw.ntruss.com")
                .build();
    }

    public List<Map<String, String>> soundToText(File file) {
        List<Map<String, String>> speakerSegments = new ArrayList<>();

        try {
            // 파일을 바이트 배열로 읽어온 후 전송
            byte[] fileContent = Files.readAllBytes(file.toPath());
            String language = "Kor";

            Mono<String> responseMono = webClient.post()
                    .uri(uriBuilder -> uriBuilder.path("/recog/v1/stt")
                            .queryParam("lang", language)
                            .build())
                    .header("X-NCP-APIGW-API-KEY-ID", CLIENT_ID)
                    .header("X-NCP-APIGW-API-KEY", CLIENT_SECRET)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .bodyValue(fileContent)
                    .retrieve()
                    .bodyToMono(String.class);

            String response = responseMono.block();
            speakerSegments = parseSegments(response);

        } catch (Exception e) {
            System.out.println("Error processing audio file: " + e.getMessage());
        }

        return speakerSegments;
    }

    private List<Map<String, String>> parseSegments(String response) {
        List<Map<String, String>> speakerSegments = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode segments = root.path("segments");

            for (JsonNode segment : segments) {
                Map<String, String> speakerSegment = new HashMap<>();
                String speakerLabel = segment.path("speaker").path("label").asText();
                String text = segment.path("text").asText();

                speakerSegment.put("speaker", speakerLabel);
                speakerSegment.put("text", text);

                speakerSegments.add(speakerSegment);
            }
        } catch (Exception e) {
            System.out.println("Error parsing segments: " + e.getMessage());
        }

        return speakerSegments;
    }
}
