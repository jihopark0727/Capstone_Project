package com.application.Dto.dashboard;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisDto {
    private Long id;
    private Integer speakerLabel;
    private String text;
    private String emotion;
    private List<String> keywords;
    private String analysisSummary;
    private Long sessionId;
}
