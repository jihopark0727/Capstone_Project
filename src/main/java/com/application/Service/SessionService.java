package com.application.Service;

import com.application.Dto.dashboard.AnalysisDto;
import com.application.Dto.dashboard.CounselingDetailDto;
import com.application.Dto.dashboard.DashboardResponseDto;
import com.application.Dto.ResponseDto;
import com.application.Entity.Client;
import com.application.Entity.Counselor;
import com.application.Entity.EmotionAnalysisReport;
import com.application.Entity.Session;
import com.application.Repository.ClientRepository;
import com.application.Repository.CounselorRepository;
import com.application.Repository.EmotionAnalysisReportRepository;
import com.application.Repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final ClientRepository clientRepository;
    private final EmotionAnalysisService emotionAnalysisService;
    private final ClientService clientService;
    private final CounselorRepository counselorRepository;
    private final EmotionAnalysisReportRepository emotionAnalysisReportRepository;

    @Autowired
    public SessionService(SessionRepository sessionRepository, ClientRepository clientRepository,
                          EmotionAnalysisService emotionAnalysisService, ClientService clientService, CounselorRepository counselorRepository, EmotionAnalysisReportRepository emotionAnalysisReportRepository) {
        this.sessionRepository = sessionRepository;
        this.clientRepository = clientRepository;
        this.emotionAnalysisService = emotionAnalysisService;
        this.clientService = clientService;
        this.counselorRepository = counselorRepository;
        this.emotionAnalysisReportRepository = emotionAnalysisReportRepository;
    }

    /**
     * 세션 및 클라이언트 검증 후 감정 분석 요청
     *
     * @param clientId  클라이언트 ID
     * @param file      녹음 파일
     * @return 감정 분석 결과
     */
    public ResponseDto<String> analyzeSessionRecording(Long clientId, Integer minuteOfCounseling,  MultipartFile file) {
        try {
            Session session;

            // 새 세션 생성
            session = new Session();

            // Client 객체 설정
            Client client = clientRepository.findById(clientId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 내담자가 존재하지 않습니다."));
            session.setClient(client);
            session.setSessionNumber(new Random().nextInt(1000000)); // 세션 번호 랜덤 생성
            session.setMinuteOfCounseling(minuteOfCounseling);

            // Counselor 객체 설정
            Counselor loggedInCounselor = clientService.getLoggedInCounselor(); // ClientService의 메서드 사용
            session.setCounselor(loggedInCounselor);

            session.setSessionDate(new Timestamp(System.currentTimeMillis()));

            // 데이터베이스에 세션 저장
            session = sessionRepository.save(session);

            // 2. 감정 분석 요청
            return emotionAnalysisService.analyzeRecording(session.getClient().getId(), session.getSessionNumber(), file);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.setFailed("녹음 분석 중 오류가 발생했습니다: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    /**
     * 모든 세션 조회
     */
    public ResponseDto<List<Session>> getAllSessions() {
        List<Session> sessions = sessionRepository.findAll();
        return ResponseDto.setSuccessData("모든 세션 조회 성공", sessions, HttpStatus.OK);
    }

    /**
     * 특정 세션 조회
     */
    public ResponseDto<Session> getSessionById(Long id) {
        return sessionRepository.findById(id)
                .map(session -> ResponseDto.setSuccessData("세션 조회 성공", session, HttpStatus.OK))
                .orElse(ResponseDto.setFailed("세션 ID가 존재하지 않습니다.", HttpStatus.NOT_FOUND));
    }

    /**
     * 특정 클라이언트의 모든 세션 조회
     */
    public ResponseDto<List<Session>> getSessionsByClient(Long clientId) {
        List<Session> sessions = sessionRepository.findByClientId(clientId);
        if (sessions.isEmpty()) {
            return ResponseDto.setFailed("해당 내담자에 대한 세션이 존재하지 않습니다.", HttpStatus.NOT_FOUND);
        }
        return ResponseDto.setSuccessData("해당 내담자의 모든 세션 조회 성공", sessions, HttpStatus.OK);
    }

    /**
     * 세션 삭제
     */
    public ResponseDto<?> deleteSession(Long id) {
        if (sessionRepository.existsById(id)) {
            sessionRepository.deleteById(id);
            return ResponseDto.setSuccess("세션 삭제 성공", HttpStatus.OK);
        } else {
            return ResponseDto.setFailed("세션 ID가 존재하지 않습니다.", HttpStatus.NOT_FOUND);
        }
    }

    public ResponseDto<DashboardResponseDto> getDashboardData(String counselorEmail, Long clientId) {
        List<String> defaultEmotions = Arrays.asList("행복", "중립", "불안", "당황", "슬픔", "분노", "혐오");
        int totalClientCount;
        int totalSessionCount;
        int totalCounselingTime;

        if (clientId == 0) {
            Counselor counselor = counselorRepository.findByEmail(counselorEmail)
                    .orElseThrow(() -> new IllegalArgumentException("해당 상담사가 존재하지 않습니다."));
            List<Session> sessions = sessionRepository.findByCounselor(counselor);
            List<Client> clients = clientService.getClientsByLoggedInCounselor().getData();
            List<String> emotions = new ArrayList<>();

            // 상담 내역 데이터
            List<CounselingDetailDto> counselingDetails = sessions.stream().map(
                    session -> {
                        List<EmotionAnalysisReport> emotionAnalysisReports = emotionAnalysisReportRepository.findAllBySession(session);
                        List<AnalysisDto> analysisDtoList = emotionAnalysisReports.stream().map(
                                emotionAnalysisReport -> {
                                    emotions.add(emotionAnalysisReport.getDominantEmotion());
                                    return new AnalysisDto(
                                            emotionAnalysisReport.getId(),
                                            emotionAnalysisReport.getSpeakerLabel(),
                                            emotionAnalysisReport.getSentenceText(),
                                            emotionAnalysisReport.getDominantEmotion(),
                                            convertStringToList(emotionAnalysisReport.getKeywords()),
                                            emotionAnalysisReport.getAnalysisSummary(), // 추가된 부분
                                            emotionAnalysisReport.getSession().getId()
                                    );
                                }
                        ).toList();

                        return new CounselingDetailDto(
                                session.getId(),
                                session.getClient().getName(),
                                convertTimestampToString(session.getSessionDate()),
                                session.getMinuteOfCounseling(),
                                analysisDtoList
                        );
                    }
            ).toList();

            // 감정 분석 결과 데이터
            Map<String, Integer> emotionCounts = countEmotions(emotions);

            // 대시보드 상단 데이터
            String mostFrequentEmotion = findMostFrequentEmotion(emotionCounts);
            totalClientCount = clients.size();
            totalSessionCount = sessions.size();
            totalCounselingTime = sessions.stream().mapToInt(Session::getMinuteOfCounseling).sum();

            DashboardResponseDto response = new DashboardResponseDto(
                    totalClientCount,
                    totalSessionCount,
                    convertMinutesToTimeString(totalCounselingTime),
                    mostFrequentEmotion,
                    emotionCounts,
                    counselingDetails
            );

            return ResponseDto.setSuccessData("대시보드 데이터 조회 성공", response, HttpStatus.OK);

        } else {
            Counselor counselor = counselorRepository.findByEmail(counselorEmail)
                    .orElseThrow(() -> new IllegalArgumentException("해당 상담사가 존재하지 않습니다."));
            List<Client> clients = clientService.getClientsByLoggedInCounselor().getData();
            Client client = clients.stream().filter(c -> c.getId().equals(clientId)).findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("해당 내담자가 존재하지 않습니다."));
            List<Session> sessions = sessionRepository.findByCounselorAndClient(counselor, client);

            List<String> emotions = new ArrayList<>();

            // 상담 내역 데이터
            List<CounselingDetailDto> counselingDetails = sessions.stream().map(
                    session -> {
                        List<EmotionAnalysisReport> emotionAnalysisReports = emotionAnalysisReportRepository.findAllBySession(session);
                        List<AnalysisDto> analysisDtoList = emotionAnalysisReports.stream().map(
                                emotionAnalysisReport -> {
                                    emotions.add(emotionAnalysisReport.getDominantEmotion());
                                    return new AnalysisDto(
                                            emotionAnalysisReport.getId(),
                                            emotionAnalysisReport.getSpeakerLabel(),
                                            emotionAnalysisReport.getSentenceText(),
                                            emotionAnalysisReport.getDominantEmotion(),
                                            convertStringToList(emotionAnalysisReport.getKeywords()),
                                            emotionAnalysisReport.getAnalysisSummary(),
                                            emotionAnalysisReport.getSession().getId() // 추가된 부분
                                    );
                                }
                        ).toList();

                        return new CounselingDetailDto(
                                session.getId(),
                                session.getClient().getName(),
                                convertTimestampToString(session.getSessionDate()),
                                session.getMinuteOfCounseling(),
                                analysisDtoList
                        );
                    }
            ).toList();

            // 감정 분석 결과 데이터
            Map<String, Integer> emotionCounts = countEmotions(emotions);

            // 대시보드 상단 데이터
            String mostFrequentEmotion = findMostFrequentEmotion(emotionCounts);
            totalClientCount = clients.size();
            totalSessionCount = sessions.size();
            totalCounselingTime = sessions.stream().mapToInt(Session::getMinuteOfCounseling).sum();

            DashboardResponseDto response = new DashboardResponseDto(
                    totalClientCount,
                    totalSessionCount,
                    convertMinutesToTimeString(totalCounselingTime),
                    mostFrequentEmotion,
                    emotionCounts,
                    counselingDetails
            );

            return ResponseDto.setSuccessData("대시보드 데이터 조회 성공", response, HttpStatus.OK);
        }
    }



    // 계산로직들
    private static Map<String, Integer> countEmotions(List<String> emotions) {
        Map<String, Integer> emotionCounts = new HashMap<>();
        for (String emotion : emotions) {
            if (emotion != null) {
                emotionCounts.put(emotion, emotionCounts.getOrDefault(emotion, 0) + 1);
            }
        }
        return emotionCounts;
    }
    private static String findMostFrequentEmotion(Map<String, Integer> emotionCounts) {
        String mostFrequent = null;
        int maxCount = 0;
        for (Map.Entry<String, Integer> entry : emotionCounts.entrySet()) {
            if (entry.getValue() > maxCount) {
                mostFrequent = entry.getKey();
                maxCount = entry.getValue();
            }
        }
        return mostFrequent;
    }
    public static String convertMinutesToTimeString(int totalMinutes) {
        if (totalMinutes < 0) {
            throw new IllegalArgumentException("시간 값은 음수일 수 없습니다.");
        }

        int hours = totalMinutes / 60;  // 시간을 계산
        int minutes = totalMinutes % 60; // 남은 분 계산

        return hours + "시간 " + minutes + "분";
    }

    public static List<String> convertStringToList(String data) {
        if (data == null || data.isEmpty()) {
            return new ArrayList<>();
        }

        // 대괄호 제거 및 문자열 분리
        String cleanedData = data.replace("[", "").replace("]", "").replace("\"", "");
        return Arrays.asList(cleanedData.split(","));
    }
    public static String convertTimestampToString(Timestamp timestamp) {
        if (timestamp == null) {
            throw new IllegalArgumentException("Timestamp 값이 null입니다.");
        }

        // SimpleDateFormat을 사용해 원하는 형식으로 변환
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        return sdf.format(timestamp);
    }
}