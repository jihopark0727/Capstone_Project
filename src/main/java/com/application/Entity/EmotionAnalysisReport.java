package com.application.Entity;

import lombok.*;
import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "emotion_analysis_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmotionAnalysisReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(name = "client_id", nullable = false)
    private Long clientId;  // 새로 추가된 필드

    @Column(name = "sentence_number")
    private Integer sentenceNumber;

    //TODO: DB 컬럼 추가했어요
    @Column(name = "speaker_label")
    private Integer speakerLabel;

    @Column(name = "sentence_text", nullable = false)
    private String sentenceText;

    private String dominantEmotion;
    private String keywords;  // Assuming JSON as String

    @Column(name = "analysis_summary")
    private String analysisSummary;

    @Column(name = "analyzed_at")
    private Timestamp analyzedAt;
}
