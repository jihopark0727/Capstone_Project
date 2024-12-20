package com.application.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.HashSet;
import java.util.Set;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column
    private Integer age;

    @Column(length = 10)
    private String gender;

    @Column(name = "contact_number", length = 20)
    private String contactNumber; // 연락처 추가

    @Column
    private String topic;

    @Column(name = "birth_date")
    private LocalDate birthDate; // 생년월일 추가

    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate = LocalDate.now(); // 등록 날짜

    @Column(name = "registration_status", length = 50, nullable = false)
    private String registrationStatus = "unassigned"; // 기본값 설정

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CounselorClient> counselorClients = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "emotion_map_id", referencedColumnName = "id")
    private EmotionMap emotionMap; // 감정 지도와의 관계

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    // 엔티티가 처음 생성될 때 자동으로 시간 설정
    @PrePersist
    protected void onCreate() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
        this.updatedAt = this.createdAt;
    }

    // 엔티티가 업데이트될 때 자동으로 수정 시간 설정
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

    public int calculateAge(LocalDate birthDate) {
        if (birthDate == null) {
            throw new IllegalArgumentException("Birth date cannot be null");
        }
        LocalDate today = LocalDate.now();
        if (birthDate.isAfter(today)) {
            throw new IllegalArgumentException("Birth date cannot be in the future");
        }

        return Period.between(birthDate, today).getYears();
    }

}


