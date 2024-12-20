package com.application.Entity;

import lombok.*;
import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "emotion_maps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmotionMap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "client_id")
    private Client client;

    private String dominantEmotion;
    private String keywordSummary;
    private String analysisSummary;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;
}
