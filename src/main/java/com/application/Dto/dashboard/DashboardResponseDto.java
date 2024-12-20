package com.application.Dto.dashboard;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardResponseDto {
    private int totalClientCount;
    private int totalCounselingCount;
    private String totalCounselingTime;
    private String mostFrequencyEmotion;
    private Map<String, Integer> counselingCountByEmotion;
    private List<CounselingDetailDto> counselingDetails;
}
