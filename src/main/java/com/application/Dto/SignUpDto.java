package com.application.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignUpDto {

    @NotBlank(message = "이메일을 입력해 주세요.")
    @Email(message = "유효한 이메일 주소를 입력해 주세요.")
    private String email;           // 이메일 주소

    @NotBlank(message = "이름을 입력해 주세요.")
    private String name;            // 사용자 이름

    @NotBlank(message = "비밀번호를 입력해 주세요.")
    @Size(min = 8, message = "비밀번호는 최소 8자리 이상이어야 합니다.")
    private String password;        // 비밀번호

    @NotBlank(message = "비밀번호 확인을 입력해 주세요.")
    private String confirmPassword; // 비밀번호 확인

    @NotBlank(message = "전화번호를 입력해 주세요.")
    private String phoneNumber;     // 전화번호
}
