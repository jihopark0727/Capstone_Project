package com.application.Service;

import com.application.Client.NaverCloudClient;
import com.application.Dto.TmpResponse;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.fileupload.InvalidFileNameException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class    TmpService {
    private final NaverCloudClient naverCloudClient;

    public TmpResponse getTextByFile(MultipartFile file) {
        File convFile = null;
        try {
            // MultipartFile을 File로 변환
            convFile = convertMultipartFileToFile(file);

            // 변환된 파일을 NaverCloudClient에 전달하여 텍스트 변환 요청
            List<Map<String, String>> response = naverCloudClient.soundToText(convFile);

            // TmpResponse 객체에 리스트로 변환된 텍스트 반환
            return new TmpResponse(response);
        } catch (Exception e) {
            throw new InvalidFileNameException("잘못된 파일", null);
        } finally {
            // 변환된 파일 삭제 (필요한 경우)
            if (convFile != null && convFile.exists()) {
                convFile.delete();
            }
        }
    }

    private File convertMultipartFileToFile(MultipartFile file) throws IOException {
        File convFile = new File(Objects.requireNonNull(file.getOriginalFilename()));
        try (FileOutputStream fos = new FileOutputStream(convFile)) {
            fos.write(file.getBytes());
        }
        return convFile;
    }
}
