package com.application.Service;

import com.application.Client.NaverCloudClient;
import com.application.Dto.ResponseDto;
import com.application.Entity.EmotionAnalysisReport;
import com.application.Entity.EmotionMap;
import com.application.Entity.Session;
import com.application.Repository.EmotionAnalysisReportRepository;
import com.application.Repository.EmotionMapRepository;
import com.application.Repository.SessionRepository;
import com.application.Service.FlaskCommunicationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmotionAnalysisService {

    private final EmotionAnalysisReportRepository emotionAnalysisReportRepository;
    private final EmotionMapRepository emotionMapRepository;
    private final SessionRepository sessionRepository;
    private final NaverCloudClient naverCloudClient;
    private final FlaskCommunicationService flaskCommunicationService;

    @Autowired
    public EmotionAnalysisService(
            EmotionAnalysisReportRepository emotionAnalysisReportRepository,
            EmotionMapRepository emotionMapRepository,
            SessionRepository sessionRepository,
            NaverCloudClient naverCloudClient,
            FlaskCommunicationService flaskCommunicationService // 소문자로 수정
    ) {
        this.emotionAnalysisReportRepository = emotionAnalysisReportRepository;
        this.emotionMapRepository = emotionMapRepository;
        this.sessionRepository = sessionRepository;
        this.naverCloudClient = naverCloudClient;
        this.flaskCommunicationService = flaskCommunicationService; // 주입 연결
    }

    /**
     * 녹음 파일 분석
     *
     * @param clientId  클라이언트 ID
     * @param sessionNumber 세션 number
     * @param file      녹음 파일
     * @return 분석 결과
     */
    // Flask 서버 호출 후 임시 파일 삭제
    public ResponseDto<String> analyzeRecording(Long clientId, Integer sessionNumber, MultipartFile file) {
        File convertedFile = null;
        try {
            // 세션 확인
            Session session = sessionRepository.findByClientIdAndSessionNumber(clientId, sessionNumber)
                    .orElseThrow(() -> new IllegalArgumentException("해당 세션이 존재하지 않습니다."));

            // MultipartFile -> File 변환
            convertedFile = convertMultipartFileToFile(file);

            // Flask 서버로 분석 요청
            List<Map<String, Object>> analysisResults = flaskCommunicationService.analyzeRecording(convertedFile);

            // TODO: MOCK 데이터 생성로직으로 AI 연결 실패시 바로위에 'Flask 서버로 분석 요청' 로직 대신 사용하시면 됩니다.
//            List<Map<String, Object>> mockData = generateSampleData1();

            // 분석 결과를 데이터베이스에 저장
            saveAnalysisResults(session.getId(), analysisResults);

            // 성공 메시지 반환
            return ResponseDto.setSuccessData("분석 완료", "분석 결과가 성공적으로 저장되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.setFailed("분석 중 오류 발생: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            // 변환된 임시 파일 삭제
            if (convertedFile != null && convertedFile.exists()) {
                convertedFile.delete();
            }
        }
    }

    // MultipartFile을 File로 변환하는 메서드
    private File convertMultipartFileToFile(MultipartFile multipartFile) throws IOException {
        // 임시 파일 생성
        File file = new File(System.getProperty("java.io.tmpdir"), multipartFile.getOriginalFilename());
        multipartFile.transferTo(file); // multipartFile 내용을 파일로 복사
        return file;
    }

    /**
     * 감정 분석 결과 저장
     *
     * @param sessionId      세션 ID
     * @param analysisResults 분석 결과
     */
    /**
     * 감정 분석 결과 저장
     *
     * @param sessionId      세션 ID
     * @param analysisResults 분석 결과
     */
    public void saveAnalysisResults(Long sessionId, List<Map<String, Object>> analysisResults) {
        // 1. 세션 정보 조회
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("해당 세션 ID가 존재하지 않습니다."));

        // 2. 세션에서 clientId 가져오기
        Long clientId = session.getClient().getId(); // Session 객체에 Client가 연관된 경우

        // 3. AI 분석 결과를 EmotionAnalysisReport 엔티티로 변환
        List<EmotionAnalysisReport> reports = analysisResults.stream().map(result -> {
            EmotionAnalysisReport report = new EmotionAnalysisReport();

            // 문장 데이터 설정
            String sentenceText = (String) result.get("text");
            String emotion = (String) result.get("emotion"); // 감정 (null 가능)
            String sentenceId = (String) result.get("id");   // "1"과 같은 String 형태
            Integer speakerLabel = (Integer) result.get("speaker_label");

            // 키워드 데이터를 JSON 문자열로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            String keywords = null;
            Object keywordsObject = result.get("keywords");
            if (keywordsObject != null) {
                try {
                    // 키워드 배열을 JSON 문자열로 변환
                    keywords = objectMapper.writeValueAsString(keywordsObject);
                } catch (Exception e) {
                    e.printStackTrace();
                    keywords = "[]"; // 예외 처리로 빈 배열 문자열 반환
                }
            }

            // 문장 번호 설정 (String -> int 변환)
            int sentenceNumber = Integer.parseInt(sentenceId);

            // 보고서 엔티티 생성
            report.setSession(session);
            report.setClientId(clientId);
            report.setSpeakerLabel(speakerLabel);
            report.setSentenceNumber(sentenceNumber);
            report.setSentenceText(sentenceText);
            report.setDominantEmotion(emotion);     // 감정 값 (null 가능)
            report.setKeywords(keywords);          // 키워드 데이터
            report.setAnalyzedAt(new Timestamp(System.currentTimeMillis()));

            // 마지막 문장에만 analysisSummary 추가
            if (sentenceNumber == analysisResults.size() || sentenceNumber == analysisResults.size() - 1) {
                String analysisSummary = (String) result.get("analysisSummary");
                report.setAnalysisSummary(analysisSummary);
            }

            return report;
        }).collect(Collectors.toList());

        // 4. 데이터베이스에 저장
        emotionAnalysisReportRepository.saveAll(reports);
    }

    /**
     * 세션의 감정 분석 결과 조회
     *
     * @param sessionId 세션 ID
     * @param clientId 클라이언트 ID
     * @return 감정 분석 결과 목록
     */
    public List<EmotionAnalysisReport> getEmotionReportsBySessionAndClient(Long sessionId, Long clientId) {
        return emotionAnalysisReportRepository.findBySessionIdAndClientId(sessionId, clientId);
    }


    /**
     * 클라이언트의 감정 요약 데이터 조회
     *
     * @param clientId 클라이언트 ID
     * @return 감정 요약 데이터 목록
     */
    public List<EmotionMap> getEmotionSummaryByClient(Long clientId) {
        return emotionMapRepository.findByClient_Id(clientId);
    }

    public String getDominantEmotionByClient(Long clientId) {
        // `speaker_label`이 1인 데이터 필터링
        List<EmotionAnalysisReport> reports = emotionAnalysisReportRepository.findByClientIdAndSpeakerLabel(clientId, 1);

        // 감정 데이터가 없는 경우 처리
        if (reports.isEmpty()) {
            return "알 수 없음";
        }

        // `dominant_emotion` 빈도 계산
        Map<String, Long> emotionFrequency = reports.stream()
                .filter(report -> report.getDominantEmotion() != null) // null 감정 제외
                .collect(Collectors.groupingBy(EmotionAnalysisReport::getDominantEmotion, Collectors.counting()));

        // 가장 많이 등장한 `dominant_emotion` 가져오기
        return emotionFrequency.entrySet().stream()
                .max(Map.Entry.comparingByValue()) // 값 기준 최대값 선택
                .map(Map.Entry::getKey)
                .orElse("알 수 없음"); // 빈도가 없으면 기본값
    }


    }

