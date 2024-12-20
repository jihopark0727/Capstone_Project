// AuthService.java
package com.application.Service;

import com.application.Dto.CounselorDto;
import com.application.Dto.LoginResponseDto;
import com.application.Dto.ResponseDto;
import com.application.Dto.SignUpDto;
import com.application.Dto.LoginDto;
import com.application.Entity.Counselor;
import com.application.Repository.CounselorRepository;
import com.application.Security.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final CounselorRepository counselorRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;

    // 회원가입
    public ResponseDto<?> signUp(SignUpDto dto) {
        String email = dto.getEmail();

        // 이메일 중복 확인
        if (counselorRepository.existsByEmail(email)) {
            return ResponseDto.setFailed("중복된 Email 입니다.", HttpStatus.BAD_REQUEST);
        }

        // 비밀번호 암호화
        String hashedPassword = passwordEncoder.encode(dto.getPassword());

        // Counselor 엔티티 생성 및 저장
        Counselor counselor = Counselor.builder()
                .email(email)
                .password(hashedPassword)
                .name(dto.getName())
                .phoneNumber(dto.getPhoneNumber())
                .build();

        try {
            counselorRepository.save(counselor);
        } catch (Exception e) {
            return ResponseDto.setFailed("데이터베이스 연결에 실패하였습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseDto.setSuccess("상담사 회원 생성에 성공했습니다.", HttpStatus.CREATED);
    }

    // 상담사 로그인
    public ResponseDto<LoginResponseDto> login(LoginDto dto) {
        String email = dto.getEmail();
        String password = dto.getPassword();

        // 이메일로 상담사 계정 찾기
        Optional<Counselor> counselorOpt = counselorRepository.findByEmail(email);
        if (counselorOpt.isEmpty()) {
            return ResponseDto.setFailed("입력하신 이메일로 등록된 상담사 계정이 존재하지 않습니다.", HttpStatus.NOT_FOUND);
        }

        Counselor counselor = counselorOpt.get();

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, counselor.getPassword())) {
            return ResponseDto.setFailed("비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED);
        }

        // JWT 토큰 생성
        int exprTime = 60 * 60 * 24; // 1시간 유효
        String token = tokenProvider.createJwt(email, exprTime);
        if (token == null) {
            return ResponseDto.setFailed("토큰 생성에 실패하였습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        counselorRepository.save(counselor);

        // CounselorDto 객체 생성
        CounselorDto counselorDto = new CounselorDto(
                counselor.getId(),
                counselor.getEmail(),
                counselor.getName(), // 상담사 이름
                counselor.getPhoneNumber()
        );

        // LoginResponseDto 생성
        LoginResponseDto loginResponseDto = new LoginResponseDto(
                token, // JWT 토큰
                exprTime, // 토큰 유효 기간
                counselorDto // 상담사 정보
        );
        counselor.setLastLoginAt(Timestamp.from(Instant.now()));
        counselorRepository.save(counselor);
        System.out.println(loginResponseDto);
        // 성공 응답
        return ResponseDto.setSuccessData("상담사 로그인에 성공하였습니다.", loginResponseDto, HttpStatus.OK);
    }

}
