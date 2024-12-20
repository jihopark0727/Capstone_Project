package com.application.Controller;

import com.application.Dto.LoginDto;
import com.application.Dto.ResponseDto;
import com.application.Dto.SignUpDto;
import com.application.Entity.Counselor;
import com.application.Service.AuthService;
import com.application.Repository.CounselorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final CounselorRepository counselorRepository;

    @PostMapping("/signUp")
    public ResponseDto<?> signup(@RequestBody SignUpDto requestBody) {
        return authService.signUp(requestBody);
    }

    @PostMapping("/login")
    public ResponseDto<?> login(@RequestBody LoginDto requestBody) {
        return authService.login(requestBody);
    }

    @GetMapping("/me")
    public ResponseDto<Counselor> getLoggedInCounselor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("인증되지 않은 사용자가 /me 엔드포인트에 접근했습니다.");
            throw new RuntimeException("인증되지 않은 사용자입니다.");
        }

        String loggedInCounselorEmail = authentication.getName();
        logger.info("Logged in counselor email: {}", loggedInCounselorEmail);

        Optional<Counselor> counselorOpt = counselorRepository.findByEmail(loggedInCounselorEmail);
        Counselor counselor = counselorOpt.orElseThrow(() -> new RuntimeException("상담사 정보를 찾을 수 없습니다. 이메일: " + loggedInCounselorEmail));

        return ResponseDto.setSuccessData("로그인된 상담사 정보 조회 성공", counselor, HttpStatus.OK);
    }
}
