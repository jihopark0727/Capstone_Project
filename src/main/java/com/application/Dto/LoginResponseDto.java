package com.application.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDto {

    private String token;
    private int expiresIn; // 토큰 유효기간 (초 단위)
    private CounselorDto counselor; // Counselor 정보를 담는 DTO로 참조
}
