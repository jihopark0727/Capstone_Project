package com.application.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AIAnalysisResult {

    private int sentenceNumber;    // 문장 번호 (세션 내 문장 순서)
    private String sentenceText;   // 분석된 문장 내용
    private String emotion;        // 감정 분석 결과 (예: "기쁨", "슬픔", "분노" 등)
    private String keywords;       // 문장에 대한 주요 키워드 (쉼표로 구분된 문자열)
    private String analysisSummary;
    // 필요한 경우 추가할 수 있는 필드 예시:
    // private double confidenceScore; // 감정 분석 신뢰도 점수
}
