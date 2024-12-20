package com.application.Entity;

import com.application.Entity.Client;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "counseling_topics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "topic_name", nullable = false, length = 255,  unique = true)
    private String topicName;
}
