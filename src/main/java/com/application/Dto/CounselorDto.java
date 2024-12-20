package com.application.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor // 모든 필드를 포함하는 생성자 자동 생성
@NoArgsConstructor  // 기본 생성자 자동 생성
public class CounselorDto {
    private Long id;
    private String email;
    private String name;
    private String phoneNumber;
}
