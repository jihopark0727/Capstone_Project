package com.application.Entity;

import lombok.*;
import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "session_recordings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionRecording {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 고유 파일 ID

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private Session session; // 상담 세션 ID (외래 키)

    @Column(name = "file_path", nullable = false, length = 255)
    private String filePath; // 파일 경로

    @Column(name = "file_size", nullable = false)
    private Long fileSize; // 파일 크기 (바이트 단위)

    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType; // 파일 타입 (예: audio/mp3)

    @Column(name = "uploaded_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp uploadedAt; // 업로드 시간
}