package com.application.Controller;

import com.application.Dto.dashboard.DashboardResponseDto;
import com.application.Dto.ResponseDto;
import com.application.Entity.EmotionAnalysisReport;
import com.application.Entity.Session;
import com.application.Service.EmotionAnalysisService;
import com.application.Service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import java.util.Map;


import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final EmotionAnalysisService emotionAnalysisService;

    // 모든 세션 조회
    @GetMapping
    public ResponseDto<List<Session>> getAllSessions() {
        return sessionService.getAllSessions();
    }

    @GetMapping("/dashboard/{id}")
    public ResponseDto<DashboardResponseDto> getDashboardData(@PathVariable(required = false) String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("authentication: " + authentication.getPrincipal());
        return sessionService.getDashboardData((String) authentication.getPrincipal(), Long.parseLong(id));
    }

    // 특정 세션 조회
    @GetMapping("/{id}")
    public ResponseDto<Session> getSessionById(@PathVariable Long id) {
        return sessionService.getSessionById(id);
    }

    // 특정 내담자의 모든 세션 조회
    @GetMapping("/client/{clientId}")
    public ResponseDto<List<Session>> getSessionsByClient(@PathVariable Long clientId) {
        return sessionService.getSessionsByClient(clientId);
    }

    // 녹음 파일 업로드 및 AI 분석 요청
    @PostMapping("/{clientId}/{minuteOfCounseling}/analyze-recording")
    public ResponseDto<String> analyzeSessionRecording(
            @PathVariable Long clientId,
            @PathVariable Integer minuteOfCounseling,
            @RequestParam("file") MultipartFile file) {

        // 디버깅 정보 로그 출력
        System.out.println("\n\nReceived file: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("File content type: " + file.getContentType()+"\n\n");

        return sessionService.analyzeSessionRecording(clientId, minuteOfCounseling, file);
    }


    // 특정 클라이언트의 세션별 감정 분석 결과 조회
    @GetMapping("/clients/{clientId}/sessions/{sessionId}/analysis")
    public ResponseDto<List<EmotionAnalysisReport>> getEmotionReportsByClientAndSession(
            @PathVariable Long clientId,
            @PathVariable Long sessionId) {
        List<EmotionAnalysisReport> emotionReports = emotionAnalysisService.getEmotionReportsBySessionAndClient(sessionId, clientId);
        return ResponseDto.setSuccessData("클라이언트 및 세션별 감정 분석 결과 조회 성공", emotionReports, HttpStatus.OK);
    }


    // 세션 삭제
    @DeleteMapping("/{id}")
    public ResponseDto<?> deleteSession(@PathVariable Long id) {
        return sessionService.deleteSession(id);
    }

    /**
     * 내담자별 주요 감정 조회 API
     *
     * @return ResponseEntity
     */
    @GetMapping("/dominant-by-client/{clientId}")
    public ResponseEntity<Map<String, String>> getDominantEmotionByClient(@PathVariable Long clientId) {
        try {
            String dominantEmotion = emotionAnalysisService.getDominantEmotionByClient(clientId);
            return ResponseEntity.ok(Map.of("dominantEmotion", dominantEmotion));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "내담자별 주요 감정을 가져오는 데 실패했습니다: " + e.getMessage()));
        }
    }
}
