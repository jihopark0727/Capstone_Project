package com.application.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "counselor_clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselorClient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "counselor_id", nullable = false)
    private Counselor counselor;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    @JsonBackReference // 순환 참조 방지
    private Client client;

}
