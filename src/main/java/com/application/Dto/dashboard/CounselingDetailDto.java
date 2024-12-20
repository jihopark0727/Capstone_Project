package com.application.Dto.dashboard;


import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingDetailDto {
    private Long id;
    private String clientName;
    private String data;
    private Integer duration;
    private List<AnalysisDto> analysisData;

}
