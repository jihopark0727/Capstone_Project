package com.application.Entity;

import lombok.*;
import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.Set;

@Entity
@Table(name = "sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_number")
    private Integer sessionNumber;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "counselor_id")
    private Counselor counselor;

    //TODO: 상담 시간 컬럼 추가했어요
    @Column(name = "minute_of_counseling")
    private Integer minuteOfCounseling;

    @Column(name = "session_date")
    private Timestamp sessionDate;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SessionRecording> sessionRecordings;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EmotionAnalysisReport> emotionAnalysisReports;
}
