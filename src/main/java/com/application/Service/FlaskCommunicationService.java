package com.application.Service;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class FlaskCommunicationService {

    private final String FLASK_SERVER_URL = "http://localhost:5000/analyze"; // Python 서버 URL

    // Flask 서버로 녹음 파일 전송 및 분석 결과 수신
    public List<Map<String, Object>> analyzeRecording(File file) throws IOException {
        HttpPost post = new HttpPost(FLASK_SERVER_URL);

        // Multipart 데이터 생성 (파일 업로드 방식)
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        builder.addBinaryBody("file", file, ContentType.MULTIPART_FORM_DATA, file.getName());
        post.setEntity(builder.build());

        // 요청 실행 및 응답 수신
        try (CloseableHttpClient client = HttpClients.createDefault();
             CloseableHttpResponse response = client.execute(post)) {

            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode != 200) {
                throw new IOException("Flask 서버 응답 오류: " + statusCode);
            }

            String jsonResponse = EntityUtils.toString(response.getEntity()); // JSON 형태의 응답
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(jsonResponse, List.class); // 응답을 List<Map> 형식으로 변환
        }
    }
}
