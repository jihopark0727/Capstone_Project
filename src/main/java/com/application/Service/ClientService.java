package com.application.Service;

import com.application.Dto.ClientRequestDto;
import com.application.Dto.ClientResponseDto;
import com.application.Dto.ResponseDto;
import com.application.Entity.*;
import com.application.Repository.*;
import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClientService {

    private static final Logger logger = LoggerFactory.getLogger(ClientService.class);

    private final ClientRepository clientRepository;
    private final CounselorRepository counselorRepository;
    private final CounselorClientRepository counselorClientRepository;
    private final CounselingTopicRepository counselingTopicRepository;
    private final SessionRepository sessionRepository;
    private final EmotionAnalysisReportRepository emotionAnalysisReportRepository;

    @Autowired
    public ClientService(ClientRepository clientRepository,
                         CounselorRepository counselorRepository, CounselorClientRepository counselorClientRepository, CounselingTopicRepository counselingTopicRepository, SessionRepository sessionRepository, EmotionAnalysisReportRepository emotionAnalysisReportRepository) {
        this.clientRepository = clientRepository;
        this.counselorRepository = counselorRepository;
        this.counselorClientRepository = counselorClientRepository;
        this.counselingTopicRepository = counselingTopicRepository;
        this.sessionRepository = sessionRepository;
        this.emotionAnalysisReportRepository = emotionAnalysisReportRepository;
    }


    public ResponseDto<ClientResponseDto> getClientById(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new NoSuchElementException("Client not found with ID: " + clientId));

        ClientResponseDto clientResponseDto = new ClientResponseDto(
                client.getId(),
                client.getName(),
                client.getAge(),
                client.getGender(),
                client.getContactNumber(),
                client.getTopic(),
                client.getRegistrationDate().toString(),
                client.getRegistrationStatus()
        );

        return ResponseDto.setSuccessData("내담자 조회 성공", clientResponseDto, HttpStatus.OK);
    }



    public ResponseDto<Client> addClient(Client client) {
        // 현재 로그인된 상담사 정보 가져오기
        Counselor counselor = getLoggedInCounselor();

        // 내담자 저장
        Client savedClient = clientRepository.save(client);

        // 상담사-내담자 관계 설정 및 주제 저장
        CounselorClient counselorClient = CounselorClient.builder()
                .counselor(counselor)
                .client(savedClient)
                .build();

        counselorClientRepository.save(counselorClient); // 새로운 테이블에 저장

        ResponseDto<Client> response = ResponseDto.setSuccessData("내담자 추가 성공", savedClient, HttpStatus.CREATED);
        System.out.println("ResponseDto content: " + response);
        return response;
    }


    public ResponseDto<Client> updateClient(Long clientId, ClientRequestDto clientRequestDto) {
        return clientRepository.findById(clientId)
                .map(client -> {
                    // 내담자 정보 업데이트
                    client.setRegistrationStatus(clientRequestDto.getRegistrationStatus());
                    client.setName(clientRequestDto.getName());
                    client.setContactNumber(clientRequestDto.getContactNumber());
                    client.setGender(clientRequestDto.getGender());
                    client.setBirthDate(clientRequestDto.getBirth());
                    client.setAge(client.calculateAge(clientRequestDto.getBirth())); // 나이 계산
                    client.setTopic(clientRequestDto.getTopic());

                    clientRepository.save(client);

                    return ResponseDto.setSuccessData("내담자 정보 및 주제 업데이트 성공", client, HttpStatus.OK);
                })
                .orElse(ResponseDto.setFailed("내담자 ID가 존재하지 않습니다.", HttpStatus.NOT_FOUND));
    }



    @Transactional
    public ResponseDto<String> deleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Client not found with ID: " + id));
        CounselorClient counselorClient = counselorClientRepository.findByClient(client)
                .orElseThrow(() -> new NoSuchElementException("CounselorClient not found with client ID: " + id));
        List<Session> sessions = sessionRepository.findByClientId(client.getId());
        sessions.forEach(session -> {
            emotionAnalysisReportRepository.deleteAllBySessionId(session.getId());
        });
        sessionRepository.deleteAllByClientId(client.getId());
        counselorClientRepository.delete(counselorClient);
        clientRepository.deleteById(client.getId());
        return ResponseDto.setSuccess("내담자 삭제 성공", HttpStatus.OK);
    }

    public ResponseDto<List<Client>> getClientsByLoggedInCounselor() {
        Counselor counselor = getLoggedInCounselor();

        logger.info("Logged-in counselor: {}", counselor);

        // 상담사-내담자 관계 조회
        List<CounselorClient> counselorClients = counselorClientRepository.findByCounselor(counselor);
        logger.info("Counselor clients found: {}", counselorClients);
        counselorClients.forEach(cc -> logger.info("Client: {}", cc.getClient()));

        // CounselorClient에서 Client만 추출
        List<Client> clients = counselorClients.stream()
                .map(CounselorClient::getClient) // Client 객체만 추출
                .collect(Collectors.toList());

        return ResponseDto.setSuccessData("상담사의 내담자 조회 성공", clients, HttpStatus.OK);
    }


    // 현재 로그인된 상담사 정보 가져오기
    Counselor getLoggedInCounselor() {
        String loggedInCounselorEmail = getCurrentUserEmail();
        logger.info("email {}", loggedInCounselorEmail);
        return counselorRepository.findByEmail(loggedInCounselorEmail)
                .orElseThrow(() -> new RuntimeException("상담사 정보를 찾을 수 없습니다."));
    }

    // 현재 로그인된 사용자의 이메일을 가져오는 메서드
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("Authentication object is null or user is not authenticated");
            throw new RuntimeException("인증된 사용자가 아닙니다.");
        }

        logger.info("Authenticated user's email: {}", authentication.getName());
        return authentication.getName();
    }


    public ResponseDto<List<String>> getCounselingTopics() {
        List<String> topics = counselingTopicRepository.findAll().stream()
                .map(CounselingTopic::getTopicName)
                .collect(Collectors.toList());
        return ResponseDto.setSuccessData("상담 주제 목록 조회 성공", topics, HttpStatus.OK);
    }

    public ResponseDto<Client> putClient(ClientRequestDto clientRequestDto, Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new NoSuchElementException("Client not found with ID: " + clientId));
        client.setName(clientRequestDto.getName());
        client.setContactNumber(clientRequestDto.getContactNumber());
        client.setGender(clientRequestDto.getGender());
        client.setBirthDate(clientRequestDto.getBirth());
        client.setAge(client.calculateAge(clientRequestDto.getBirth()));
        client.setTopic(clientRequestDto.getTopic());
        client.setRegistrationStatus(clientRequestDto.getRegistrationStatus());

        clientRepository.save(client);
        return ResponseDto.setSuccessData("내담자 정보 수정 성공", client, HttpStatus.OK);
    }
}
